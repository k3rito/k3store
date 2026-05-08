'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type AppRole = 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'user'

// ── Authorization Utility ──
async function requireRole(...allowedRoles: AppRole[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const role = (user.app_metadata?.role as AppRole) || 'user'

  if (!allowedRoles.includes(role)) {
    throw new Error('Insufficient permissions')
  }

  return { supabase, userId: user.id, role }
}

// ── Validation Schemas ──
const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})

// ── Server Actions ──

export async function updateSetting(key: string, value: string) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor')

  const validated = settingSchema.parse({ key, value })

  const { error } = await supabase.from('site_settings').upsert({
    key: validated.key,
    value: validated.value,
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' })

  if (error) throw new Error(`Failed to update setting: ${error.message}`)

  await logAuditAction('SETTING_UPDATE', undefined, { key: validated.key }, supabase, userId)
  revalidatePath('/', 'layout')
}

export async function deleteProduct(id: string) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor', 'editor')

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') return { success: false, error: 'Product is linked to existing orders.' }
    throw new Error(error.message)
  }

  await logAuditAction('PRODUCT_DELETE', id, undefined, supabase, userId)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateUserRole(targetUserId: string, newRole: AppRole) {
  const { supabase, userId: callerId, role: callerRole } = await requireRole('super_admin', 'supervisor')

  // Prevent self-demotion or self-modification if not super_admin
  if (targetUserId === callerId && callerRole !== 'super_admin') throw new Error('Cannot self-modify administrative role')

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()
  if (!targetProfile) throw new Error('Target user not found')

  if (callerRole === 'supervisor' && (targetProfile.role === 'super_admin' || newRole === 'super_admin')) {
      throw new Error('Supervisor permission limit: Cannot modify or grant Super Admin roles')
  }

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId)
  if (error) throw new Error(error.message)

  await logAuditAction('USER_ROLE_UPDATE', targetUserId, { oldRole: targetProfile.role, newRole }, supabase, callerId)
  revalidatePath('/', 'layout')
}

// ── Shared Internal Audit Logger ──
async function logAuditAction(action: string, targetId: string | undefined, details: any, supabase: any, userId: string) {
  // Use upsert or insert into audit_logs. Ensure target_id is UUID or null.
  await supabase.from('audit_logs').insert({
    actor_id: userId,
    action,
    target_id: targetId && targetId.includes('-') ? targetId : null,
    details
  })
}

// ── Staff & HR ──

export async function updateStaffProfile(staffId: string, data: { phone?: string, hire_date?: string, status?: string }) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor')
  const { error } = await supabase.from('profiles').update(data).eq('id', staffId)
  if (error) throw new Error(error.message)

  await logAuditAction('STAFF_PROFILE_UPDATE', staffId, data, supabase, userId)
  revalidatePath('/', 'layout')
}

// ── CMS Pages ──

export async function saveDynamicPage(id: string, data: {
    page_name: string; slug: string; icon: string; display_order: number;
    content: any; content_ar?: any; meta_title?: string; meta_description?: string; custom_slug?: string;
    language?: 'en' | 'ar';
}) {
  const { supabase, userId, role } = await requireRole('super_admin', 'supervisor', 'editor')
  const status = role === 'editor' ? 'pending_approval' : 'published'

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

  if (data.language === 'ar') {
    updatePayload.content_ar = data.content
  } else {
    updatePayload.content = data.content
  }

  if (status === 'published') {
    updatePayload.approved_by = userId
    updatePayload.approved_at = new Date().toISOString()
  }

  const { error } = await supabase.from('dynamic_pages').update(updatePayload).eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditAction('PAGE_SAVE', id, { status }, supabase, userId)
  revalidatePath('/', 'layout')
  return { status }
}

export async function approvePage(pageId: string) {
    const { supabase, userId } = await requireRole('super_admin', 'supervisor')
    const { error } = await supabase.from('dynamic_pages').update({
        status: 'published',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }).eq('id', pageId)
    if (error) throw new Error(error.message)
    await logAuditAction('PAGE_APPROVE', pageId, undefined, supabase, userId)
    revalidatePath('/', 'layout')
}

export async function rejectPage(pageId: string) {
    const { supabase, userId } = await requireRole('super_admin', 'supervisor')
    const { error } = await supabase.from('dynamic_pages').update({
        status: 'draft',
        updated_at: new Date().toISOString()
    }).eq('id', pageId)
    if (error) throw new Error(error.message)
    await logAuditAction('PAGE_REJECT', pageId, undefined, supabase, userId)
    revalidatePath('/', 'layout')
}

export async function createDynamicPage(pageName: string, slug: string, icon: string) {
    const { supabase, userId } = await requireRole('super_admin', 'supervisor', 'editor')
    const { data, error } = await supabase.from('dynamic_pages').insert({
        page_name: pageName,
        slug,
        icon,
        status: 'draft',
        updated_by: userId
    }).select().single()
    if (error) throw new Error(error.message)
    await logAuditAction('PAGE_CREATE', data.id, { pageName }, supabase, userId)
    revalidatePath('/', 'layout')
    return data
}

export async function deleteDynamicPage(id: string) {
    const { supabase, userId } = await requireRole('super_admin', 'supervisor')
    const { error } = await supabase.from('dynamic_pages').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await logAuditAction('PAGE_DELETE', id, undefined, supabase, userId)
    revalidatePath('/', 'layout')
}

export async function updateCategoryOrder(items: { id: string; display_order: number }[]) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor', 'editor')
  for (const item of items) {
    await supabase.from('categories').update({ display_order: item.display_order }).eq('id', item.id)
  }
  await logAuditAction('CATEGORY_REORDER', undefined, { count: items.length }, supabase, userId)
  revalidatePath('/', 'layout')
}

export async function addStaffMember(email: string, role: AppRole) {
  const { supabase, userId: callerId } = await requireRole('super_admin', 'supervisor')
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single()
  if (!profile) throw new Error('User not found by email')

  const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
  if (error) throw new Error(error.message)

  await logAuditAction('STAFF_ADD', profile.id, { role }, supabase, callerId)
  revalidatePath('/', 'layout')
}

export async function deactivateStaff(staffId: string, reason: string) {
  const { supabase, userId: callerId } = await requireRole('super_admin', 'supervisor')
  if (staffId === callerId) throw new Error('Cannot deactivate self')

  const { error } = await supabase.from('profiles').update({ status: 'Deactivated', deactivation_reason: reason, role: 'user' }).eq('id', staffId)
  if (error) throw new Error(error.message)
  
  await logAuditAction('STAFF_DEACTIVATE', staffId, { reason }, supabase, callerId)
  revalidatePath('/', 'layout')
}

export async function sendNewsletter(data: { subject: string, body: string, sender_email: string, attachment_url?: string }) {
  const { supabase, userId } = await requireRole('super_admin', 'supervisor', 'editor')
  const { error } = await supabase.from('newsletters').insert({ ...data, status: 'sent', sent_at: new Date().toISOString() })
  if (error) throw new Error(error.message)

  await logAuditAction('NEWSLETTER_SEND', undefined, { subject: data.subject }, supabase, userId)
  revalidatePath('/', 'layout')
}

export async function getStaffAuditLogs(staffId: string) {
  const { supabase } = await requireRole('super_admin', 'supervisor')
  const { data } = await supabase.from('audit_logs').select('*, profiles!actor_id(full_name)').eq('target_id', staffId).order('created_at', { ascending: false })
  return data
}
