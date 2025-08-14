import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'
import { BookOpen, Users, TrendingUp, Clock, Plus, Zap } from 'lucide-react'
import Link from 'next/link'

type Course = Database['public']['Tables']['courses']['Row']

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Get dashboard stats
  const [
    { count: coursesCount },
    { count: learnersCount },
    { count: activeEnrollments },
    { data: recentCourses },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'learner'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('courses')
      .select('id, title, description, level, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      title: 'Total Courses',
      value: coursesCount || 0,
      icon: BookOpen,
      description: 'Published and draft courses',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Learners',
      value: learnersCount || 0,
      icon: Users,
      description: 'Currently enrolled users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Enrollments',
      value: activeEnrollments || 0,
      icon: TrendingUp,
      description: 'Ongoing learning sessions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Avg. Completion Time',
      value: '45m',
      icon: Clock,
      description: 'Average course completion',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your learning platform performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/generation">
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Generate Course
            </Button>
          </Link>
          <Link href="/dashboard/courses/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Manual Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
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
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>
              Your latest course creations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCourses && recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course: Course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {course.level} • {course.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No courses created yet</p>
                <Link href="/dashboard/generation" className="mt-2 inline-block">
                  <Button size="sm">Create Your First Course</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/sources">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Knowledge Source
                </Button>
              </Link>
              <Link href="/dashboard/generation">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate New Course
                </Button>
              </Link>
              <Link href="/dashboard/learners">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Learners
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      {(!recentCourses || recentCourses.length === 0) && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome to Zendesk Academy!</CardTitle>
            <CardDescription className="text-base">
              Get started by connecting your knowledge source and generating your first course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/sources">
                <Button size="lg">
                  1. Connect Zendesk
                </Button>
              </Link>
              <Link href="/dashboard/generation">
                <Button size="lg" variant="outline">
                  2. Generate Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}