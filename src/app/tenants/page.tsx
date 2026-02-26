import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Link from "next/link"

async function getTenants(userRole: string, userId: string) {
  if (userRole === "ADMIN" || userRole === "EMPLOYEE") {
    return await prisma.user.findMany({
      where: {
        role: "TENANT",
      },
      include: {
        tenantLeases: {
          include: {
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
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }
  
  return []
}

export default async function TenantsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const tenants = await getTenants(session.user.role, session.user.id)

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
          {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
            <Link
              href="/tenants/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Tenant
            </Link>
          )}
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first tenant.
            </p>
            {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
              <div className="mt-6">
                <Link
                  href="/tenants/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Tenant
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {tenant.firstName} {tenant.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                  {tenant.phone && (
                    <p className="text-sm text-gray-500">{tenant.phone}</p>
                  )}
                  
                  {tenant.tenantLeases.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">
                        Current lease: {tenant.tenantLeases[0].unit.property.name} - {tenant.tenantLeases[0].unit.unitNumber}
                      </span>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/tenants/${tenant.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
