import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { 
  Heart, 
  Users, 
  MapPin, 
  CheckCircle, 
  TrendingUp, 
  Award,
  ArrowRight,
  Shield,
  Clock,
  Target
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-16"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 100%), url('/food-donation-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <div className="animate-fadeInUp">
            <p className="text-primary-400 font-semibold mb-4 tracking-wider uppercase text-sm">
              Community • Share • Reduce Waste
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              From Surplus to Plate — Quick. Fair. Safe.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200 leading-relaxed">
              Feed Forward connects donors, volunteers and local NGOs for efficient redistribution of excess food, prioritizing street communities and disabled individuals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/signup" 
                className="btn btn-primary text-lg px-8 py-4 flex items-center space-x-2 shadow-2xl hover:scale-105 transform transition-all"
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/dashboard" 
                className="btn btn-secondary text-lg px-8 py-4 shadow-2xl hover:scale-105 transform transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6">
                <Link 
                  to="/login" 
                  className="text-primary-400 hover:text-primary-300 underline transition-colors"
                >
                  Already have an account? Login here
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Minimize edible food waste by building a reliable channel between donors, volunteers and receivers. Priority: footpath dwellers & handicapped.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-center mb-12">Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary-500 mb-2">5,200</div>
              <div className="text-gray-600 font-medium">Meals Donated</div>
            </div>
            
            <div className="card p-8 text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary-500 mb-2">3,300</div>
              <div className="text-gray-600 font-medium">People Fed</div>
            </div>
            
            <div className="card p-8 text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary-500 mb-2">1,200</div>
              <div className="text-gray-600 font-medium">Kg Waste Prevented</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Donate</h3>
              <p className="text-gray-600">
                Donors post excess food with details and images
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-primary-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Inspect</h3>
              <p className="text-gray-600">
                Food Quality Checker ensures safety and hygiene
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Deliver</h3>
              <p className="text-gray-600">
                Volunteers pick up and deliver using optimal routes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Feed</h3>
              <p className="text-gray-600">
                Priority to street dwellers, handicapped, orphanages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-center mb-16">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <Shield className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-400">
                Dedicated Food Quality Checkers inspect all donations before distribution
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <MapPin className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Smart Routing</h3>
              <p className="text-gray-400">
                Google Maps integration provides shortest paths for volunteers
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <Target className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Priority System</h3>
              <p className="text-gray-400">
                Intelligent allocation to high-need areas and vulnerable populations
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <Clock className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-400">
                Live notifications and status updates for all stakeholders
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <TrendingUp className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-400">
                Comprehensive insights on impact and volunteer performance
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors">
              <Award className="text-primary-500 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Appreciation System</h3>
              <p className="text-gray-400">
                Donors earn badges and recognition for their contributions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of donors, volunteers, and organizations fighting food waste together.
          </p>
          <Link 
            to="/signup" 
            className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center space-x-2 shadow-xl"
          >
            <span>Join Feed Forward Today</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 Feed Forward. All rights reserved. | Fighting food waste, one meal at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
