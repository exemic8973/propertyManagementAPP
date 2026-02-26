export default function TestEnvPage() {
  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Environment Variables Test</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800">DATABASE_URL:</h3>
              <p className="text-sm">{process.env.DATABASE_URL || 'Not found'}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-800">NODE_ENV:</h3>
              <p className="text-sm">{process.env.NODE_ENV || 'Not found'}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-purple-800">NEXTAUTH_SECRET:</h3>
              <p className="text-sm">{process.env.NEXTAUTH_SECRET ? 'Set' : 'Not found'}</p>
            </div>
          </div>

          <div className="mt-8">
            <a href="/" className="btn-primary inline-block">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
