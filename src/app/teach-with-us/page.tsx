import type { Metadata } from 'next'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Teach With Us | SciQuest Learning — Online Science & Math Instructor Platform',
  description: 'Join SciQuest Learning as an online science or mathematics instructor. Teach middle and high school students live from anywhere. Keep 80% of every enrollment. Flexible schedule, no marketing needed.',
  openGraph: {
    title: 'Teach Science & Math Online | SciQuest Learning',
    description: 'Earn 80% revenue on every enrollment. Set your own schedule. Teach science and mathematics to middle and high school students online.',
    url: 'https://sciquestlearning.com/teach-with-us',
  },
}

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up and complete your instructor profile — qualifications, subjects, and a short bio.' },
  { num: '02', title: 'Submit Your Course', desc: 'Build your course: set your schedule, fee, grade level, and description. Our team reviews it within 48 hours.' },
  { num: '03', title: 'Get Approved & Start Teaching', desc: 'Once approved, your course goes live. Students enroll, you receive a Google Meet link, and you start teaching.' },
  { num: '04', title: 'Earn & Grow', desc: 'Keep 80% of every enrollment fee. Track your earnings, message your students, and grow your online teaching practice.' },
]

const benefits = [
  { icon: '💰', title: '80% Revenue Share', desc: 'You keep 80 cents of every dollar students pay. No hidden fees, no bidding for students.' },
  { icon: '🗓️', title: 'You Set the Schedule', desc: 'Choose your own days, times, and session length. Teach from anywhere with an internet connection.' },
  { icon: '🎓', title: 'No Marketing Needed', desc: 'SciQuest brings the students. You focus entirely on teaching — we handle enrollment, payments, and reminders.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed via Stripe. Your earnings are held safely and paid out automatically.' },
  { icon: '📋', title: 'Full Course Control', desc: 'Create live classes or self-paced content. Add recordings, materials, and manage your student roster.' },
  { icon: '🌎', title: 'Teach from US, Canada or Mexico', desc: 'Instructor registration is open to qualified educators residing in the United States, Canada, and Mexico.' },
]

const faqs = [
  {
    q: 'What subjects can I teach?',
    a: 'SciQuest currently supports Biology, Chemistry, Physical Science, and Mathematics for middle and high school levels.',
  },
  {
    q: 'What qualifications do I need?',
    a: 'You need relevant academic qualifications or professional teaching experience in your subject. All instructors are reviewed and approved by our admin team before going live.',
  },
  {
    q: 'How much can I earn?',
    a: 'You keep 80% of every enrollment fee. For example, if you charge $30 per session and have 10 students enroll, you earn $240. There is no cap on earnings.',
  },
  {
    q: 'How do live classes work?',
    a: 'Once your course is approved, a Google Meet link is automatically generated for your class. Students receive the link upon enrollment. You simply open the link at class time.',
  },
  {
    q: 'When do I get paid?',
    a: 'Earnings are held for 10 days after each enrollment (standard Stripe Connect policy) and then released to your connected bank account.',
  },
  {
    q: 'Can I teach self-paced courses too?',
    a: 'Yes. In addition to live classes you can create self-paced courses with content links and materials. Students get 30-day access per enrollment.',
  },
]

export default function TeachWithUsPage() {
  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh', color: '#0B1A2E' }}>
      <NavBar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0B1A2E 0%, #0d2540 100%)', color: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#00C2A8', color: '#0B1A2E', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', padding: '0.35rem 1rem', borderRadius: '999px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Now Accepting Instructors
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Share Your Knowledge.<br />Earn on Your Terms.
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#a8c4d8', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            Join SciQuest Learning as an online science or mathematics instructor. Teach middle and high school students live — from anywhere in the US, Canada, or Mexico — and keep 80% of every enrollment.
          </p>
          <Link href="/sign-up" style={{ display: 'inline-block', backgroundColor: '#00C2A8', color: '#0B1A2E', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none' }}>
            Apply to Teach →
          </Link>
          <p style={{ color: '#5a7a96', fontSize: '0.85rem', marginTop: '1rem' }}>Free to join · No subscription fees · Applications reviewed within 48 hours</p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
          Why Teach on SciQuest?
        </h2>
        <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>
          Everything you need to build a successful online teaching practice — without the overhead.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {benefits.map((b) => (
            <div key={b.title} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{b.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#0B1A2E' }}>{b.title}</h3>
              <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We're Looking For */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
            Who We&apos;re Looking For
          </h2>
          <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>
            We welcome educators with the knowledge and passion to make science and math engaging for young learners.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              'Certified school teachers (current or former)',
              'University graduates in science or mathematics',
              'Professional tutors with subject expertise',
              'Educators with AP or advanced coursework experience',
              'Experienced online instructors',
              'Graduate students with teaching experience',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', backgroundColor: '#EEF3F8', borderRadius: '10px', padding: '1rem' }}>
                <span style={{ color: '#00C2A8', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
                <span style={{ color: '#2d4a6b', fontSize: '0.9rem', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
          How It Works
        </h2>
        <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>From sign-up to your first class in four simple steps.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.5rem' }}>
              <div style={{ backgroundColor: i === 0 ? '#00C2A8' : '#EEF3F8', color: i === 0 ? '#0B1A2E' : '#5a7a96', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.25rem', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: '#0B1A2E', marginBottom: '0.35rem' }}>{step.title}</h3>
                <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial placeholder */}
      <section style={{ backgroundColor: '#0B1A2E', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#00C2A8' }}>&ldquo;</div>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#FFFFFF', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
            Teaching on SciQuest has given me the flexibility to reach students who genuinely want to learn science. The platform handles everything — payments, reminders, Meet links — so I can focus entirely on my students.
          </p>
          <p style={{ color: '#00C2A8', fontWeight: 700 }}>Sabita Sudhakaran</p>
          <p style={{ color: '#5a7a96', fontSize: '0.85rem' }}>Biology &amp; Chemistry Instructor, SciQuest Learning</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq) => (
            <div key={faq.q} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0B1A2E', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{faq.q}</h3>
              <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ backgroundColor: '#00C2A8', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.75rem' }}>
          Ready to Start Teaching?
        </h2>
        <p style={{ color: '#0B1A2E', marginBottom: '2rem', fontSize: '1rem', opacity: 0.8 }}>
          Join SciQuest Learning today. Applications are reviewed within 48 hours.
        </p>
        <Link href="/sign-up" style={{ display: 'inline-block', backgroundColor: '#0B1A2E', color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none' }}>
          Create Your Instructor Account →
        </Link>
        <p style={{ color: '#0B1A2E', fontSize: '0.85rem', marginTop: '1rem', opacity: 0.7 }}>
          Questions? Email us at{' '}
          <a href="mailto:info@sciquestlearning.com" style={{ color: '#0B1A2E', fontWeight: 700 }}>info@sciquestlearning.com</a>
        </p>
      </section>
    </div>
  )
}
