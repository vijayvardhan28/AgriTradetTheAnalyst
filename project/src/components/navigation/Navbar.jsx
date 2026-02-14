import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when a link is clicked
  const handleLinkClick = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={handleLinkClick}>
              <BarChart2 className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AgriTradeAnalyst</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Home</Link>
            <Link to="/finance" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">FinanceTracker</Link>
            <Link to="/disease-detector" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Disease Detector</Link>
            <Link to="/schemes" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">GovernmentSchemes</Link>
            <Link to="/agribot" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">AgriBot</Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium">Contact Us</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link to="/finance" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">FinanceTracker</Link>
            <Link to="/disease-detector" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">Disease Detector</Link>
            <Link to="/schemes" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">GovernmentSchemes</Link>
            <Link to="/agribot" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">AgriBot</Link>
            <Link to="/contact" onClick={handleLinkClick} className="text-gray-700 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium">Contact Us</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;