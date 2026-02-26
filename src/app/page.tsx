import Link from 'next/link'
import { 
  SparklesIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="zillow-white-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="zillow-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white mb-6">
                Modern Property
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                  Management
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Streamline your property management with our cutting-edge platform. 
                Manage properties, tenants, leases, and payments all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 zillow-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold zillow-text-primary mb-4">Powerful Features</h2>
            <p className="text-lg zillow-text-secondary max-w-2xl mx-auto">
              Everything you need to manage your properties efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Property Management</h3>
              <p className="zillow-text-secondary">
                Track all your properties in one place with detailed analytics and reporting.
              </p>
            </div>
            
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Tenant Management</h3>
              <p className="zillow-text-secondary">
                Manage tenant information, lease agreements, and communication seamlessly.
              </p>
            </div>
            
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Payment Processing</h3>
              <p className="zillow-text-secondary">
                Automated rent collection, payment tracking, and financial reporting.
              </p>
            </div>
            
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Maintenance Tracking</h3>
              <p className="zillow-text-secondary">
                Track maintenance requests, schedule repairs, and manage vendors efficiently.
              </p>
            </div>
            
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Analytics Dashboard</h3>
              <p className="zillow-text-secondary">
                Real-time insights into occupancy rates, revenue, and property performance.
              </p>
            </div>
            
            <div className="zillow-card p-8 text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold zillow-text-primary mb-3">Document Management</h3>
              <p className="zillow-text-secondary">
                Store and manage leases, contracts, and important documents securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold zillow-text-primary mb-4">Trusted by Property Managers</h2>
            <p className="text-lg zillow-text-secondary max-w-2xl mx-auto">
              Join thousands of property managers who trust our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                10,000+
              </div>
              <p className="zillow-text-secondary">Properties Managed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                50,000+
              </div>
              <p className="zillow-text-secondary">Happy Tenants</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                $100M+
              </div>
              <p className="zillow-text-secondary">Rent Processed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 zillow-bg-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="zillow-card p-12">
            <h2 className="text-3xl font-bold zillow-text-primary mb-4">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-lg zillow-text-secondary mb-8">
              Get started today and experience the future of property management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="zillow-btn-primary"
              >
                Start Free Trial
              </Link>
              <Link
                href="/setup-test"
                className="zillow-btn-secondary"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t zillow-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="zillow-text-secondary">
              © 2024 PropertyHub. Built with modern technology and designed for excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
