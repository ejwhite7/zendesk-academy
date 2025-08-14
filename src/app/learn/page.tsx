import { createServerClient } from '@/lib/supabase/server'
import { CourseCatalog } from '@/components/learn/course-catalog'
import { LearningProgress } from '@/components/learn/learning-progress'
import { RecommendedCourses } from '@/components/learn/recommended-courses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Clock, BookOpen, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'

export default async function LearnPage() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's enrollments and progress
  const [
    { data: enrollments },
    { data: courses },
    { data: userBadges },
    { data: recentActivity },
  ] = await Promise.all([
    supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', user?.id || '')
      .order('last_accessed_at', { ascending: false }),
    
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    
    supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', user?.id || '')
      .order('earned_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('progress')
      .select(`
        *,
        lesson:lessons(title),
        enrollment:enrollments(
          course:courses(title)
        )
      `)
      .eq('enrollments.user_id', user?.id || '')
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || []
  const completedCourses = enrollments?.filter(e => e.status === 'completed') || []
  const totalLearningTime = enrollments?.reduce((total, e) => total + (e.time_spent_minutes || 0), 0) || 0

  const stats = [
    {
      title: 'Courses Completed',
      value: completedCourses.length,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Active Courses',
      value: activeEnrollments.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Badges Earned',
      value: userBadges?.length || 0,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Learning Time',
      value: `${Math.round(totalLearningTime / 60)}h`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Learner'}!
          </h1>
          <p className="text-primary-foreground/90 mb-6">
            Continue your learning journey and discover new skills
          </p>
          {activeEnrollments.length > 0 ? (
            <Link href={`/learn/courses/${activeEnrollments[0].course_id}`}>
              <Button variant="secondary">
                Continue Learning
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/learn/catalog">
              <Button variant="secondary">
                Browse Courses
                <BookOpen className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {activeEnrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeEnrollments.slice(0, 3).map((enrollment: any) => (
                    <div 
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{enrollment.course.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {enrollment.course.level}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full transition-all"
                                style={{ width: `${enrollment.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {enrollment.progress_percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/learn/courses/${enrollment.course_id}`}>
                        <Button size="sm">Continue</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest learning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="flex-1">
                        {activity.status === 'completed' ? 'Completed' : 'Started'} "{activity.lesson?.title}"
                        in {activity.enrollment?.course?.title}
                      </span>
                      <span className="text-gray-500">
                        {new Date(activity.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Badges */}
          {userBadges && userBadges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBadges.map((userBadge: any) => (
                    <div key={userBadge.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{userBadge.badge.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(userBadge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/learn/badges" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Badges
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Course Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Based on your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses && courses.slice(0, 3).map((course: any) => (
                <div key={course.id} className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">{course.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {course.description?.slice(0, 80)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                      <Link href={`/learn/courses/${course.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/learn/catalog" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Browse All Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}