'use client'

import { TrendingUp, Calendar, Award, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LearningProgressProps {
  totalCourses: number
  completedCourses: number
  totalHours: number
  currentStreak: number
  badges: Array<{
    id: string
    name: string
    icon: string
    earnedAt: string
  }>
  recentActivity: Array<{
    id: string
    type: 'course_completed' | 'lesson_completed' | 'quiz_passed' | 'badge_earned'
    title: string
    date: string
  }>
}

export function LearningProgress({
  totalCourses,
  completedCourses,
  totalHours,
  currentStreak,
  badges,
  recentActivity
}: LearningProgressProps) {
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed': return '🎓'
      case 'lesson_completed': return '📚'
      case 'quiz_passed': return '✅'
      case 'badge_earned': return '🏆'
      default: return '📖'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-gray-500">{completedCourses}/{totalCourses} courses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Learning Hours</p>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-xs text-gray-500">Total time spent</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-gray-500">Days in a row</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold">{badges.length}</p>
              <p className="text-xs text-gray-500">Total achievements</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Badges</h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.slice(0, 4).map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(badge.earnedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No badges earned yet</p>
              <p className="text-sm">Complete courses to earn your first badge!</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2">
                  <div className="text-lg">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start learning to see your progress!</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          
          {totalCourses > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2 font-medium">{completedCourses} courses</span>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-medium">{totalCourses - completedCourses} courses</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}