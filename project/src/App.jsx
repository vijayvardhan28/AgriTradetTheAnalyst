import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './pages/Home';
import FinanceTracker from './pages/FinanceTracker';
import GovernmentSchema from './pages/GovernmentSchema';
import ContactUs from './pages/ContactUs';
import LoanCalculator from './pages/LoanCalculator';
import ForecastPage from './pages/ForecastPage';
import VoiceBot from './components/VoiceBot';

import { LanguageProvider } from './context/LanguageContext';
import AgriBotPage from './pages/AgriBotPage';

import DiseaseDetector from './pages/DiseaseDetector';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <VoiceBot />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/finance" element={<FinanceTracker />} />
            <Route path="/disease-detector" element={<DiseaseDetector />} />
            <Route path="/schemes" element={<GovernmentSchema />} />
            <Route path="/loan-calculator" element={<LoanCalculator />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/agribot" element={<AgriBotPage />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;