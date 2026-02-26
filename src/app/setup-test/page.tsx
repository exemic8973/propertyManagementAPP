import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function SetupTestPage() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@propertyhub.com',
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

    // Create sample unit
    const unit = await prisma.unit.create({
      data: {
        unitNumber: 'A101',
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1000,
        rentAmount: 1500,
        propertyId: property.id,
      },
    })

    return (
      <div className="min-h-screen gradient-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-morphism rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Database Setup Successful!</h1>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-semibold text-green-800">Admin User Created:</h3>
                <p>Email: admin@propertyhub.com</p>
                <p>Password: test123</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800">Sample Property:</h3>
                <p>{property.name} - {property.address}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <h3 className="font-semibold text-purple-800">Sample Unit:</h3>
                <p>{unit.unitNumber} - ${unit.rentAmount}/month</p>
              </div>
            </div>
            <div className="mt-8">
              <a href="/login" className="btn-primary inline-block">
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen gradient-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-morphism rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Setup Error</h1>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <div className="mt-8">
              <a href="/" className="btn-secondary inline-block">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
