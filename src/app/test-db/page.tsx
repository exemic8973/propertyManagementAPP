import prisma from '@/lib/db'

export default async function TestDBPage() {
  try {
    const userCount = await prisma.user.count()
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Database Test</h1>
        <p className="mt-4">Database connection successful!</p>
        <p className="mt-2">Users in database: {userCount}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">
          Back to Home
        </a>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
        <p className="mt-4">Failed to connect to database</p>
        <p className="mt-2 text-sm text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">
          Back to Home
        </a>
      </div>
    )
  }
}
