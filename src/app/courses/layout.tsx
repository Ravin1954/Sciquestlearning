import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Online Science & Math Courses',
  description: 'Browse live and self-paced online science and math courses for middle and high school students. Biology, Chemistry, Physical Science, and Mathematics taught by verified instructors via Google Meet.',
  keywords: [
    'online science courses', 'online math courses', 'live biology class',
    'live chemistry class', 'live physics class', 'live math class',
    'middle school online courses', 'high school online courses',
    'STEM online classes', 'affordable science tutor', 'Google Meet science class',
  ],
  openGraph: {
    title: 'Browse Online Science & Math Courses | SciQuest Learning',
    description: 'Live and self-paced online science and math classes for grades 6–12. Biology, Chemistry, Physical Science, Mathematics — taught by verified educators.',
    url: 'https://sciquestlearning.com/courses',
  },
  alternates: {
    canonical: 'https://sciquestlearning.com/courses',
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children
}
