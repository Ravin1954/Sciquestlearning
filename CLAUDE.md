# SciQuest Learning — Claude Context

## Project
Full-stack Next.js 14 (App Router) web app for SciQuest Learning — a live science/math tutoring platform for middle & high school students. Live at https://sciquestlearning.com

## Owner
- Platform owner: Sabita Sudhakaran
- Admin email: admin@sciquestlearning.com (Google Workspace Business Starter, $6/month)
- Personal Gmail: krnath54@gmail.com (linked to Workspace account — same inbox)
- Gmail filter: `from:(noreply@sciquestlearning.com)` → Skip Inbox, Apply label "SciQuest"

## Node
Node is at `/opt/homebrew/bin/node`. Always export `PATH="/opt/homebrew/bin:$PATH"` before running npm/node commands.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- Clerk v7 for auth (Google + email; roles via `publicMetadata.role`: admin | instructor | student)
- Prisma v7 + PostgreSQL
- Stripe v20 + Stripe Connect (80/20 split — 80% instructor, 20% platform)
- Google Meet via service account with domain-wide delegation (auto-generates Meet links)
- Resend for transactional email from noreply@sciquestlearning.com
- Railway for hosting (auto-deploys on git push to main)
- GitHub repo: github.com/Ravin1954/Sciquestlearning

## Brand
- Navy `#0B1A2E`, Teal `#00C2A8`, Gold `#F5C842`
- Fonts: Fraunces (headings), DM Sans (body)
- All UI is dark-themed (white cards on light pages, dark navy backgrounds on dashboards)

## User Roles
- **Admin**: approve/reject courses, view all metrics/revenue, receive all notification emails
- **Instructor**: create courses (pending until approved), view earnings, manage enrollments, request refunds
- **Student**: browse approved courses, enroll via Stripe, join Google Meet sessions, report issues

## Key Technical Flows
1. Instructor submits course → PENDING → Admin approves → approval email sent → Meet link auto-generated
2. Student enrolls → Stripe Checkout → 80% to instructor (Stripe Connect), 20% platform → enrollment record created → Meet link assigned → confirmation email to student → notification email to instructor
3. Cron job every minute → find sessions starting in 19–21 min → send reminder emails via Resend
4. Instructor payout: held for 10 days after enrollment, then released to instructor's Stripe Connect account
5. Admin manually triggers payouts from admin dashboard

## Database (Prisma)
Schema at `prisma/schema.prisma`. Models: User, Course, Enrollment, Feedback. Enums: Role, Subject, CourseStatus.
- CourseType: LIVE | SELF_PACED
- CourseStatus: PENDING | APPROVED | REJECTED
- Role: ADMIN | INSTRUCTOR | STUDENT

## Environment Variables (set in Railway)
See `.env.example` for all required variables. Key ones:
- `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON from Google service account (must include opening `{`)
- `GOOGLE_MEET_IMPERSONATE_EMAIL` — Google Workspace email to impersonate for Meet creation
- `ADMIN_EMAIL` — admin@sciquestlearning.com
- `RESEND_FROM_EMAIL` — noreply@sciquestlearning.com
- `MAINTENANCE_MODE` — set to `true` to enable maintenance page, `false` or remove to disable

## Features Built

### Homepage (src/app/page.tsx)
- Hero section, features, subject cards, CTA
- About Us section (id="about") with 5 circular science images (150px, teal border) and two paragraphs
- Subjects: Biology, Chemistry, Physical Science, Mathematics

### Navigation (src/components/NavBar.tsx)
- Links: About Us (/#about), Browse Courses, Class Policies (logged out) / Student Policies (logged in student), Contact Us, Dashboard
- Sticky top navbar with SciQuest logo

### Sitemap (src/app/sitemap.ts)
- Includes: homepage, /courses, subject filters, /class-policies, /student-policies, /contact, /sign-in, /sign-up, all approved course pages

### Maintenance Mode (src/middleware.ts + src/app/maintenance/page.tsx)
- Set `MAINTENANCE_MODE=true` in Railway env vars → all visitors redirected to /maintenance page
- Shows logo, maintenance message, admin contact email
- To restore: set `MAINTENANCE_MODE=false` or delete the variable, then redeploy

### Admin Dashboard (src/app/admin/page.tsx)
- View all courses (pending/approved/rejected), approve/reject with remarks
- View all enrollments and revenue metrics
- Generate Meet link button (fallback — auto-generated on approval)
- Receive emails for: new course submissions, new enrollments, refund requests, student complaints

### Instructor Dashboard (src/app/instructor/)
- **My Courses page**: 
  - "Upcoming Classes" shows LIVE courses only (not self-paced)
  - Each course card shows: title, schedule, student count, next session time
  - "Open Meet Link" / "Start Class" button (glows teal when class is live within 30 min)
  - Roster button → expands list of enrolled students with name + email
  - **Manage Enrollment** button per student → shows refund request form (reason + amount) → emails admin
  - Message All Students form (sends email to all enrolled students)
  - Add Session Recordings (Google Drive / YouTube links)
- **Earnings page**: gross revenue, platform fee, net payout
- **Profile page**: personal details
- **New Course**: create course form (pending admin approval)

### Student Dashboard (src/app/student/page.tsx)
- Shows all enrolled courses with subject badge, type badge, instructor name
- Live courses: "Join Class" button appears 20 min before session, with student name reminder
- Self-paced: "Access Course" button, expiry date, "Renew Access" button
- Feedback form per live course (rating 1-5 stars, attended yes/no, comment)
- **Report Issue** button per enrollment → sends complaint email to admin

### Refund Policy (implemented in UI, manual processing by admin)
- Student cancels 24hrs before class → admin refunds full amount
- Student attends 4-5 of 16 sessions and stops → no refund
- Instructor misses a class → instructor submits refund request with prorated amount and reason → admin processes via Stripe
- Within 10 days of enrollment (instructor not yet paid): SciQuest covers refund
- After 10 days (instructor already paid): instructor calculates prorated amount, submits request, SciQuest refunds student

### Email Notifications (src/lib/resend.ts)
All sent from noreply@sciquestlearning.com to admin@sciquestlearning.com or relevant user:
- Admin: new course submission, new enrollment, new user signup, contact form, refund request, student complaint
- Instructor: course approved, course rejected, new enrollment notification, no-show warning, session cancelled
- Student: enrollment confirmation with Meet link, session reminder (20 min before), access expiry warning

### Policies Pages
- /class-policies — for instructors and logged-out visitors
- /student-policies — for logged-in students

### Google Meet Integration (src/lib/google-meet.ts)
- Uses GOOGLE_SERVICE_ACCOUNT_JSON (full JSON, not path) + GOOGLE_MEET_IMPERSONATE_EMAIL
- Meet link auto-generated when admin approves a LIVE course
- Admin can manually regenerate via "Generate Meet Link" button
- Meet link stored in course.zoomJoinUrl and course.zoomStartUrl (legacy field names, but stores Meet URL)
- Meet link also copied to each enrollment.zoomJoinUrl

### Stripe Integration
- Checkout: src/app/api/checkout/route.ts
- Webhook: src/app/api/webhooks/stripe/route.ts (handles payment_intent.succeeded)
- Connect: src/app/api/stripe/connect/route.ts
- Renewal: src/app/api/checkout/renew/route.ts
- Payouts: src/app/api/admin/payouts/route.ts

## Infrastructure (Railway)
- One active PostgreSQL service (postgres-volume-zZdA)
- One web service (the Next.js app)
- Deleted unused services: postgres-volume-69DL (0B usage), function-bun (sleeping), soothing-empathy (never deployed)
- UptimeRobot monitoring sciquestlearning.com every 5 minutes — alerts admin@sciquestlearning.com if site goes down

## Key API Routes
- POST /api/admin/courses/[id]/generate-meet — regenerate Meet link
- POST /api/instructor/courses/[id]/refund-request — instructor submits refund request to admin
- POST /api/student/report — student submits complaint to admin
- GET /api/instructor/courses/[id]/roster — returns enrolled students with enrollmentId and amountPaidUsd
- POST /api/instructor/courses/[id]/message — send email to all enrolled students
