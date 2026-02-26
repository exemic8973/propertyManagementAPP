import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
