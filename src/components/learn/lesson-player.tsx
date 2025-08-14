'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen,
  Award,
  Play,
  Pause
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import { QuizComponent } from '@/components/learn/quiz-component'

interface LessonPlayerProps {
  lesson: any
  progress: any
  enrollment: any
  allProgress: any[]
}

export function LessonPlayer({ lesson, progress, enrollment, allProgress }: LessonPlayerProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Track time spent
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && progress?.status !== 'completed') {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60))
      }, 60000) // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, startTime, progress?.status])

  // Handle window focus/blur for time tracking
  useEffect(() => {
    const handleFocus = () => setIsActive(true)
    const handleBlur = () => setIsActive(false)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Mark lesson as started if not already
  useEffect(() => {
    const markAsStarted = async () => {
      if (!progress) {
        try {
          await supabase
            .from('progress')
            .insert({
              enrollment_id: enrollment.id,
              lesson_id: lesson.id,
              status: 'in_progress',
            })
        } catch (error) {
          console.error('Error marking lesson as started:', error)
        }
      }
    }

    markAsStarted()
  }, [progress, enrollment.id, lesson.id, supabase])

  const handleComplete = async () => {
    setIsCompleting(true)

    try {
      // Update lesson progress
      await supabase
        .from('progress')
        .upsert({
          enrollment_id: enrollment.id,
          lesson_id: lesson.id,
          status: 'completed',
          time_spent_minutes: timeSpent + (progress?.time_spent_minutes || 0),
          completed_at: new Date().toISOString(),
        })

      // Calculate overall course progress
      const totalLessons = allProgress.length
      const completedLessons = allProgress.filter(p => p.status === 'completed').length + 1
      const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

      // Update enrollment progress
      await supabase
        .from('enrollments')
        .update({
          progress_percentage: progressPercentage,
          last_accessed_at: new Date().toISOString(),
          ...(progressPercentage >= 100 && {
            status: 'completed',
            completed_at: new Date().toISOString(),
          }),
        })
        .eq('id', enrollment.id)

      // Refresh the page to show completion
      router.refresh()
    } catch (error) {
      console.error('Error completing lesson:', error)
      alert('Failed to mark lesson as complete. Please try again.')
    } finally {
      setIsCompleting(false)
    }
  }

  const findNextLesson = (): { id: string } | null => {
    // This would need to be implemented based on the course structure
    // For now, we'll just go back to the course page
    return null
  }

  const goToNextLesson = () => {
    const nextLesson = findNextLesson()
    if (nextLesson) {
      router.push(`/learn/courses/${lesson.module.course.id}/learn/${nextLesson.id}`)
    } else {
      router.push(`/learn/courses/${lesson.module.course.id}`)
    }
  }

  const isCompleted = progress?.status === 'completed'

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/learn/courses/${lesson.module.course.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Course
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Completed' : 'In Progress'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {lesson.content_type}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {lesson.module.title} • Lesson {lesson.order_index + 1}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lesson.title}
            </h1>
          </div>

          {lesson.estimated_duration_minutes && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated: {lesson.estimated_duration_minutes}m
              </div>
              {timeSpent > 0 && (
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  Time spent: {timeSpent}m
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      <Card className="lesson-content">
        <CardContent className="p-8">
          <ReactMarkdown
            className="prose prose-gray dark:prose-invert max-w-none"
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 ml-6 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-2">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Assessments */}
      {lesson.assessments && lesson.assessments.length > 0 && (
        <div className="space-y-4">
          {lesson.assessments.map((assessment: any) => (
            <QuizComponent
              key={assessment.id}
              questions={assessment.questions || []}
              onComplete={(score, total) => {
                console.log(`Quiz completed: ${score}/${total}`)
                // Handle quiz completion
              }}
              onNext={() => {
                // Handle next action after quiz
              }}
            />
          ))}
        </div>
      )}

      {/* Lesson Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isCompleted && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Lesson completed!</span>
                </div>
              )}
              
              {!isCompleted && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Mark as Complete" when you've finished this lesson
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!isCompleted && (
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="flex items-center"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={goToNextLesson}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {findNextLesson() ? 'Next Lesson' : 'Back to Course'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}