export default function TestBasicPage() {
  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Basic Test Page</h1>
          <p className="text-gray-600">This page tests the basic UI without any database connections.</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-800">✅ UI Working</h3>
              <p className="text-sm">Modern UI components are loading correctly.</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800">🔧 Database Status</h3>
              <p className="text-sm">Database connection needs to be tested separately.</p>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <a href="/test-simple" className="btn-secondary inline-block">
              Simple Test
            </a>
            <a href="/" className="btn-primary inline-block">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
