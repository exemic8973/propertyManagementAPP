import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Link from "next/link"

async function getLeases(userRole: string, userId: string) {
  if (userRole === "ADMIN") {
    return await prisma.lease.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } else if (userRole === "EMPLOYEE") {
    return await prisma.lease.findMany({
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
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } else if (userRole === "TENANT") {
    return await prisma.lease.findMany({
      where: {
        tenantId: userId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }
  
  return []
}

export default async function LeasesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const leases = await getLeases(session.user.role, session.user.id)

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Leases</h1>
          {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
            <Link
              href="/leases/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Lease
            </Link>
          )}
        </div>

        {leases.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leases</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first lease.
            </p>
            {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
              <div className="mt-6">
                <Link
                  href="/leases/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Lease
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {leases.map((lease) => (
                <li key={lease.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">
                          {lease.unit.property.name} - {lease.unit.unitNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tenant: {lease.tenant.firstName} {lease.tenant.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${lease.monthlyRent}/month • Status: {lease.status}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/leases/${lease.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View
                        </Link>
                        {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
                          <Link
                            href={`/leases/${lease.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
