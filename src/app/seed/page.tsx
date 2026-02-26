import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function SeedPage() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@property.com' },
      update: {},
      create: {
        email: 'admin@property.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    })

    // Create sample property
    const property = await prisma.property.create({
      data: {
        name: 'Sunset Apartments',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        type: 'Apartment',
        description: 'A beautiful apartment complex',
      },
    })

    // Create sample units
    const unit1 = await prisma.unit.create({
      data: {
        unitNumber: 'A101',
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1000,
        rentAmount: 1500,
        propertyId: property.id,
      },
    })

    const unit2 = await prisma.unit.create({
      data: {
        unitNumber: 'A102',
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 750,
        rentAmount: 1200,
        propertyId: property.id,
      },
    })

    // Create sample tenant
    const tenantPassword = await bcrypt.hash('tenant123', 12)
    const tenant = await prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: tenantPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'TENANT',
      },
    })

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600">Database Seeded Successfully!</h1>
        <div className="mt-6 space-y-2">
          <p><strong>Admin User:</strong> admin@property.com / admin123</p>
          <p><strong>Tenant User:</strong> john.doe@email.com / tenant123</p>
          <p><strong>Property:</strong> {property.name}</p>
          <p><strong>Units:</strong> {unit1.unitNumber}, {unit2.unitNumber}</p>
        </div>
        <div className="mt-6">
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Seeding Error</h1>
        <p className="mt-4">Failed to seed database</p>
        <p className="mt-2 text-sm text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">
          Back to Home
        </a>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
