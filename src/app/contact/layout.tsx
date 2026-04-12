import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with SciQuest Learning. Have questions about our online science and math classes? We\'re here to help students, parents, and instructors.',
  alternates: { canonical: 'https://sciquestlearning.com/contact' },
  openGraph: {
    title: 'Contact SciQuest Learning',
    description: 'Get in touch with the SciQuest Learning team. Questions about courses, enrollment, or becoming an instructor? We\'d love to hear from you.',
    url: 'https://sciquestlearning.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
