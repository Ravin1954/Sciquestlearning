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
