'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import NavBar from '@/components/NavBar'

const tocItems = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'camera-attendance', label: '2. Camera & Attendance Policy' },
  { id: 'conduct', label: '3. Code of Conduct' },
  { id: 'punctuality', label: '4. Punctuality & Absences' },
  { id: 'materials', label: '5. Learning Materials' },
  { id: 'payments', label: '6. Payments & Refunds' },
  { id: 'communication', label: '7. Communication' },
  { id: 'self-paced', label: '8. Self-Paced Course Policies' },
]

const sectionStyle = { marginBottom: '2.5rem' }
const cardStyle = { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' }
const h2Style = { fontFamily: 'Fraunces, serif', color: '#b8860b', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #C5D5E4' }
const pStyle = { color: '#2d4a6b', lineHeight: 1.8, marginBottom: '1rem' }
const liStyle = { color: '#2d4a6b', lineHeight: 1.8, marginBottom: '0.5rem' }

export default function StudentPoliciesPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect_url=/student-policies')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '4rem', color: '#5a7a96' }}>
          Please sign in to view student policies.
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ backgroundColor: '#E0F7F4', color: '#00A896', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Resources
          </span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#0B1A2E', margin: '1rem 0 0.5rem' }}>
            Student Policies
          </h1>
          <p style={{ color: '#5a7a96', fontSize: '0.95rem' }}>
            Important policies and guidelines for students and parents enrolled in SciQuest Learning courses.
          </p>
        </div>

        {/* Table of Contents */}
        <div style={{ ...cardStyle, marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#0B1A2E', fontSize: '1rem', marginBottom: '1rem' }}>Table of Contents</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: '#00A896', fontSize: '0.9rem', textDecoration: 'none' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Section 1 — Introduction */}
        <section id="introduction" style={sectionStyle}>
          <h2 style={h2Style}>1. Introduction</h2>
          <div style={cardStyle}>
            <p style={pStyle}>
              Welcome to SciQuest Learning. Our platform connects middle and high school students with qualified science and mathematics instructors for live, interactive online classes and self-paced courses.
            </p>
            <p style={pStyle}>
              By enrolling in any course on SciQuest Learning, students and their parents or guardians agree to abide by the policies outlined in this document. These policies are designed to ensure a safe, respectful, and productive learning environment for all students and instructors.
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              Please read these policies carefully. If you have any questions, contact us through the <a href="/contact" style={{ color: '#00A896' }}>Contact Us</a> page.
            </p>
          </div>
        </section>

        {/* Section 2 — Camera & Attendance */}
        <section id="camera-attendance" style={sectionStyle}>
          <h2 style={h2Style}>2. Camera & Attendance Policy</h2>
          <div style={cardStyle}>
            <div style={{ backgroundColor: '#E0F7F4', border: '1px solid #00A896', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ color: '#00A896', fontWeight: 700, margin: '0 0 0.25rem' }}>Camera On — Required for Live Classes</p>
              <p style={{ color: '#2d4a6b', margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
                Students are required to have their camera turned on throughout all live class sessions. This is essential for the instructor to verify student presence, engagement, and understanding.
              </p>
            </div>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>Students must join the Google Meet session with their <strong>camera on</strong> before the class begins.</li>
              <li style={liStyle}>The camera must remain on for the entire duration of the live session unless the instructor specifically permits otherwise.</li>
              <li style={liStyle}>Students should be seated in a <strong>well-lit, quiet environment</strong> free from distractions.</li>
              <li style={liStyle}>If a student is unable to turn on their camera due to a technical issue, they must inform the instructor via the chat before the class starts.</li>
              <li style={liStyle}>Repeated failure to appear on camera may result in the student being marked absent for that session.</li>
              <li style={liStyle}>Students must ensure their <strong>microphone is working</strong> and should mute themselves when not speaking to minimize background noise.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 — Code of Conduct */}
        <section id="conduct" style={sectionStyle}>
          <h2 style={h2Style}>3. Code of Conduct</h2>
          <div style={cardStyle}>
            <p style={pStyle}>All students are expected to maintain respectful and professional behavior during all classes and interactions on the platform.</p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>Treat instructors and fellow students with <strong>respect and courtesy</strong> at all times.</li>
              <li style={liStyle}>Do not use offensive, discriminatory, or inappropriate language in class or in any written communication.</li>
              <li style={liStyle}>Do not share, record, or distribute any part of the live session without the instructor&apos;s explicit written consent.</li>
              <li style={liStyle}>Students must use their <strong>real name</strong> when joining Google Meet sessions — this must match the name used during enrollment.</li>
              <li style={liStyle}>Disruptive behavior that interferes with the learning of others may result in removal from the session and suspension of access.</li>
              <li style={liStyle}>Any form of cheating, plagiarism, or academic dishonesty is strictly prohibited.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 — Punctuality */}
        <section id="punctuality" style={sectionStyle}>
          <h2 style={h2Style}>4. Punctuality & Absences</h2>
          <div style={cardStyle}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>Students are expected to <strong>join the class on time</strong>. Please log in to Google Meet at least 2–3 minutes before the scheduled start time.</li>
              <li style={liStyle}>If a student is unable to attend a scheduled session, they must notify the instructor <strong>at least 24 hours in advance</strong>.</li>
              <li style={liStyle}>Missed sessions due to unexcused absences are <strong>non-refundable</strong>.</li>
              <li style={liStyle}>Repeated absences without notice may result in the student being removed from the course without a refund.</li>
              <li style={liStyle}>If a student is more than 10 minutes late, the instructor may proceed with the class and the late arrival will be counted as partial attendance.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 — Materials */}
        <section id="materials" style={sectionStyle}>
          <h2 style={h2Style}>5. Learning Materials</h2>
          <div style={cardStyle}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>Course materials provided by the instructor (slides, worksheets, videos) are for the <strong>enrolled student&apos;s personal use only</strong>.</li>
              <li style={liStyle}>Sharing course materials, links, or access credentials with others is strictly prohibited and may result in immediate termination of access without a refund.</li>
              <li style={liStyle}>Students should have a <strong>notebook and pen</strong> ready for each live session to take notes.</li>
              <li style={liStyle}>A stable internet connection and a device with a working camera and microphone are required for live classes.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 — Payments */}
        <section id="payments" style={sectionStyle}>
          <h2 style={h2Style}>6. Payments & Refunds</h2>
          <div style={cardStyle}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>All payments are processed securely through Stripe. SciQuest Learning does not store any payment card information.</li>
              <li style={liStyle}><strong>Refund requests</strong> must be submitted within 48 hours of enrollment by contacting us through the <a href="/contact" style={{ color: '#00A896' }}>Contact Us</a> page.</li>
              <li style={liStyle}>Refunds will not be issued after a student has attended one or more sessions of a live course.</li>
              <li style={liStyle}>For self-paced courses, refunds are available within 48 hours of enrollment provided the course materials have not been accessed.</li>
              <li style={liStyle}>If a class is cancelled by the instructor, enrolled students will receive a full refund for the affected sessions.</li>
            </ul>
          </div>
        </section>

        {/* Section 7 — Communication */}
        <section id="communication" style={sectionStyle}>
          <h2 style={h2Style}>7. Communication</h2>
          <div style={cardStyle}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>All communication between students and instructors must be conducted <strong>through the SciQuest Learning platform</strong> or via the Google Meet session.</li>
              <li style={liStyle}>Students and parents may contact support at any time through the <a href="/contact" style={{ color: '#00A896' }}>Contact Us</a> page.</li>
              <li style={liStyle}>Instructors are not permitted to share personal contact information (phone numbers, personal email) with students.</li>
              <li style={liStyle}>Parents are welcome to observe live sessions provided they do not disrupt the class.</li>
            </ul>
          </div>
        </section>

        {/* Section 8 — Self-Paced */}
        <section id="self-paced" style={sectionStyle}>
          <h2 style={h2Style}>8. Self-Paced Course Policies</h2>
          <div style={cardStyle}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={liStyle}>Self-paced courses provide <strong>1 year of access</strong> from the date of enrollment.</li>
              <li style={liStyle}>Access to course materials (videos, slides, quizzes) is available 24/7 within the access period.</li>
              <li style={liStyle}>Students may renew their access for an additional year from their student dashboard before or after expiry.</li>
              <li style={liStyle}>Course materials must not be downloaded, copied, or shared with others.</li>
              <li style={liStyle}>Progress and completion are the student&apos;s own responsibility. There are no scheduled sessions for self-paced courses.</li>
            </ul>
          </div>
        </section>

        {/* Footer note */}
        <div style={{ backgroundColor: '#FEF9C3', border: '1px solid #b8860b', borderRadius: '12px', padding: '1.25rem 1.5rem', marginTop: '1rem' }}>
          <p style={{ color: '#92400e', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
            <strong>Note:</strong> SciQuest Learning reserves the right to update these policies at any time. Students and parents will be notified of any significant changes via email. Continued use of the platform after any changes constitutes acceptance of the updated policies.
          </p>
        </div>

      </div>
    </div>
  )
}
