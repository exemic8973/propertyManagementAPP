export default function TestNoAuthPage() {
  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">No Auth Test Page</h1>
          <p className="text-gray-600">This page doesn't use authentication.</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-800">✅ Basic Setup Working</h3>
              <p className="text-sm">UI components and basic routing are working.</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-xl">
              <h3 className="font-semibold text-yellow-800">🔧 Authentication Issues</h3>
              <p className="text-sm">NextAuth configuration needs debugging.</p>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <a href="/setup-test" className="btn-secondary inline-block">
              Setup Test
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
