import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const metadata = {
  title: 'Class Policies — SciQuest Learning',
  description: 'Listing requirements and class policies for instructors on SciQuest Learning.',
}

const tocItems = [
  { id: 'introduction', label: '1. Introduction to Class Listings on SciQuest Learning' },
  { id: 'basic-elements', label: '2. Basic Elements of Class Listings' },
  { id: 'course-description', label: '3. Basic Elements of Course Description' },
  { id: 'special-considerations', label: '4. Special Considerations' },
]

export default function ClassPoliciesPage() {
  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ backgroundColor: '#00C2A822', color: '#00C2A8', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instructor Resources
          </span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#e8edf5', margin: '1rem 0 0.5rem' }}>
            Class Policies
          </h1>
          <p style={{ color: '#6b88a8', fontSize: '0.95rem' }}>
            Listing requirements that all instructors must follow before submitting a course for approval.
          </p>
        </div>

        {/* Table of Contents */}
        <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1rem', marginBottom: '1rem' }}>Table of Contents</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  style={{ color: '#00C2A8', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Section 1 */}
        <section id="introduction" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e3a5f' }}>
            1. Introduction to Class Listings on SciQuest Learning
          </h2>
          <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
            <p style={{ color: '#a8c4e0', lineHeight: 1.8, marginBottom: '1rem' }}>
              SciQuest Learning is a curated platform connecting qualified science and mathematics instructors with middle and high school students seeking live, instructor-led online classes. Our mission is to provide students and families with clear, accurate, and trustworthy course information so they can make informed enrollment decisions.
            </p>
            <p style={{ color: '#a8c4e0', lineHeight: 1.8, marginBottom: '1rem' }}>
              All instructors are required to create course listings that are honest, complete, and aligned with SciQuest Learning&apos;s academic standards. A well-written listing builds trust with families, increases enrollment, and sets clear expectations for students before they join your class.
            </p>
            <p style={{ color: '#a8c4e0', lineHeight: 1.8 }}>
              Every course listing submitted to SciQuest Learning is reviewed by our admin team before it is published. Listings that do not meet our requirements will be rejected with specific feedback, and instructors will be asked to revise and resubmit.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="basic-elements" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e3a5f' }}>
            2. Basic Elements of Class Listings
          </h2>
          <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
            <p style={{ color: '#a8c4e0', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              Every course listing must include the following elements:
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0a1e3a' }}>
                    <th style={{ color: '#e8edf5', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #1e3a5f', fontWeight: 700, width: '30%' }}>Element</th>
                    <th style={{ color: '#e8edf5', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #1e3a5f', fontWeight: 700 }}>Requirement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { element: 'Course Title', req: 'Clear, specific, and accurate. Must reflect the subject and level (e.g. "Biology 101: Cell Structure & Function for Grade 8"). Avoid vague titles like "Science Class".' },
                    { element: 'Subject', req: 'Select the correct subject category: Biology, Chemistry, Physical Science, or Mathematics.' },
                    { element: 'Grade Level', req: 'Specify the appropriate grade range (e.g. Grades 7–9). Do not list a course as suitable for all grades unless it genuinely is.' },
                    { element: 'Course Type', req: 'Select Live (real-time instruction via Google Meet) or Self-paced.' },
                    { element: 'Schedule', req: 'Provide accurate days of the week and session times in UTC. If different days have different times, list each day separately.' },
                    { element: 'Session Duration', req: 'State the exact length of each session in minutes.' },
                    { element: 'Course Duration', req: 'State the total number of weeks the course runs.' },
                    { element: 'Fee', req: 'State the one-time course fee in USD. The fee must not be changed after a course is approved and students have enrolled.' },
                    { element: 'Topics Covered', req: 'List at least 5 specific topics that will be taught in the course.' },
                  ].map((row, i) => (
                    <tr key={row.element} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#0a1e3a' }}>
                      <td style={{ color: '#F5C842', padding: '0.75rem 1rem', borderBottom: '1px solid #1e3a5f', fontWeight: 600, verticalAlign: 'top' }}>{row.element}</td>
                      <td style={{ color: '#a8c4e0', padding: '0.75rem 1rem', borderBottom: '1px solid #1e3a5f', lineHeight: 1.6 }}>{row.req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="course-description" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e3a5f' }}>
            3. Basic Elements of Course Description
          </h2>
          <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: '#a8c4e0', lineHeight: 1.8 }}>
              The course description is the most important part of your listing. It is what students and parents read to decide whether to enroll. Your description must be:
            </p>

            {[
              { label: 'Accurate', text: 'Only describe what you will actually teach. Do not promise outcomes you cannot guarantee.' },
              { label: 'Specific', text: 'Avoid generic phrases like "students will learn science concepts." Instead, write "students will explore cell division, photosynthesis, and ecosystem dynamics through live discussions and worked examples."' },
              { label: 'Professional', text: 'Use correct grammar and spelling. Descriptions with significant errors will be rejected.' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: '#00C2A8', fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                <p style={{ color: '#a8c4e0', lineHeight: 1.7, margin: 0 }}>
                  <span style={{ color: '#e8edf5', fontWeight: 600 }}>{item.label} — </span>{item.text}
                </p>
              </div>
            ))}

            <div>
              <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.5rem' }}>Structured — A good course description should cover:</p>
              <ul style={{ color: '#a8c4e0', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                <li>What the course is about and what topics it covers</li>
                <li>Who the course is designed for (grade level, prior knowledge expected)</li>
                <li>What students will be able to do or understand by the end of the course</li>
                <li>How the class is conducted (live instruction, Q&A, worked problems, etc.)</li>
              </ul>
            </div>

            <p style={{ color: '#a8c4e0', lineHeight: 1.8 }}>
              <span style={{ color: '#e8edf5', fontWeight: 600 }}>Minimum length: </span>100 words. Descriptions shorter than 100 words will not be approved.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#3d0f0f', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '1rem' }}>
                <p style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Weak Example</p>
                <p style={{ color: '#fca5a5', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>"This is a biology class for students who want to learn biology."</p>
              </div>
              <div style={{ backgroundColor: '#0a2e1a', border: '1px solid #14532d', borderRadius: '8px', padding: '1rem' }}>
                <p style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Strong Example</p>
                <p style={{ color: '#86efac', fontStyle: 'italic', margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>"This 8-week live course introduces Grade 8–10 students to the core principles of cell biology. Students will study cell structure and function, the differences between prokaryotic and eukaryotic cells, mitosis and meiosis, DNA replication, and protein synthesis. Each 60-minute session combines direct instruction with interactive Q&A. Prior knowledge of basic life science is recommended but not required. By the end of the course, students will be able to explain key biological processes and apply their understanding to exam-style questions."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="special-considerations" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e3a5f' }}>
            4. Special Considerations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {[
              {
                title: 'Instructor Qualifications',
                body: 'Your profile must include your qualifications relevant to the subject you are teaching. This may include degrees, teaching certifications, professional experience, or other relevant credentials. Courses submitted by instructors without a completed qualification profile will not be approved.',
              },
              {
                title: 'Accuracy of Schedule',
                body: 'You are responsible for the accuracy of your stated schedule. Students rely on the listed times to plan their calendars. If your schedule changes after approval, you must notify SciQuest Learning immediately. Repeated schedule inaccuracies may result in course removal.',
              },
              {
                title: 'One Course Per Section',
                body: 'Each listing represents one specific section of a course with a fixed schedule. If you wish to offer the same course at different times, submit separate listings for each time slot.',
              },
              {
                title: 'No External Contact Information',
                body: 'Course listings must not include personal email addresses, phone numbers, social media handles, external website links, or any information that directs students to contact you or pay you outside of SciQuest Learning. Listings containing external contact information will be rejected.',
              },
              {
                title: 'Content Standards',
                body: 'All course content must be appropriate for middle and high school students. Courses must be academic in nature and directly related to the listed subject. SciQuest Learning reserves the right to reject any listing that does not meet our content standards.',
              },
              {
                title: 'Rejection and Resubmission',
                body: 'If your course listing is rejected, you will receive specific remarks explaining what needs to be changed. You may edit your listing and resubmit it for review. Repeated submissions that do not address the stated feedback may result in a temporary suspension of your instructor account.',
              },
            ].map((item) => (
              <div key={item.title} style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.25rem' }}>
                <h3 style={{ color: '#e8edf5', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#a8c4e0', lineHeight: 1.8, margin: 0, fontSize: '0.9rem' }}>{item.body}</p>
              </div>
            ))}

            {/* COPPA Section */}
            <div style={{ backgroundColor: '#0f2240', border: '2px solid #F5C842', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <h3 style={{ color: '#F5C842', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>COPPA Compliance (Children Under 13)</h3>
              </div>
              <p style={{ color: '#a8c4e0', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.9rem' }}>
                The Children&apos;s Online Privacy Protection Act (COPPA) applies to online services directed at children under the age of 13. If your course is intended for or may attract students under 13, you must:
              </p>
              <ul style={{ color: '#a8c4e0', lineHeight: 1.8, paddingLeft: '1.25rem', margin: '0 0 1rem 0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><span style={{ color: '#e8edf5', fontWeight: 600 }}>Clearly indicate the minimum age</span> in your course listing. If your course is suitable for students under 13, state this explicitly in the description.</li>
                <li><span style={{ color: '#e8edf5', fontWeight: 600 }}>Not collect any personal information</span> from students under 13 directly. Do not ask students to share their name, email, location, photos, or any other personal details during class sessions or through any external means.</li>
                <li><span style={{ color: '#e8edf5', fontWeight: 600 }}>Direct all communication to parents or guardians.</span> For students under 13, correspondence regarding enrollment, schedules, and course matters should be addressed to the parent or guardian, not the student.</li>
                <li><span style={{ color: '#e8edf5', fontWeight: 600 }}>Obtain verifiable parental consent</span> before engaging with students under 13. SciQuest Learning requires that parents or guardians complete enrollment on behalf of children under 13.</li>
                <li><span style={{ color: '#e8edf5', fontWeight: 600 }}>Not record sessions</span> without explicit written consent from the parent or guardian of every student under 13 in the session.</li>
              </ul>
              <p style={{ color: '#a8c4e0', lineHeight: 1.8, margin: 0, fontSize: '0.9rem' }}>
                Instructors who fail to comply with COPPA requirements risk immediate removal of their course listings and suspension of their instructor account. SciQuest Learning takes the privacy and safety of young students seriously and expects all instructors to do the same.
              </p>
              <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>
                For more information, visit the FTC&apos;s official COPPA guidance at{' '}
                <span style={{ color: '#00C2A8' }}>ftc.gov/coppa</span>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA for instructors */}
        <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#a8c4e0', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Ready to submit a course? Make sure your listing follows all the requirements above.
          </p>
          <Link
            href="/instructor/courses/new"
            style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}
          >
            Create a Course →
          </Link>
        </div>

      </div>
    </div>
  )
}
