import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Link from "next/link"

async function getProperties(userRole: string, userId: string) {
  if (userRole === "ADMIN") {
    return await prisma.property.findMany({
      include: {
        units: {
          select: {
            id: true,
            unitNumber: true,
            isOccupied: true,
          },
        },
        _count: {
          select: {
            units: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } else if (userRole === "EMPLOYEE") {
    return await prisma.property.findMany({
      where: {
        employees: {
          some: {
            employee: {
              id: userId,
            },
          },
        },
      },
      include: {
        units: {
          select: {
            id: true,
            unitNumber: true,
            isOccupied: true,
          },
        },
        _count: {
          select: {
            units: true,
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

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const properties = await getProperties(session.user.role, session.user.id)

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          {session.user.role === "ADMIN" && (
            <Link
              href="/properties/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Property
            </Link>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first property.
            </p>
            {session.user.role === "ADMIN" && (
              <div className="mt-6">
                <Link
                  href="/properties/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Property
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                  <p className="text-sm text-gray-500">{property.address}</p>
                  <p className="text-sm text-gray-500">
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {property._count.units} units
                    </span>
                    <span className="text-sm text-gray-500">
                      {property.units.filter(unit => unit.isOccupied).length} occupied
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/properties/${property.id}`}
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
