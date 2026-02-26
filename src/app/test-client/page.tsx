'use client'

import { useState, useEffect } from 'react'

export default function TestClientPage() {
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    // Test basic functionality without Prisma
    setTimeout(() => {
      setStatus('✅ Client-side rendering working')
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Client-Side Test</h1>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              status.includes('✅') ? 'bg-green-50 text-green-800' : 
              'bg-yellow-50 text-yellow-800'
            }`}>
              <h3 className="font-semibold">{status}</h3>
              {error && <p className="text-sm mt-2">{error}</p>}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800">Next Steps:</h3>
              <ul className="text-sm mt-2 list-disc list-inside">
                <li>Test basic server components</li>
                <li>Test database connection separately</li>
                <li>Debug Prisma client initialization</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <a href="/test-basic" className="btn-secondary inline-block">
              Basic Test
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
