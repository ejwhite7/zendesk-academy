import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CoursePlayer } from '@/components/learn/course-player'
import { EnrollmentButton } from '@/components/learn/enrollment-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  PlayCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface CoursePageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/learn/courses/' + params.id)
  }

  // Get course with modules and lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        *,
        lessons (
          *,
          assessments (*)
        )
      )
    `)
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if user is enrolled
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', params.id)
    .single()

  // Get user's progress if enrolled
  let progress: any[] = []
  if (enrollment) {
    const { data: progressData } = await supabase
      .from('progress')
      .select('*')
      .eq('enrollment_id', enrollment.id)
    
    progress = progressData || []
  }

  // Calculate course statistics
  const totalLessons = course.modules?.reduce((total: number, module: any) => 
    total + (module.lessons?.length || 0), 0) || 0
  
  const completedLessons = progress.filter(p => p.status === 'completed').length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Get recent enrollments count (for social proof)
  const { count: enrollmentCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', params.id)

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link href="/learn" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className={levelColors[course.level as keyof typeof levelColors]}>
                {course.level}
              </Badge>
              {course.ai_generated && (
                <Badge variant="outline">
                  AI Generated
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {course.title}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                {course.modules?.length || 0} modules
              </div>
              <div className="flex items-center">
                <PlayCircle className="h-4 w-4 mr-2" />
                {totalLessons} lessons
              </div>
              {course.estimated_duration_minutes && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {Math.round(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                </div>
              )}
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {enrollmentCount || 0} enrolled
              </div>
            </div>

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  What you'll learn:
                </h3>
                <ul className="space-y-2">
                  {course.learning_objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Enrollment Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {enrollment ? 'Your Progress' : 'Start Learning'}
                </CardTitle>
                {enrollment && (
                  <CardDescription>
                    {progressPercentage}% complete
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollment ? (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Completed</p>
                        <p className="font-semibold">{completedLessons}/{totalLessons}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-semibold capitalize">{enrollment.status}</p>
                      </div>
                    </div>

                    {enrollment.status === 'completed' ? (
                      <div className="text-center">
                        <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-600">
                          Course Completed!
                        </p>
                        <Link href={`/learn/courses/${course.id}/certificate`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Certificate
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/learn/courses/${course.id}/learn`}>
                        <Button className="w-full">
                          Continue Learning
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <EnrollmentButton courseId={course.id} userId={user.id} />
                )}

                {/* Course Info */}
                <div className="pt-4 border-t space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="capitalize font-medium">{course.level}</span>
                  </div>
                  {course.estimated_duration_minutes && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        ~{Math.round(course.estimated_duration_minutes / 60)}h
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span className="font-medium">
                      {new Date(course.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Content Preview */}
      {course.modules && course.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {course.modules.length} modules • {totalLessons} lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.modules.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {module.lessons?.length || 0} lessons
                    </span>
                  </div>
                  
                  {module.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {module.description}
                    </p>
                  )}

                  {module.lessons && module.lessons.length > 0 && (
                    <div className="space-y-2">
                      {module.lessons.map((lesson: any, lessonIndex: number) => {
                        const lessonProgress = progress.find(p => p.lesson_id === lesson.id)
                        const isCompleted = lessonProgress?.status === 'completed'
                        const isAccessible = enrollment && (lessonIndex === 0 || 
                          progress.find(p => p.lesson_id === module.lessons[lessonIndex - 1]?.id)?.status === 'completed')

                        return (
                          <div 
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded border-l-4 ${
                              isCompleted 
                                ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' 
                                : isAccessible 
                                ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-l-gray-300 bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <PlayCircle className={`h-5 w-5 ${
                                  isAccessible ? 'text-blue-500' : 'text-gray-400'
                                }`} />
                              )}
                              <div>
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                  {lesson.content_type}
                                  {lesson.estimated_duration_minutes && 
                                    ` • ${lesson.estimated_duration_minutes}m`
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {enrollment && isAccessible && (
                              <Link href={`/learn/courses/${course.id}/learn/${lesson.id}`}>
                                <Button size="sm" variant="ghost">
                                  {isCompleted ? 'Review' : 'Start'}
                                </Button>
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}