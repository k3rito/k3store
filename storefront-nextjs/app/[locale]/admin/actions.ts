'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSetting(key: string, value: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')

  const { error } = await supabase.from('site_settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' })

  if (error) {
    console.error('Failed to update setting:', error)
    throw new Error(`Failed to update setting: ${error.message}`)
  }

  revalidatePath('/', 'layout')
}

export async function updateCategoryOrder(items: { id: string; display_order: number }[]) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')

  for (const item of items) {
    const { error } = await supabase.from('categories').update({ display_order: item.display_order }).eq('id', item.id)
    if (error) {
      console.error('Failed to reorder category:', error)
      throw new Error(`Failed to reorder: ${error.message}`)
    }
  }

  revalidatePath('/', 'layout')
}

export async function deleteProduct(id: string) {
  try {
    const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Cannot delete product because it is part of existing orders.' }
      }
      return { success: false, error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

// ================= Categories CRUD =================
export async function createCategory(nameEn: string, nameAr: string, imageUrl?: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')
  const { error } = await supabase.from('categories').insert({
    name_en: nameEn,
    name_ar: nameAr,
    image_url: imageUrl,
    status: 'active'
  })
  if (error) {
    console.error('Failed to create category:', error)
    throw new Error(`Failed to create category: ${error.message}`)
  }
  revalidatePath('/', 'layout')
}

export async function updateCategory(id: string, nameEn: string, nameAr: string, imageUrl?: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')
  const { error } = await supabase.from('categories').update({
    name_en: nameEn,
    name_ar: nameAr,
    image_url: imageUrl
  }).eq('id', id)
  if (error) {
    console.error('Failed to update category:', error)
    throw new Error(`Failed to update category: ${error.message}`)
  }
  revalidatePath('/', 'layout')
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    console.error('Failed to delete category:', error)
    throw new Error(`Failed to delete category: ${error.message}`)
  }
  revalidatePath('/', 'layout')
}

// ================= Products CRUD =================
export async function createProduct(data: {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  stock_quantity: number;
  category_id?: string;
  image_url?: string;
  status: string;
}) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')

  // Map stock_quantity from form → stock column in DB
  const payload: any = {
    name_en: data.name_en,
    name_ar: data.name_ar,
    description_en: data.description_en,
    description_ar: data.description_ar,
    price: data.price,
    stock: data.stock_quantity,
    image_url: data.image_url || null,
    status: data.status || 'active',
  }

  // Only include category_id if it's a valid non-empty value
  if (data.category_id && data.category_id.trim() !== '') {
    payload.category_id = data.category_id
  }

  const { error } = await supabase.from('products').insert(payload)

  if (error) {
    console.error('Failed to create product:', error)
    throw new Error(`Failed to create product: ${error.message}`)
  }

  revalidatePath('/', 'layout')
}

export async function updateProduct(id: string, data: Partial<{
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  stock_quantity: number;
  category_id?: string;
  image_url?: string;
  status: string;
}>) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')

  // Map stock_quantity → stock for DB
  const payload: any = { ...data }
  if ('stock_quantity' in payload) {
    payload.stock = payload.stock_quantity
    delete payload.stock_quantity
  }
  if (payload.category_id === '' || payload.category_id === undefined) {
    payload.category_id = null
  }

  const { error } = await supabase.from('products').update(payload).eq('id', id)

  if (error) {
    console.error('Failed to update product:', error)
    throw new Error(`Failed to update product: ${error.message}`)
  }

  revalidatePath('/', 'layout')
}

// ================= RBAC Helper =================
type AppRole = 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'user'

async function requireRole(...allowedRoles: AppRole[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Prioritize role from JWT metadata to avoid recursion and extra DB hits
  let role = user.app_metadata?.role as AppRole

  // Fallback to DB check ONLY if metadata is missing (e.g., first login after migration)
  if (!role) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role as AppRole
  }

  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Insufficient permissions')
  }

  return { supabase, userId: user.id, role }
}

// ================= Staff / Users Management =================
export async function updateUserRole(targetUserId: string, newRole: AppRole) {
  const { supabase, userId: callerId, role: callerRole } = await requireRole('super_admin', 'supervisor')

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()
  if (!targetProfile) throw new Error('Target user not found')

  // super_admin CAN modify self (e.g., transfer privileges). Supervisors cannot.
  if (targetUserId === callerId && callerRole !== 'super_admin') {
    throw new Error('Cannot change your own role')
  }

  // Supervisors cannot modify super_admin accounts
  if (callerRole === 'supervisor' && targetProfile.role === 'super_admin') {
    throw new Error('Supervisors cannot modify Super Admin accounts')
  }

  // Supervisors cannot promote anyone to super_admin
  if (callerRole === 'supervisor' && newRole === 'super_admin') {
    throw new Error('Supervisors cannot promote to Super Admin')
  }

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId)
  if (error) {
    console.error('Failed to update user role:', error)
    throw new Error(`Could not update role: ${error.message}`)
  }
  revalidatePath('/', 'layout')
}

export async function addStaffMember(email: string, role: AppRole) {
  const { supabase, role: callerRole } = await requireRole('super_admin', 'supervisor')

  if (callerRole === 'supervisor' && role === 'super_admin') {
    throw new Error('Supervisors cannot assign Super Admin role')
  }

  // Find user by email
  const { data: profile, error: findErr } = await supabase
    .from('profiles').select('id, role').eq('email', email).single()
  if (findErr || !profile) throw new Error('No user found with that email address')

  if (['super_admin', 'supervisor', 'employee', 'editor'].includes(profile.role)) {
    throw new Error('This user already has an admin role: ' + profile.role)
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
  if (error) throw new Error(`Failed to assign role: ${error.message}`)
  revalidatePath('/', 'layout')
}

export async function revokeAccess(targetUserId: string) {
  const { supabase, userId: callerId, role: callerRole } = await requireRole('super_admin', 'supervisor')

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()
  if (!targetProfile) throw new Error('User not found')

  if (targetUserId === callerId) throw new Error('Cannot revoke your own access')
  if (callerRole === 'supervisor' && targetProfile.role === 'super_admin') {
    throw new Error('Supervisors cannot revoke Super Admin access')
  }

  const { error } = await supabase.from('profiles').update({ role: 'user' }).eq('id', targetUserId)
  if (error) throw new Error(`Failed to revoke access: ${error.message}`)
  revalidatePath('/', 'layout')
}

// ================= CMS Dynamic Pages =================
export async function saveDynamicPage(id: string, data: {
  page_name: string; slug: string; icon: string; display_order: number;
  content: any; content_ar?: any; meta_title?: string; meta_description?: string; custom_slug?: string;
  language?: 'en' | 'ar';
}) {
  const { supabase, userId, role } = await requireRole('super_admin', 'supervisor', 'editor')

  // Determine status based on role
  const isEditor = role === 'editor'
  const status = isEditor ? 'pending_approval' : 'published'

  const updatePayload: any = {
    page_name: data.page_name,
    slug: data.slug,
    icon: data.icon,
    display_order: data.display_order,
    updated_at: new Date().toISOString(),
    updated_by: userId,
    status,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    custom_slug: data.custom_slug || null,
  }

  // Save content to correct language field
  if (data.language === 'ar') {
    updatePayload.content_ar = data.content
  } else {
    updatePayload.content = data.content
  }

  // If admin is publishing, mark approval
  if (!isEditor) {
    updatePayload.approved_by = userId
    updatePayload.approved_at = new Date().toISOString()
  }

  const { error } = await supabase.from('dynamic_pages').update(updatePayload).eq('id', id)
  if (error) {
    console.error('Failed to save dynamic page:', error)
    throw new Error(`Failed to save page: ${error.message}`)
  }
  revalidatePath('/', 'layout')
  return { status }
}

export async function approvePage(pageId: string) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor')
  const { error } = await supabase.from('dynamic_pages').update({
    status: 'published',
    approved_by: userId,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', pageId)
  if (error) throw new Error(`Failed to approve page: ${error.message}`)
  revalidatePath('/', 'layout')
}

export async function rejectPage(pageId: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { error } = await supabase.from('dynamic_pages').update({
    status: 'draft',
    updated_at: new Date().toISOString(),
  }).eq('id', pageId)
  if (error) throw new Error(`Failed to reject page: ${error.message}`)
  revalidatePath('/', 'layout')
}

export async function getPendingPages() {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { data, error } = await supabase
    .from('dynamic_pages')
    .select('id, page_name, slug, status, updated_at, updated_by')
    .eq('status', 'pending_approval')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch pending pages: ${error.message}`)
  return data || []
}

export async function createDynamicPage(pageName: string, slug: string, icon: string) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor', 'editor')
  const { data: maxData } = await supabase.from('dynamic_pages').select('display_order').order('display_order', { ascending: false }).limit(1)
  const nextOrder = (maxData && maxData.length > 0 ? maxData[0].display_order : 0) + 1

  const { data, error } = await supabase.from('dynamic_pages').insert({
    page_name: pageName,
    slug,
    icon,
    display_order: nextOrder,
    content: { content: [], root: {} },
    content_ar: { content: [], root: {} },
    status: 'draft',
    updated_by: userId || null,
  }).select().single()

  if (error) {
    console.error('Failed to create dynamic page:', error)
    throw new Error(`Failed to create page: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  return data
}

export async function deleteDynamicPage(id: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { error } = await supabase.from('dynamic_pages').delete().eq('id', id)
  if (error) {
    console.error('Failed to delete dynamic page:', error)
    throw new Error(`Failed to delete page: ${error.message}`)
  }
  revalidatePath('/', 'layout')
}

// ================= Audit Logging =================
export async function logAuditAction(action: string, targetId?: string, details?: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action,
    target_id: targetId,
    details
  })
}

// ================= Advanced HR Actions =================
export async function updateStaffProfile(staffId: string, data: { phone?: string, hire_date?: string, status?: string }) {
  const { supabase } = await requireRole('super_admin', 'supervisor')

  const { error } = await supabase.from('profiles').update(data).eq('id', staffId)
  if (error) throw new Error(`Failed to update staff: ${error.message}`)

  await logAuditAction('STAFF_PROFILE_UPDATE', staffId, data)
  revalidatePath('/', 'layout')
}

export async function deactivateStaff(staffId: string, reason: string) {
  const { supabase, userId: callerId } = await requireRole('super_admin', 'supervisor')
  if (staffId === callerId) throw new Error('Cannot deactivate your own account')

  const { error } = await supabase.from('profiles').update({ 
    status: 'Deactivated',
    deactivation_reason: reason,
    role: 'user' // Strip admin roles
  }).eq('id', staffId)
  
  if (error) throw new Error(`Failed to deactivate staff: ${error.message}`)

  await logAuditAction('STAFF_DEACTIVATE', staffId, { reason })
  revalidatePath('/', 'layout')
}

export async function getStaffAuditLogs(staffId: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles!actor_id(full_name)')
    .eq('target_id', staffId)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)
  return data
}

// ================= Newsletter Actions =================
export async function sendNewsletter(data: { subject: string, body: string, sender: string, attachment_url?: string, scheduled_at?: string }) {
  const { supabase } = await requireRole('super_admin', 'supervisor', 'editor')

  const { error } = await supabase.from('newsletters').insert({
    subject: data.subject,
    body: data.body,
    sender_email: data.sender,
    attachment_url: data.attachment_url,
    scheduled_at: data.scheduled_at,
    status: data.scheduled_at ? 'scheduled' : 'sent',
    sent_at: data.scheduled_at ? null : new Date().toISOString()
  })

  if (error) throw new Error(`Failed to queue newsletter: ${error.message}`)

  await logAuditAction('NEWSLETTER_SENT', undefined, { subject: data.subject })
  revalidatePath('/', 'layout')
}
