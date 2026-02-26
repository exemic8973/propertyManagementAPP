import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import ModernDashboardLayout from "@/components/layout/ModernDashboardLayout"
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

async function getDashboardStats(userRole: string, userId: string) {
  const stats = {
    properties: 0,
    units: 0,
    tenants: 0,
    activeLeases: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  }

  if (userRole === "ADMIN") {
    stats.properties = await prisma.property.count()
    stats.units = await prisma.unit.count()
    stats.tenants = await prisma.user.count({ where: { role: "TENANT" } })
    stats.activeLeases = await prisma.lease.count({ where: { status: "ACTIVE" } })
    stats.pendingPayments = await prisma.payment.count({ where: { status: "PENDING" } })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count()
    
    const occupiedUnits = await prisma.unit.count({ where: { isOccupied: true } })
    stats.occupancyRate = stats.units > 0 ? Math.round((occupiedUnits / stats.units) * 100) : 0
    
    const totalRent = await prisma.lease.aggregate({
      where: { status: "ACTIVE" },
      _sum: { monthlyRent: true }
    })
    stats.totalRevenue = totalRent._sum.monthlyRent || 0
  } else if (userRole === "EMPLOYEE") {
    stats.properties = await prisma.property.count({
      where: {
        employees: {
          some: {
            employee: {
              id: userId,
            },
          },
        },
      },
    })
    stats.units = await prisma.unit.count({
      where: {
        property: {
          employees: {
            some: {
              employee: {
                id: userId,
              },
            },
          },
        },
      },
    })
    stats.activeLeases = await prisma.lease.count({
      where: {
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
        status: "ACTIVE",
      },
    })
    stats.pendingPayments = await prisma.payment.count({
      where: {
        lease: {
          unit: {
            property: {
              employees: {
                some: {
                  employee: {
                    id: userId,
                  },
                },
              },
            },
          },
        },
        status: "PENDING",
      },
    })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count({
      where: {
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
      },
    })
    
    const occupiedUnits = await prisma.unit.count({
      where: {
        isOccupied: true,
        property: {
          employees: {
            some: {
              employee: {
                id: userId,
              },
            },
          },
        },
      },
    })
    stats.occupancyRate = stats.units > 0 ? Math.round((occupiedUnits / stats.units) * 100) : 0
    
    const totalRent = await prisma.lease.aggregate({
      where: {
        status: "ACTIVE",
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
      },
      _sum: { monthlyRent: true }
    })
    stats.totalRevenue = totalRent._sum.monthlyRent || 0
  } else if (userRole === "TENANT") {
    stats.activeLeases = await prisma.lease.count({
      where: {
        tenantId: userId,
        status: "ACTIVE",
      },
    })
    stats.pendingPayments = await prisma.payment.count({
      where: {
        lease: {
          tenantId: userId,
        },
        status: "PENDING",
      },
    })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count({
      where: {
        tenantId: userId,
      },
    })
  }

  return stats
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const stats = await getDashboardStats(session.user.role, session.user.id)

  const statCards = [
    {
      title: "Properties",
      value: stats.properties,
      icon: BuildingOfficeIcon,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Units",
      value: stats.units,
      icon: HomeIcon,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Tenants",
      value: stats.tenants,
      icon: UserGroupIcon,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Active Leases",
      value: stats.activeLeases,
      icon: DocumentTextIcon,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: CurrencyDollarIcon,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Maintenance",
      value: stats.maintenanceRequests,
      icon: WrenchScrewdriverIcon,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ]

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold zillow-text-primary">Dashboard</h1>
            <p className="text-sm zillow-text-secondary">Welcome back, {session.user.name}</p>
          </div>
          <div className="flex gap-3">
            <button className="zillow-btn-secondary">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Export Report
            </button>
            <button className="zillow-btn-primary">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Quick Actions
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="zillow-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium zillow-text-secondary">{stat.title}</p>
                  <p className="text-2xl font-bold zillow-text-primary mt-1">{stat.value}</p>
                </div>
                <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">12% from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue and Occupancy */}
        {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="zillow-stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold zillow-text-primary">Monthly Revenue</h3>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold zillow-text-primary">${stats.totalRevenue.toLocaleString()}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="zillow-text-secondary">This month</span>
                  <span className="text-green-600 font-medium">+8.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="zillow-stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold zillow-text-primary">Occupancy Rate</h3>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold zillow-text-primary">{stats.occupancyRate}%</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="zillow-text-secondary">Occupied units</span>
                  <span className="text-blue-600 font-medium">{stats.units > 0 ? Math.round(stats.units * stats.occupancyRate / 100) : 0} / {stats.units}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="zillow-card p-6">
          <h3 className="text-lg font-semibold zillow-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group">
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium zillow-text-primary">Add Property</p>
            </button>
            <button className="p-3 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200 group">
              <UserGroupIcon className="w-4 h-4 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium zillow-text-primary">Add Tenant</p>
            </button>
            <button className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200 group">
              <DocumentTextIcon className="w-4 h-4 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium zillow-text-primary">Create Lease</p>
            </button>
            <button className="p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all duration-200 group">
              <WrenchScrewdriverIcon className="w-4 h-4 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium zillow-text-primary">Maintenance</p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </ModernDashboardLayout>
  )
}
