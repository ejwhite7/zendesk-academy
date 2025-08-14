'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CoursePlayerProps {
  courseId: string
  currentLessonId?: string
  onNext?: () => void
  onPrevious?: () => void
  onComplete?: () => void
}

interface Lesson {
  id: string
  title: string
  content: string
  type: 'lesson' | 'video' | 'quiz'
  videoUrl?: string
  duration?: number
}

export function CoursePlayer({ 
  courseId, 
  currentLessonId, 
  onNext, 
  onPrevious, 
  onComplete 
}: CoursePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Mock lesson data - in real app this would come from props or API
  const currentLesson: Lesson = {
    id: currentLessonId || '1',
    title: 'Introduction to Customer Service',
    content: `
      <h2>Welcome to Customer Service Excellence</h2>
      <p>In this lesson, you'll learn the fundamental principles of providing exceptional customer service.</p>
      
      <h3>Key Topics Covered:</h3>
      <ul>
        <li>Understanding customer expectations</li>
        <li>Active listening techniques</li>
        <li>Problem-solving strategies</li>
        <li>Building rapport with customers</li>
      </ul>

      <p>Customer service is more than just solving problems - it's about creating positive experiences that build loyalty and trust.</p>
    `,
    type: 'lesson',
    duration: 15
  }

  const handleVideoToggle = () => {
    setIsPlaying(!isPlaying)
  }

  const handleComplete = () => {
    setProgress(100)
    onComplete?.()
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{currentLesson.type}</span>
            </div>
            {currentLesson.duration && (
              <span>{currentLesson.duration} minutes</span>
            )}
          </div>
        </div>

        {currentLesson.type === 'video' && currentLesson.videoUrl && (
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handleVideoToggle}
                  size="lg"
                  className="rounded-full"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="prose max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleComplete}
              variant="outline"
            >
              Mark Complete
            </Button>
            <Button
              onClick={onNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}