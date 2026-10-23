import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Science & Math Courses for Middle & High School | Browse & Enroll',
  description: 'Browse live and self-paced Biology, Chemistry, Physical Science, and Mathematics courses for grades 6–12. Verified instructors, small groups, Google Meet. Students from any country can enroll — find your course today.',
  keywords: [
    'online science courses', 'online math courses', 'live biology class',
    'live chemistry class', 'live physics class', 'live math class',
    'middle school online courses', 'high school online courses',
    'STEM online classes', 'affordable science tutor', 'Google Meet science class',
  ],
  openGraph: {
    title: 'Online Science & Math Courses for Grades 6–12 | SciQuest Learning',
    description: 'Live and self-paced Biology, Chemistry, Physical Science, and Mathematics courses for middle and high school students. Verified instructors, students worldwide welcome.',
    url: 'https://sciquestlearning.com/courses',
  },
  alternates: {
    canonical: 'https://sciquestlearning.com/courses',
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children
}
