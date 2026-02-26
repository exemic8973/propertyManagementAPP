import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function TestUsersPage() {
  try {
    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    // Admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@propertyhub.com' },
      update: {},
      create: {
        email: 'admin@propertyhub.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    })

    // Employee user
    const employee = await prisma.user.upsert({
      where: { email: 'employee@propertyhub.com' },
      update: {},
      create: {
        email: 'employee@propertyhub.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Employee',
        role: 'EMPLOYEE',
      },
    })

    // Tenant user
    const tenant = await prisma.user.upsert({
      where: { email: 'tenant@propertyhub.com' },
      update: {},
      create: {
        email: 'tenant@propertyhub.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Tenant',
        role: 'TENANT',
      },
    })

    // Additional test users
    const tenant2 = await prisma.user.upsert({
      where: { email: 'tenant2@propertyhub.com' },
      update: {},
      create: {
        email: 'tenant2@propertyhub.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'TENANT',
      },
    })

    const manager = await prisma.user.upsert({
      where: { email: 'manager@propertyhub.com' },
      update: {},
      create: {
        email: 'manager@propertyhub.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Manager',
        role: 'EMPLOYEE',
      },
    })

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return (
      <div className="min-h-screen gradient-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Test User Accounts</h1>
            <p className="text-xl text-gray-600">Use these accounts to test different roles and features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Admin Account */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Administrator</h3>
                  <span className="badge-error">ADMIN</span>
                </div>
              </div>
              <div className="space-y-2">
                <p><strong>Email:</strong> admin@propertyhub.com</p>
                <p><strong>Password:</strong> test123</p>
                <p><strong>Access:</strong> Full system access</p>
              </div>
            </div>

            {/* Employee Account */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Employee</h3>
                  <span className="badge-info">EMPLOYEE</span>
                </div>
              </div>
              <div className="space-y-2">
                <p><strong>Email:</strong> employee@propertyhub.com</p>
                <p><strong>Password:</strong> test123</p>
                <p><strong>Access:</strong> Property management</p>
              </div>
            </div>

            {/* Tenant Account */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Tenant</h3>
                  <span className="badge-success">TENANT</span>
                </div>
              </div>
              <div className="space-y-2">
                <p><strong>Email:</strong> tenant@propertyhub.com</p>
                <p><strong>Password:</strong> test123</p>
                <p><strong>Access:</strong> Personal data only</p>
              </div>
            </div>

            {/* Manager Account */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Manager</h3>
                  <span className="badge-info">EMPLOYEE</span>
                </div>
              </div>
              <div className="space-y-2">
                <p><strong>Email:</strong> manager@propertyhub.com</p>
                <p><strong>Password:</strong> test123</p>
                <p><strong>Access:</strong> Advanced property management</p>
              </div>
            </div>
          </div>

          {/* All Users Table */}
          <div className="glass-morphism rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Created Users</h2>
            <div className="overflow-x-auto">
              <table className="modern-table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'ADMIN' ? 'badge-error' :
                          user.role === 'EMPLOYEE' ? 'badge-info' : 'badge-success'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="space-y-4">
              <a href="/login" className="btn-primary inline-block">
                Go to Login Page
              </a>
              <div className="text-gray-600">
                <p>Use any of the accounts above to test the system</p>
                <p className="text-sm mt-2">All accounts use the same password: <strong>test123</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-8">
        <div className="glass-morphism rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Creating Test Users</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <a href="/" className="btn-primary inline-block">
            Back to Home
          </a>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
