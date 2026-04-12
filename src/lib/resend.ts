import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminNewCourseEmail(
  instructorName: string,
  instructorEmail: string,
  courseTitle: string,
  subject: string,
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sciquestlearning.com'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `New course pending approval: "${courseTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">New Course Submitted for Approval</h2>
        <p>An instructor has submitted a new course for your review.</p>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Course Title</td><td style="padding:0.5rem;">${courseTitle}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Subject</td><td style="padding:0.5rem;">${subject}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Instructor</td><td style="padding:0.5rem;">${instructorName}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Instructor Email</td><td style="padding:0.5rem;">${instructorEmail}</td></tr>
        </table>
        <p><a href="https://sciquestlearning.com/admin" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">Review in Admin Dashboard →</a></p>
        <p style="margin-top:2rem; color:#666;">SciQuest Learning Platform</p>
      </div>
    `,
  })
}

export async function sendCourseApprovalEmail(instructorEmail: string, courseTitle: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Your course "${courseTitle}" has been approved!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Course Approved!</h2>
        <p>Great news! Your course <strong>${courseTitle}</strong> has been reviewed and approved. It is now live on SciQuest Learning and visible to students.</p>
        <p><a href="https://sciquestlearning.com/instructor" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">View Your Dashboard →</a></p>
        <p style="margin-top:2rem; color:#666;">Thank you for teaching with SciQuest Learning!</p>
      </div>
    `,
  })
}

export async function sendCourseRejectionEmail(instructorEmail: string, courseTitle: string, remark?: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Update on your course "${courseTitle}"`,
    html: `
      <h2>Course Not Approved</h2>
      <p>Unfortunately, your course <strong>${courseTitle}</strong> was not approved at this time.</p>
      ${remark ? `<p><strong>Reason:</strong> ${remark}</p>` : ''}
      <p>Please log in to your instructor dashboard to edit your course and resubmit it for review.</p>
    `,
  })
}

export async function sendEnrollmentConfirmationEmail(
  studentEmail: string,
  courseTitle: string,
  zoomJoinUrl: string,
  schedule: string,
  studentName?: string,
  classroomUrl?: string,
) {
  const isLive = !!zoomJoinUrl && zoomJoinUrl.startsWith('http')
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: studentEmail,
    subject: `Enrollment Confirmed: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Enrollment Confirmed!</h2>
        <p>You are now enrolled in <strong>${courseTitle}</strong>.</p>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          ${studentName ? `<tr><td style="padding:0.5rem; color:#555; font-weight:600;">Student Name</td><td style="padding:0.5rem;">${studentName}</td></tr>` : ''}
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Schedule</td><td style="padding:0.5rem;">${schedule}</td></tr>
          ${isLive ? `<tr><td style="padding:0.5rem; color:#555; font-weight:600;">Google Meet Link</td><td style="padding:0.5rem;"><a href="${zoomJoinUrl}" style="color:#00C2A8;">${zoomJoinUrl}</a></td></tr>` : ''}
          ${classroomUrl ? `<tr><td style="padding:0.5rem; color:#555; font-weight:600;">Google Classroom</td><td style="padding:0.5rem;"><a href="${classroomUrl}" style="color:#00C2A8;">${classroomUrl}</a></td></tr>` : ''}
        </table>
        ${isLive && studentName ? `
        <div style="background:#fff8e1; border-left:4px solid #F5C842; padding:1rem 1.25rem; border-radius:0 8px 8px 0; margin: 1.25rem 0;">
          <p style="margin:0 0 0.5rem; font-weight:700; color:#7a5800;">Important: Joining Google Meet</p>
          <p style="margin:0; color:#4a3800; font-size:0.9rem; line-height:1.6;">
            When joining the class, please make sure the name shown in Google Meet matches your child's enrolled name:
            <strong>${studentName}</strong>.<br/><br/>
            To do this, click the Meet link and when prompted, type <strong>${studentName}</strong> as the name before joining.
            This helps the instructor identify and admit the correct student.
          </p>
        </div>
        ` : ''}
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin:1.25rem 0;">
          ${isLive ? `<a href="${zoomJoinUrl}" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700; display:inline-block;">Join Class →</a>` : ''}
          ${classroomUrl ? `<a href="${classroomUrl}" style="background:#1a73e8; color:#fff; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700; display:inline-block;">Open Google Classroom →</a>` : ''}
        </div>
        <p style="margin-top:2rem; color:#666;">Thank you for enrolling with SciQuest Learning!</p>
      </div>
    `,
  })
}

export async function sendInstructorNoShowWarningEmail(
  instructorEmail: string,
  instructorFirstName: string,
  courseTitle: string,
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Important: Missed class session — ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Dear ${instructorFirstName},</h2>

        <p>We hope you are well. We are reaching out regarding your scheduled class session for <strong>${courseTitle}</strong>.</p>

        <p>One or more of your enrolled students have reported that the class session did not take place as scheduled. We understand that unexpected circumstances can arise, and we want to give you the opportunity to clarify.</p>

        <p>We kindly remind you that consistent attendance is a core commitment for instructors on the SciQuest Learning platform. Our students rely on scheduled sessions for their academic progress, and repeated absences without prior notice may result in the following consequences:</p>

        <ul style="color: #333; line-height: 1.8;">
          <li>Withholding of instructor payouts for the affected sessions</li>
          <li>Suspension of your courses from the platform listing</li>
          <li>In cases of repeated no-shows, permanent removal of instructor access</li>
        </ul>

        <p>If this was an emergency or a technical issue, please reply to this email and let us know as soon as possible. We are happy to work with you to reschedule the missed session for your students.</p>

        <p>We value your contribution to SciQuest Learning and hope to continue our partnership with you. Please do not hesitate to reach out if you need any assistance.</p>

        <p style="margin-top: 2rem;">Warm regards,<br/>
        <strong>The SciQuest Learning Team</strong><br/>
        <a href="mailto:support@sciquestlearning.com" style="color: #00C2A8;">support@sciquestlearning.com</a>
        </p>
      </div>
    `,
  })
}

export async function sendSessionWarningEmail(
  instructorEmail: string,
  instructorFirstName: string,
  courseTitle: string,
  sessionDay: string,
  sessionTime: string,
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `⚠️ No students enrolled for tomorrow's ${courseTitle} session`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Hi ${instructorFirstName},</h2>
        <p>This is a reminder that your upcoming session has <strong>no students enrolled yet</strong>:</p>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Course</td><td style="padding:0.5rem;">${courseTitle}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Day</td><td style="padding:0.5rem;">${sessionDay}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Time</td><td style="padding:0.5rem;">${sessionTime} UTC</td></tr>
        </table>
        <p>If no students enroll in the next 6 hours, <strong>this session (and all future sessions of this course)</strong> will be automatically cancelled.</p>
        <p>You can add more dates and times or promote your course to attract students:</p>
        <p><a href="https://sciquestlearning.com/instructor" style="background:#F5C842; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">Update Your Course →</a></p>
        <p style="margin-top:2rem; color:#666;">SciQuest Learning Team</p>
      </div>
    `,
  })
}

export async function sendSessionCancelledEmail(
  instructorEmail: string,
  instructorFirstName: string,
  courseTitle: string,
  sessionDay: string,
  sessionTime: string,
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Session cancelled — no students enrolled 24h before class: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Hi ${instructorFirstName},</h2>
        <p>The following session has been <strong>automatically cancelled</strong> because no students were enrolled 24 hours before the scheduled class time:</p>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Course</td><td style="padding:0.5rem;">${courseTitle}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Session</td><td style="padding:0.5rem;">${sessionDay}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Time</td><td style="padding:0.5rem;">${sessionTime} UTC</td></tr>
        </table>
        <p><strong>Your course remains active.</strong> You can log in and update the schedule with new dates and times to open it up for future enrollments.</p>
        <p><a href="https://sciquestlearning.com/instructor/courses" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">Update Your Schedule →</a></p>
        <p style="margin-top:2rem; color:#666;">SciQuest Learning Team</p>
      </div>
    `,
  })
}

export async function sendInstructorApprovalEmail(email: string, firstName: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Your SciQuest instructor account has been approved!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Welcome to SciQuest Learning, ${firstName}!</h2>
        <p>Great news — your instructor application has been <strong style="color:#00C2A8;">approved</strong>. You can now log in and start creating courses.</p>
        <p><a href="https://sciquestlearning.com/instructor" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">Go to Instructor Dashboard →</a></p>
        <p style="margin-top:2rem; color:#666;">Welcome aboard — we're excited to have you teach with SciQuest Learning!</p>
      </div>
    `,
  })
}

export async function sendInstructorRejectionEmail(email: string, firstName: string, remark?: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Update on your SciQuest instructor application',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">Hi ${firstName},</h2>
        <p>Thank you for applying to teach on SciQuest Learning. After reviewing your application, we are unable to approve your instructor account at this time.</p>
        ${remark ? `<p><strong>Reason:</strong> ${remark}</p>` : ''}
        <p>If you believe this is a mistake or would like to provide additional information, please contact us at <a href="https://sciquestlearning.com/contact">sciquestlearning.com/contact</a>.</p>
        <p style="margin-top:2rem; color:#666;">Thank you for your interest in SciQuest Learning.</p>
      </div>
    `,
  })
}

export async function sendEnrollmentNotificationEmail(
  studentName: string,
  studentEmail: string,
  courseTitle: string,
  amountPaid: number,
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sciquestlearning.com'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `New enrollment: ${studentName} enrolled in "${courseTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">New Enrollment</h2>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Student</td><td style="padding:0.5rem;">${studentName}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Email</td><td style="padding:0.5rem;">${studentEmail}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Course</td><td style="padding:0.5rem;">${courseTitle}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Amount Paid</td><td style="padding:0.5rem;">$${amountPaid.toFixed(2)}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Platform Fee (20%)</td><td style="padding:0.5rem;">$${(amountPaid * 0.2).toFixed(2)}</td></tr>
        </table>
        <p><a href="https://sciquestlearning.com/admin" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">View in Admin Dashboard →</a></p>
        <p style="margin-top:2rem; color:#666;">SciQuest Learning Platform</p>
      </div>
    `,
  })
}

export async function sendNewUserNotificationEmail(
  name: string,
  email: string,
  role: string,
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sciquestlearning.com'
  const isInstructor = role.toLowerCase() === 'instructor'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `New ${role} registered: ${name || email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">New ${role} Registered</h2>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Name</td><td style="padding:0.5rem;">${name || '—'}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Email</td><td style="padding:0.5rem;">${email}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Role</td><td style="padding:0.5rem;">${role}</td></tr>
        </table>
        ${isInstructor ? `<p style="color:#e65c00; font-weight:600;">⚠️ This instructor requires your approval before they can create courses. Please review their profile in the admin dashboard.</p>` : ''}
        <p><a href="https://sciquestlearning.com/admin" style="background:#00C2A8; color:#0B1A2E; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:700;">${isInstructor ? 'Review Instructor Application →' : 'View in Admin Dashboard →'}</a></p>
        <p style="margin-top:2rem; color:#666;">SciQuest Learning Platform</p>
      </div>
    `,
  })
}

export async function sendContactFormEmail(
  name: string,
  email: string,
  role: string,
  message: string,
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sciquestlearning.com'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact Form] Message from ${name} (${role})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
        <h2 style="color: #0B1A2E;">New Contact Form Message</h2>
        <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Name</td><td style="padding:0.5rem;">${name}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Email</td><td style="padding:0.5rem;">${email}</td></tr>
          <tr><td style="padding:0.5rem; color:#555; font-weight:600;">Role</td><td style="padding:0.5rem;">${role}</td></tr>
        </table>
        <h3 style="color:#0B1A2E;">Message:</h3>
        <p style="background:#f5f5f5; padding:1rem; border-radius:8px; white-space:pre-wrap;">${message}</p>
        <p style="margin-top:1.5rem; color:#666; font-size:0.85rem;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  })
}

export async function sendReminderEmail(
  email: string,
  courseTitle: string,
  zoomUrl: string,
  startTime: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `Class starting in 20 minutes: ${courseTitle}`,
    html: `
      <h2>Your class starts in 20 minutes!</h2>
      <p><strong>${courseTitle}</strong> starts at ${startTime}.</p>
      <p><a href="${zoomUrl}">Join Now</a></p>
    `,
  })
}
