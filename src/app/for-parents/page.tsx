import type { Metadata } from 'next'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Online Science Classes for Middle & High School Students | SciQuest Learning',
  description: 'Live online science and mathematics classes for middle and high school students taught by verified educators. Flexible scheduling, small groups, and a safe learning environment. Browse courses and enroll today.',
  openGraph: {
    title: 'Live Online Science Classes for Your Child | SciQuest Learning',
    description: 'Verified instructors. Live classes. Flexible scheduling. Help your middle or high school student excel in Biology, Chemistry, Physical Science, and Mathematics.',
    url: 'https://sciquestlearning.com/for-parents',
  },
}

const subjects = [
  { icon: '🧬', name: 'Biology', desc: 'Cell biology, genetics, ecology, AP Biology prep' },
  { icon: '⚗️', name: 'Chemistry', desc: 'Periodic table, reactions, stoichiometry, AP Chemistry prep' },
  { icon: '⚡', name: 'Physical Science', desc: 'Physics fundamentals, motion, energy, waves' },
  { icon: '📐', name: 'Mathematics', desc: 'Algebra, geometry, pre-calculus, statistics' },
]

const trustPoints = [
  { icon: '✅', title: 'Verified Instructors', desc: 'Every instructor is reviewed and approved by our admin team before teaching. We check qualifications and subject expertise.' },
  { icon: '🎥', title: 'Live Classes via Google Meet', desc: 'All live sessions run on Google Meet — a platform your child already knows. No new apps to install.' },
  { icon: '💳', title: 'Secure Payments via Stripe', desc: 'All payments are processed securely through Stripe, the same payment system used by millions of websites worldwide.' },
  { icon: '↩️', title: 'Refund Policy', desc: 'If your child cannot attend, you can request a refund up to 24 hours before the class. Full refunds on eligible cancellations.' },
  { icon: '📧', title: 'Session Reminders', desc: 'Your child receives an automatic reminder email 20 minutes before every live class so they never miss a session.' },
  { icon: '📝', title: 'Progress Through Reviews', desc: 'After courses, students can leave reviews. You can read other parents\' reviews before enrolling to make an informed choice.' },
]

const steps = [
  { num: '01', title: 'Browse Courses', desc: 'Explore live and self-paced science and math courses by subject and grade level — Middle School or High School.' },
  { num: '02', title: 'Create an Account & Enroll', desc: 'Sign up for free, select the course that fits your child\'s needs, and complete enrollment securely via Stripe.' },
  { num: '03', title: 'Your Child Joins the Live Class', desc: 'They receive the Google Meet link by email. Classes are live and interactive — your child can ask questions in real time.' },
  { num: '04', title: 'Track Progress', desc: 'Students can access recordings (where available), submit feedback, and renew access for self-paced courses anytime.' },
]

const faqs = [
  {
    q: 'What age group is SciQuest designed for?',
    a: 'SciQuest Learning is designed for middle school students (grades 6–8) and high school students (grades 9–12).',
  },
  {
    q: 'How do live online classes work?',
    a: 'Live classes run via Google Meet at a scheduled day and time. Your child joins the session using the link emailed to them after enrollment. They can interact with the instructor and ask questions during the class.',
  },
  {
    q: 'Are the instructors qualified?',
    a: 'Yes. Every instructor on SciQuest is individually reviewed and approved by our admin team. We verify academic qualifications and subject expertise before any course goes live.',
  },
  {
    q: 'What if my child misses a class?',
    a: 'Some instructors provide session recordings — check the course details before enrolling. For missed classes, our refund policy allows cancellations made at least 24 hours in advance.',
  },
  {
    q: 'What countries can students enroll from?',
    a: 'Students can enroll from the United States, Canada, Mexico, India, Bangladesh, Nepal, the UK, Australia, Singapore, UAE, and many more countries. Check our sign-up page for the full list.',
  },
  {
    q: 'Is there a self-paced option for students with busy schedules?',
    a: 'Yes. In addition to live classes, SciQuest offers self-paced courses where students can study at their own time. Access is valid for 30 days per enrollment.',
  },
  {
    q: 'What is the refund policy?',
    a: 'Students who cancel at least 24 hours before a live class are eligible for a full refund. If an instructor misses a class, a prorated refund is issued automatically. Please see our Student Policies page for full details.',
  },
  {
    q: 'How do I get in touch if I have questions?',
    a: 'Email us at info@sciquestlearning.com or use the Contact Us form on our website. We typically respond within 24 hours.',
  },
]

export default function ForParentsPage() {
  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh', color: '#0B1A2E' }}>
      <NavBar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0B1A2E 0%, #0d2540 100%)', color: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#F5C842', color: '#0B1A2E', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', padding: '0.35rem 1rem', borderRadius: '999px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            For Parents
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Give Your Child the<br />Science &amp; Math Edge
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#a8c4d8', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            Live online science and mathematics classes for middle and high school students, taught by verified educators. Flexible scheduling, small groups, and a safe learning environment — from the comfort of home.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/courses" style={{ display: 'inline-block', backgroundColor: '#00C2A8', color: '#0B1A2E', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none' }}>
              Browse Courses →
            </Link>
            <Link href="/sign-up" style={{ display: 'inline-block', backgroundColor: 'transparent', color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none', border: '2px solid #FFFFFF' }}>
              Create Free Account
            </Link>
          </div>
          <p style={{ color: '#5a7a96', fontSize: '0.85rem', marginTop: '1rem' }}>Free to sign up · No commitment · Enroll only when you find the right course</p>
        </div>
      </section>

      {/* Subjects */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
          Subjects Available
        </h2>
        <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>
          Live and self-paced courses across four core STEM subjects for grades 6–12.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {subjects.map((s) => (
            <div key={s.name} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#0B1A2E', marginBottom: '0.5rem' }}>{s.name}</h3>
              <p style={{ color: '#5a7a96', fontSize: '0.875rem', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/courses" style={{ display: 'inline-block', backgroundColor: '#0B1A2E', color: '#FFFFFF', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem' }}>
            See All Available Courses →
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
            How It Works
          </h2>
          <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>Getting your child started takes just a few minutes.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', backgroundColor: '#EEF3F8', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ backgroundColor: i === 0 ? '#F5C842' : '#C5D5E4', color: '#0B1A2E', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.25rem', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0B1A2E', marginBottom: '0.35rem' }}>{step.title}</h3>
                  <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
          Your Child&apos;s Safety &amp; Your Peace of Mind
        </h2>
        <p style={{ textAlign: 'center', color: '#5a7a96', marginBottom: '3rem' }}>
          We&apos;ve built SciQuest with parents in mind — safe, transparent, and accountable.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {trustPoints.map((t) => (
            <div key={t.title} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#0B1A2E' }}>{t.title}</h3>
              <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>
            Parent FAQs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq) => (
              <div key={faq.q} style={{ borderRadius: '12px', border: '1px solid #C5D5E4', padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#0B1A2E', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{faq.q}</h3>
                <p style={{ color: '#5a7a96', fontSize: '0.9rem', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0B1A2E 0%, #0d2540 100%)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
          Ready to Get Your Child Started?
        </h2>
        <p style={{ color: '#a8c4d8', marginBottom: '2rem', fontSize: '1rem' }}>
          Browse live and self-paced science and math courses. Enroll in minutes.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/courses" style={{ display: 'inline-block', backgroundColor: '#00C2A8', color: '#0B1A2E', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none' }}>
            Browse Courses →
          </Link>
          <Link href="/sign-up" style={{ display: 'inline-block', backgroundColor: 'transparent', color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
            Create Free Account
          </Link>
        </div>
        <p style={{ color: '#5a7a96', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Have questions?{' '}
          <a href="mailto:info@sciquestlearning.com" style={{ color: '#00C2A8', fontWeight: 600, textDecoration: 'none' }}>info@sciquestlearning.com</a>
        </p>
      </section>
    </div>
  )
}
