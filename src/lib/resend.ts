import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCourseApprovalEmail(instructorEmail: string, courseTitle: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Your course "${courseTitle}" has been approved!`,
    html: `<h2>Course Approved</h2><p>Your course <strong>${courseTitle}</strong> has been approved and is now live on SciQuest Learning.</p>`,
  })
}

export async function sendCourseRejectionEmail(instructorEmail: string, courseTitle: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: instructorEmail,
    subject: `Update on your course "${courseTitle}"`,
    html: `<h2>Course Not Approved</h2><p>Unfortunately, your course <strong>${courseTitle}</strong> was not approved at this time. Please contact support for more details.</p>`,
  })
}

export async function sendEnrollmentConfirmationEmail(
  studentEmail: string,
  courseTitle: string,
  zoomJoinUrl: string,
  schedule: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: studentEmail,
    subject: `You're enrolled in ${courseTitle}!`,
    html: `
      <h2>Enrollment Confirmed</h2>
      <p>You are now enrolled in <strong>${courseTitle}</strong>.</p>
      <p><strong>Schedule:</strong> ${schedule}</p>
      <p><a href="${zoomJoinUrl}">Join Zoom Class</a></p>
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
