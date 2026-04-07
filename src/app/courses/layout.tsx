import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Courses',
  description: 'Browse live science and math courses for middle and high school students. Biology, Chemistry, Physical Science, and Mathematics taught by verified instructors on Google Meet.',
  openGraph: {
    title: 'Browse Courses | SciQuest Learning',
    description: 'Live science and math classes for grades 6–12. Biology, Chemistry, Physical Science, Mathematics — taught by verified educators on Google Meet.',
    url: 'https://sciquestlearning.com/courses',
  },
  alternates: {
    canonical: 'https://sciquestlearning.com/courses',
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children
}
