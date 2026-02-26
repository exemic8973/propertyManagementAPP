export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Property Management System</h1>
      <p className="mt-4">Welcome to the Property Management Application!</p>
      <div className="mt-6">
        <a href="/login" className="text-blue-600 hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  )
}
