export default function TestSimplePage() {
  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Test Page</h1>
          <p className="text-gray-600">This page doesn't use Prisma at all.</p>
          <div className="mt-4">
            <a href="/" className="btn-primary inline-block">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
