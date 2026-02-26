'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  BellIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  Bars3Icon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="zillow-white-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full mb-4">
            <SparklesIcon className="w-3 h-3 text-white animate-pulse" />
          </div>
          <div className="text-lg font-medium zillow-text-primary">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
    { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon, current: false },
    { name: 'Tenants', href: '/tenants', icon: UserGroupIcon, current: false },
    { name: 'Leases', href: '/leases', icon: DocumentTextIcon, current: false },
    { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon, current: false },
    { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon, current: false },
  ]

  return (
    <div className="zillow-white-bg">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-900/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
             onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 w-64 zillow-sidebar transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b zillow-border">
              <div className="flex items-center">
                <div className="zillow-logo">PH</div>
                <span className="ml-3 text-xl font-bold zillow-text-primary">PropertyHub</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`zillow-nav-item ${item.current ? 'zillow-nav-item-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t zillow-border">
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium zillow-text-primary">{session.user?.name}</p>
                  <p className="text-xs zillow-text-secondary">{session.user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:zillow-sidebar">
        <div className="flex h-full flex-col">
          <div className="flex items-center p-4 border-b zillow-border">
            <div className="zillow-logo">PH</div>
            <div className="ml-3">
              <h1 className="text-xl font-bold zillow-text-primary">PropertyHub</h1>
              <p className="text-xs zillow-text-secondary">Modern Management</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`zillow-nav-item ${item.current ? 'zillow-nav-item-active' : ''}`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t zillow-border">
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium zillow-text-primary">{session.user?.name}</p>
                <p className="text-xs zillow-text-secondary">{session.user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="zillow-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-600" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-2xl font-bold zillow-text-primary">Dashboard</h1>
                  <p className="text-sm zillow-text-secondary">Welcome back, {session.user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                    <BellIcon className="w-4 h-4 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm zillow-text-primary">{session.user?.name}</span>
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
