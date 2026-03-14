# ENTERPRISE E-COMMERCE UPGRADE PIPELINE
**CRITICAL INSTRUCTION FOR AI AGENT:** This file contains a strict sequential pipeline for upgrading the application. You MUST execute these stages in order. Do not skip any tasks. 

## MASTER CONFIGURATION & STITCH API
Use the following API Key to authenticate and fetch UI components from Stitch:
* **Stitch API Key:** `AQ.Ab8RN6JFpcBm58Eo3GbD95c3Fiaw4GxxDkodd196Kvr5oiL1bQ`
* **Project Title:** med store ly
* **Project ID:** 3232457402150666297

---

## STAGE 1: UI INGESTION (FETCH SCREENS)
Before writing any backend code, use `curl -L` with the provided API key to fetch and integrate the following 6 screens from Stitch into the project components:
* **Loading Screen:** ID `defbfbcc17ff4ef8805c495676dbbb2e`
* **Profile Bubble:** ID `7984303a8f004778abe456529e3a5ec2`
* **Registration Page:** ID `ee86d8a6ee124bd6b3c38a2aa90f3d3e`
* **Cart Drawer Updates:** ID `e9640b415308423eafc5cdb3e2eed719`
* **Newsletter Composer:** ID `e22219a5e8f943a7b155bcdac3b81c06`
* **Advanced Staff & HR:** ID `a58d8d7a791b4731a46060ef1f13d49e`

---

## STAGE 2: GLOBAL STATE, UX & PERFORMANCE
* **Loading Screen:** Implement the fetched loading SVG globally to trigger during async actions (API calls, routing) so users know the site is working.
* **State Preservation:** Search for and REMOVE all instances of `window.location.reload()`. Replace them with Next.js `router.refresh()` and `revalidatePath` to update data without full page reloads.
* **Super AMOLED Dark Mode:** Implement a theme toggler with 3 exact states: `light`, `dark` (pure black `#000000`), and `system`.
* **Responsive Polish:** Fix all sidebar and window alignment issues across the app. Ensure perfect responsiveness across all mobile, tablet, and desktop viewports.
* **Performance & Speed:** Optimize fonts, image loading, and server response times. Implement Vercel Speed Insights (`@vercel/speed-insights/next`).

---

## STAGE 3: AUTHENTICATION & USER PROFILE
* **New Registration Flow:** Wire the fetched Sign-Up page. Enforce strong passwords (English chars only, numbers, symbols). Add a "Confirm Password" check and a "Terms & Conditions" mandatory checkbox.
* **Email Verification:** After sign-up, do NOT redirect to home. Show a waiting screen asking the user to verify their email. Once verified, automatically redirect to the site.
* **Profile Bubble:** Replace the header profile link with the fetched Popover UI. Display user name, email, role badge, completed orders, change password (via email link), and sign out button.

---

## STAGE 4: E-COMMERCE CORE (CART, CHECKOUT & REVIEWS)
* **Fix Order Creation Bug:** Fix the critical bug where items are not added to the `orders` table in the Admin Dashboard after a customer completes checkout. Ensure DB inserts work.
* **Payment Methods:** In the checkout flow, add selection options for "Cash on Delivery", "Bank Transfer", and "Cheque" (These are for Delivery only, not online processing).
* **Order Success Actions:** On the success page, wire buttons to Copy Order ID, Download as PDF, Print directly, and Share Order link.
* **Cart Export:** Wire the "Share Cart" feature in the cart drawer.
* **Reviews System:** Activate the 5-star review system. Wire it to save reviews to the Supabase DB and display them on the user's profile and the product pages.

---

## STAGE 5: ENTERPRISE ADMIN & HR SYSTEM
* **Eradicate Mock Data:** Remove ALL dummy data from Admin Overviews, Orders, and Previews. Connect them strictly to live Supabase data.
* **CMS Live Builder:** Fix the bug where previously created pages appear blank. Ensure any newly created page is automatically wired to the DB.
* **Advanced Staff Page:** Wire the fetched HR UI. Implement Role-Based Access Control (Manager, Supervisor, Writer, Accountant). Ensure this page ONLY shows users with roles, not regular customers.
* **Staff Features:** Implement the profile drawer (Personal info, Document Upload to Supabase Storage, Active/Leave status, KPI tracking, Audit Logs). Add an account "Deactivate" toggle (do not delete). Add search by name/email.
* **Newsletter Service:** Wire the fetched Newsletter page. Connect the sender dropdown, subject line, rich text body, PDF attachment upload, and schedule sending feature to a newsletter subscriber DB table.

---

## STAGE 6: SECURITY & SCALABILITY (FINAL AUDIT)
* **Security Checklist:** Audit all Supabase RLS policies. Ensure users can only access their data, and Admins can access all data. Protect all API routes.
* **Scalability Optimization:** Optimize database queries, implement proper pagination, and ensure the Next.js caching strategy is robust enough to handle high traffic spikes without crashing.