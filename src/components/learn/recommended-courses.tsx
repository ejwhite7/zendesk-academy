'use client'

import { ArrowRight, BookOpen, Clock, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecommendedCourse {
  id: string
  title: string
  description: string
  duration: number
  rating: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  reason: string
  tags: string[]
  thumbnail?: string
}

interface RecommendedCoursesProps {
  courses: RecommendedCourse[]
  onCourseSelect: (courseId: string) => void
  onEnroll: (courseId: string) => void
  title?: string
}

export function RecommendedCourses({ 
  courses, 
  onCourseSelect, 
  onEnroll,
  title = "Recommended for You" 
}: RecommendedCoursesProps) {
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (courses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
        <p className="text-gray-500">Complete a course to get personalized recommendations!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <TrendingUp className="h-5 w-5 text-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center relative">
              <BookOpen className="h-8 w-8 text-white" />
              <Badge className="absolute top-2 right-2 bg-white/20 text-white border-white/30">
                Recommended
              </Badge>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-base line-clamp-2 flex-1">{course.title}</h3>
                <Badge className={`ml-2 text-xs ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">Why recommended?</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{course.reason}</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {course.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => onCourseSelect(course.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Preview
                </Button>
                <Button
                  onClick={() => onEnroll(course.id)}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Start Learning
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length > 6 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            View All Recommendations
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}