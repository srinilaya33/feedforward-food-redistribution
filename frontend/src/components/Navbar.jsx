import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-800 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-primary-500">
              Feed Forward
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary-500 transition-colors">
              Home
            </Link>
            
            {isAuthenticated && (
              <Link to="/dashboard" className="hover:text-primary-500 transition-colors">
                Dashboard
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/analytics" className="hover:text-primary-500 transition-colors">
                Analytics
              </Link>
            )}
            
            <Link to="/contact" className="hover:text-primary-500 transition-colors">
              Contact
            </Link>
            
            <Link to="/faq" className="hover:text-primary-500 transition-colors">
              FAQ
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary-500 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md hover:bg-dark-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md hover:bg-dark-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/analytics"
                className="block px-3 py-2 rounded-md hover:bg-dark-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
            )}
            
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md hover:bg-dark-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            <Link
              to="/faq"
              className="block px-3 py-2 rounded-md hover:bg-dark-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>

            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-300">
                  {user?.name} ({user?.role})
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-dark-600 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md bg-primary-500 hover:bg-primary-600 transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
