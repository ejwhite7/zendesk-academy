'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Settings,
  BarChart3,
  Users,
  Zap,
  FileText,
  Badge,
  Webhook,
  Palette,
} from 'lucide-react'

interface SidebarProps {
  user: any
}

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    name: 'Content Sources',
    href: '/dashboard/sources',
    icon: FileText,
  },
  {
    name: 'Learners',
    href: '/dashboard/learners',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Badges',
    href: '/dashboard/badges',
    icon: Badge,
  },
  {
    name: 'Generation',
    href: '/dashboard/generation',
    icon: Zap,
  },
  {
    name: 'Webhooks',
    href: '/dashboard/webhooks',
    icon: Webhook,
  },
  {
    name: 'Branding',
    href: '/dashboard/branding',
    icon: Palette,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            Academy
          </h1>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}