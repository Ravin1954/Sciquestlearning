# SciQuest Learning — Claude Context

## Project
Full-stack Next.js 14 (App Router) web app for SciQuest Learning — a live science/math tutoring platform for middle & high school students.

## Node
Node is at `/opt/homebrew/bin/node`. Always export `PATH="/opt/homebrew/bin:$PATH"` before running npm/node commands.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- Clerk v7 for auth (Google + email; roles via `publicMetadata.role`: admin | instructor | student)
- Prisma v7 + PostgreSQL
- Stripe v20 + Stripe Connect (80/20 split)
- Zoom Server-to-Server OAuth
- Resend for email

## Brand
- Navy `#0B1A2E`, Teal `#00C2A8`, Gold `#F5C842`
- Fonts: Fraunces (headings), DM Sans (body)
- All UI is dark-themed

## User Roles
- **Admin**: approve/reject courses, view all metrics/revenue
- **Instructor**: create courses (pending until approved), earnings, Zoom start link
- **Student**: browse approved courses, enroll via Stripe, join Zoom sessions

## Key Technical Flows
1. Instructor submits course → PENDING → Admin approves → Zoom meeting auto-created → email sent
2. Student enrolls → Stripe Checkout → 80% to instructor (Stripe Connect), 20% platform → enrollment record + Zoom join URL → confirmation email
3. Cron job every minute → find sessions starting in 19–21 min → send reminder emails via Resend

## Database (Prisma)
Schema at `prisma/schema.prisma`. Models: User, Course, Enrollment. Enums: Role, Subject, CourseStatus.

## Env vars
See `.env.example` for all required variables.
