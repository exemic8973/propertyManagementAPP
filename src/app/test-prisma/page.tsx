'use client'

import { useState, useEffect } from 'react'

export default function TestPrismaPage() {
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    const testPrismaConnection = async () => {
      try {
        const response = await fetch('/api/test-prisma')
        const data = await response.json()
        setStatus('Success: ' + data.message)
      } catch (err) {
        setError('Error: ' + err.message)
        setStatus('Failed')
      }
    }

    testPrismaConnection()
  }, [])

  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Prisma Connection Test</h1>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              status.includes('Success') ? 'bg-green-50 text-green-800' : 
              status.includes('Error') ? 'bg-red-50 text-red-800' : 
              'bg-yellow-50 text-yellow-800'
            }`}>
              <h3 className="font-semibold">{status}</h3>
              {error && <p className="text-sm mt-2">{error}</p>}
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
