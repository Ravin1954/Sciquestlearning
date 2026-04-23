import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'Instructor Policies — SciQuest Learning',
  description: 'Policies and conduct standards for all instructors on SciQuest Learning.',
}

const tocItems = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'eligibility', label: '2. Eligibility & Qualifications' },
  { id: 'conduct', label: '3. Professional Conduct' },
  { id: 'attendance', label: '4. Class Attendance & Punctuality' },
  { id: 'missed-class', label: '5. Missed Class & Refund Policy' },
  { id: 'student-cancellations', label: '6. Student Cancellations' },
  { id: 'communication', label: '7. Communication Standards' },
  { id: 'payment', label: '8. Payment Terms' },
  { id: 'content', label: '9. Content & Academic Integrity' },
  { id: 'safety', label: '10. Student Safety & Privacy' },
  { id: 'termination', label: '11. Termination of Instructor Account' },
]

function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #C5D5E4' }}>
        {number}. {title}
      </h2>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' }}>
        {children}
      </div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#2d4a6b', lineHeight: 1.8, marginBottom: '1rem' }}>{children}</p>
}

function Ul({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ color: '#2d4a6b', lineHeight: 1.8, paddingLeft: '1.25rem', margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function InstructorPoliciesPage() {
  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ backgroundColor: '#00C2A822', color: '#00C2A8', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instructor Resources
          </span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#0B1A2E', margin: '1rem 0 0.5rem' }}>
            Instructor Policies
          </h1>
          <p style={{ color: '#5a7a96', fontSize: '0.95rem' }}>
            Conduct standards and responsibilities that all instructors must follow on SciQuest Learning.
          </p>
        </div>

        {/* Table of Contents */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#0B1A2E', fontSize: '1rem', marginBottom: '1rem' }}>Table of Contents</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: '#00C2A8', fontSize: '0.9rem', textDecoration: 'none' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Section 1 */}
        <Section id="introduction" number="1" title="Introduction">
          <P>
            SciQuest Learning connects qualified instructors with middle and high school students for live and self-paced science and mathematics courses. As an instructor on our platform, you are responsible for delivering high-quality, professional, and safe learning experiences.
          </P>
          <P>
            These policies apply to all instructors and must be followed at all times. By submitting a course for approval on SciQuest Learning, you agree to these policies in full.
          </P>
        </Section>

        {/* Section 2 */}
        <Section id="eligibility" number="2" title="Eligibility & Qualifications">
          <Ul items={[
            'Instructors must have a relevant degree, teaching certification, or demonstrated expertise in the subject they teach.',
            'Instructors must complete their profile with accurate qualifications before any course can be approved.',
            'SciQuest Learning reserves the right to verify credentials at any time.',
            'Providing false qualification information is grounds for immediate account termination.',
          ]} />
        </Section>

        {/* Section 3 */}
        <Section id="conduct" number="3" title="Professional Conduct">
          <Ul items={[
            'Instructors must maintain a professional, respectful, and encouraging tone with all students at all times.',
            'Discriminatory, offensive, or inappropriate language or behavior of any kind is strictly prohibited.',
            'Instructors must appear on screen in appropriate attire and in a suitable, distraction-free environment.',
            'Instructors must not be under the influence of alcohol or any substance during class.',
          ]} />
        </Section>

        {/* Section 4 */}
        <Section id="attendance" number="4" title="Class Attendance & Punctuality">
          <Ul items={[
            'Instructors must start every scheduled class on time via the provided Google Meet link.',
            <>If you are unable to attend a scheduled class, you must notify SciQuest admin at <span style={{ color: '#00C2A8', fontWeight: 600 }}>admin@sciquestlearning.com</span> at least 24 hours in advance.</>,
            'In the case of a genuine emergency, notify admin as soon as possible.',
            'Repeated no-shows or last-minute cancellations without notice may result in course suspension or account termination.',
          ]} />
        </Section>

        {/* Section 5 */}
        <Section id="missed-class" number="5" title="Missed Class & Refund Policy">
          <Ul items={[
            'If an instructor misses a scheduled class, the instructor must submit a refund request through the platform for the prorated amount for that session.',
            'If a refund is required after payout, you must remit the refund amount back to SciQuest Learning.',
            'Instructors who consistently miss classes without valid reason will be removed from the platform.',
          ]} />
        </Section>

        {/* Section 6 */}
        <Section id="student-cancellations" number="6" title="Student Cancellations">
          <Ul items={[
            'If a student cancels 24 hours or more before a class, a full refund will be issued by SciQuest admin.',
            'If a student attends 4–5 sessions of a 16-session course and then stops, no refund will be issued.',
            'Instructors do not process student refunds directly — all refunds are handled by SciQuest admin through Stripe.',
          ]} />
        </Section>

        {/* Section 7 */}
        <Section id="communication" number="7" title="Communication Standards">
          <Ul items={[
            'All student and parent communication must remain within the SciQuest platform via the Message Students feature on your dashboard.',
            'Instructors must not share personal phone numbers, personal email addresses, social media handles, or external payment links with students or parents.',
            'Directing students to pay you outside of SciQuest Learning is a serious violation and will result in immediate account termination.',
            'Instructors should respond to student or parent messages within 48 hours.',
          ]} />
        </Section>

        {/* Section 8 */}
        <Section id="payment" number="8" title="Payment Terms">
          <Ul items={[
            'Payouts are processed by SciQuest admin through Stripe to your registered bank account or PayPal.',
            'Instructors must keep their payout details up to date in their instructor dashboard.',
          ]} />
        </Section>

        {/* Section 9 */}
        <Section id="content" number="9" title="Content & Academic Integrity">
          <Ul items={[
            'All course content must be accurate, original, and appropriate for middle and high school students.',
            'Instructors must not use or present copyrighted material without proper licensing or permission.',
            'Instructors must not misrepresent course content, outcomes, or their own qualifications.',
          ]} />
        </Section>

        {/* Section 10 */}
        <Section id="safety" number="10" title="Student Safety & Privacy">
          <Ul items={[
            'Instructors must not record class sessions without the explicit written consent of all students\' parents or guardians.',
            'Instructors must not share student information (names, emails, attendance) with any third party.',
            'For students under 13, all communication must be directed to the parent or guardian, in compliance with COPPA.',
            'Any safeguarding concern must be reported to SciQuest admin immediately.',
          ]} />
        </Section>

        {/* Section 11 */}
        <Section id="termination" number="11" title="Termination of Instructor Account">
          <P>SciQuest Learning reserves the right to suspend or permanently terminate an instructor account for any of the following:</P>
          <Ul items={[
            'Providing false qualifications',
            'Repeated missed classes without notice',
            'Directing students to pay outside the platform',
            'Unprofessional or harmful behavior toward students',
            'Failure to remit a required refund amount back to SciQuest Learning',
            'Violation of any policy listed in this document',
          ]} />
        </Section>

        {/* Contact footer */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.4rem' }}>Questions about these policies?</p>
          <p style={{ color: '#5a7a96', fontSize: '0.875rem', marginBottom: 0 }}>
            Contact us at{' '}
            <a href="mailto:admin@sciquestlearning.com" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 600 }}>
              admin@sciquestlearning.com
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
