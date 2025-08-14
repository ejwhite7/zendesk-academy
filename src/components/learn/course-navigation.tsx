'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Lesson {
  id: string
  title: string
  duration: number
  completed: boolean
  type: 'lesson' | 'quiz' | 'video'
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  completed: boolean
}

interface CourseNavigationProps {
  modules: Module[]
  currentLessonId?: string
  courseId?: string
  progress?: any[]
  enrollmentId?: string
  onLessonSelect?: (lessonId: string, moduleId: string) => void
}

export function CourseNavigation({ modules, currentLessonId, courseId, progress, enrollmentId, onLessonSelect }: CourseNavigationProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.completed) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (lesson.type === 'video') return <PlayCircle className="h-4 w-4 text-blue-500" />
    if (lesson.type === 'quiz') return <CheckCircle className="h-4 w-4 text-orange-500" />
    return <BookOpen className="h-4 w-4 text-gray-500" />
  }

  return (
    <Card className="w-80 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4">Course Content</h3>
        <div className="space-y-2">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  {module.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="font-medium">{module.title}</span>
                </div>
                {expandedModules.has(module.id) ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {expandedModules.has(module.id) && (
                <div className="border-t bg-gray-50">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect?.(lesson.id, module.id)}
                      className={`w-full p-3 text-left flex items-center space-x-3 hover:bg-gray-100 ${
                        currentLessonId === lesson.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      {getLessonIcon(lesson)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-gray-500">{lesson.duration} min</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}