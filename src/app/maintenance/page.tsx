import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import DashboardLayout from "@/components/layout/DashboardLayout"

async function getMaintenanceRequests(userRole: string, userId: string) {
  if (userRole === "ADMIN") {
    return await prisma.maintenanceRequest.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
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
    return await prisma.maintenanceRequest.findMany({
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
          },
        },
        unit: {
          include: {
            property: {
              select: {
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
    return await prisma.maintenanceRequest.findMany({
      where: {
        tenantId: userId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
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

export default async function MaintenancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const requests = await getMaintenanceRequests(session.user.role, session.user.id)

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
            Add Request
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              No maintenance requests found.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">
                          {request.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.unit.property.name} - {request.unit.unitNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted by: {request.tenant.firstName} {request.tenant.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {request.status} • Priority: {request.priority}
                        </p>
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
