'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EnrollmentButtonProps {
  courseId: string
  userId: string
}

export function EnrollmentButton({ courseId, userId }: EnrollmentButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEnroll = async () => {
    setIsEnrolling(true)

    try {
      // Create enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0,
        })

      if (error) {
        console.error('Enrollment error:', error)
        alert('Failed to enroll in course. Please try again.')
        return
      }

      // Refresh the page to show enrollment
      router.refresh()
    } catch (error) {
      console.error('Unexpected enrollment error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={isEnrolling}
      className="w-full"
      size="lg"
    >
      {isEnrolling ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4 mr-2" />
          Enroll Now - Free
        </>
      )}
    </Button>
  )
}