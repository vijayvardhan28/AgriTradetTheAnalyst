import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BarChart2 className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AgriTradeAnalyst</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/finance"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              FinanceTracker
            </Link>
            <Link
              to="/disease-detector"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              Disease Detector
            </Link>
            <Link
              to="/schemes"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              GovernmentSchemes
            </Link>
            <Link
              to="/agribot"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              AgriBot
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;