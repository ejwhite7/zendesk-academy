import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { LessonPlayer } from '@/components/learn/lesson-player'
import { CourseNavigation } from '@/components/learn/course-navigation'

interface LessonPageProps {
  params: {
    id: string
    lessonId: string
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/learn/courses/' + params.id + '/learn/' + params.lessonId)
  }

  // Get enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', params.id)
    .single()

  if (!enrollment) {
    redirect(`/learn/courses/${params.id}`)
  }

  // Get lesson with module and course info
  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      module:modules(
        *,
        course:courses(*)
      ),
      assessments(
        *,
        questions(
          *,
          answer_options(*)
        )
      )
    `)
    .eq('id', params.lessonId)
    .single()

  if (!lesson) {
    notFound()
  }

  // Get user's progress for this lesson
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('enrollment_id', enrollment.id)
    .eq('lesson_id', params.lessonId)
    .single()

  // Get all lessons in the course for navigation
  const { data: courseStructure } = await supabase
    .from('modules')
    .select(`
      *,
      lessons(*)
    `)
    .eq('course_id', params.id)
    .order('order_index')

  // Get user's progress for all lessons
  const { data: allProgress } = await supabase
    .from('progress')
    .select('*')
    .eq('enrollment_id', enrollment.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Navigation Sidebar */}
          <div className="lg:col-span-1">
            <CourseNavigation
              courseId={params.id}
              currentLessonId={params.lessonId}
              modules={courseStructure || []}
              progress={allProgress || []}
              enrollmentId={enrollment.id}
            />
          </div>

          {/* Main Lesson Content */}
          <div className="lg:col-span-3">
            <LessonPlayer
              lesson={lesson}
              progress={progress}
              enrollment={enrollment}
              allProgress={allProgress || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}