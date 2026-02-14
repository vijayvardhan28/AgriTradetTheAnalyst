import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MarketArbitrageCard from '../components/MarketArbitrageCard';
import CreditScoreCard from '../components/CreditScoreCard';

const FinanceTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    district: '',
    crop: '',
    season: '',
    acres: '1'
  });

  const [result, setResult] = useState(null);
  const [arbitrageData, setArbitrageData] = useState(null);
  const [creditData, setCreditData] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [forecast, setForecast] = useState([]);


  const [expenseMode, setExpenseMode] = useState('recommended'); // 'recommended' or 'custom'
  const [customExpense, setCustomExpense] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [options, setOptions] = useState({
    districts: [],
    crops: [],
    seasons: []
  });

  // --------------------------
  // LOAD ALL OPTIONS
  // --------------------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [districtsRes, cropsRes, seasonsRes] = await Promise.all([
          axios.get('https://theagritradeanalyst.onrender.com/districts'),
          axios.get('https://theagritradeanalyst.onrender.com/crops'),
          axios.get('https://theagritradeanalyst.onrender.com/seasons')
        ]);

        setOptions({
          districts: districtsRes.data,
          crops: cropsRes.data,
          seasons: seasonsRes.data
        });
      } catch (err) {
        setError('Failed to load options. Please refresh the page.');
      }
    };

    fetchOptions();
  }, []);

  // --------------------------
  // AUTOFILL FROM VOICE BOT
  // --------------------------
  useEffect(() => {
    if (location.state) {
      const { crop, district, autoTrigger } = location.state;
      if (crop || district) {
        setFormData(prev => ({
          ...prev,
          crop: crop || prev.crop,
          district: district || prev.district
        }));

        // If both are present and autoTrigger is true, we could trigger calculation
        // But we need to be careful about infinite loops or race conditions with state updates
        // For now, we just prefill.
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --------------------------
  // FINANCIAL CALCULATION
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setArbitrageData(null);
    setCreditData(null);
    setShowForecast(false);
    setForecast([]);


    try {
      // 1. Calculate Financials
      const financialRes = await axios.post('https://theagritradeanalyst.onrender.com/calculate', {
        ...formData,
        acres: parseFloat(formData.acres),
        expenseMode: expenseMode,
        customExpensePerAcre: expenseMode === 'custom' ? parseFloat(customExpense) : null
      });
      setResult(financialRes.data);

      // 2. Fetch Arbitrage Opportunities
      const arbitrageRes = await axios.post('https://theagritradeanalyst.onrender.com/arbitrage', {
        crop: formData.crop,
        district: formData.district
      });
      setArbitrageData(arbitrageRes.data);

      // 3. Calculate Credit Score
      if (financialRes.data) {
        const creditRes = await axios.post('https://theagritradeanalyst.onrender.com/credit-score', {
          income: financialRes.data.totalIncome,
          expense: financialRes.data.totalExpense,
          crop: formData.crop
        });
        setCreditData(creditRes.data);

      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Calculation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const [weatherData, setWeatherData] = useState(null);

  const fetchForecast = async () => {
    try {
      const response = await axios.get("https://theagritradeanalyst.onrender.com/predict-latest", {
        params: {
          crop: formData.crop,
          district: formData.district
        }
      });
      setForecast(response.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load forecast");
    }
  };

  const fetchWeather = async () => {
    if (!formData.district) {
      alert("Please select a district first.");
      return;
    }
    try {
      const response = await axios.get(`https://theagritradeanalyst.onrender.com/weather?district=${formData.district}`);
      setWeatherData(response.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load weather advisory");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        💰 Agri-Finance Tracker
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select District</option>
              {options.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Crop</label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Crop</option>
              {options.crops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Season</label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Season</option>
              {options.seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Acres</label>
            <input
              type="number"
              name="acres"
              value={formData.acres}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 5"
              required
            />
          </div>

          {/* DUAL EXPENSE MODE */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded border">
            <label className="block text-gray-700 font-medium mb-2">Expense Calculation Mode</label>
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expenseMode"
                  value="recommended"
                  checked={expenseMode === 'recommended'}
                  onChange={() => setExpenseMode('recommended')}
                  className="mr-2"
                />
                Use Recommended Expense
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expenseMode"
                  value="custom"
                  checked={expenseMode === 'custom'}
                  onChange={() => setExpenseMode('custom')}
                  className="mr-2"
                />
                Enter My Own Expense
              </label>
            </div>

            {expenseMode === 'custom' && (
              <div>
                <label className="block text-gray-700 text-sm mb-1">Enter Your Expense Per Acre (₹)</label>
                <input
                  type="number"
                  value={customExpense}
                  onChange={(e) => setCustomExpense(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 15000"
                  required={expenseMode === 'custom'}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-bold text-lg"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate Financials"}
          </button>



          {/* ACTION BUTTONS ROW */}
          <div className="col-span-1 md:col-span-2 mt-4">
            {/* FORECAST & WEATHER BUTTON */}
            <button
              type="button"
              className="w-full py-2 px-4 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              onClick={async () => {
                if (!showForecast) {
                  await Promise.all([fetchForecast(), fetchWeather()]);
                }
                setShowForecast(!showForecast);
              }}
              disabled={!result}
            >
              {showForecast ? "Hide Forecast & Weather" : "View 30-Day Forecast & Weather"}
            </button>
          </div>
        </form>
      </div>



      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {
        result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm uppercase font-bold">Estimated Revenue</p>
                <p className="text-2xl font-bold text-green-700">₹{result.totalIncome?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-gray-600 text-sm uppercase font-bold">Estimated Cost</p>
                <p className="text-2xl font-bold text-red-600">₹{result.totalExpense?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm uppercase font-bold">Net Profit</p>
                <p className={`text-2xl font-bold ${result.balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
                  ₹{result.balance?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* WEATHER ADVISORY CARD */}
      {
        weatherData && showForecast && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Weather Advisory: {weatherData.district}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-500 uppercase">Temperature</p>
                <p className="text-lg font-bold text-blue-700">{weatherData.weather.temp}°C</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-500 uppercase">Humidity</p>
                <p className="text-lg font-bold text-blue-700">{weatherData.weather.humidity}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-500 uppercase">Rainfall</p>
                <p className="text-lg font-bold text-blue-700">{weatherData.weather.rainfall} mm</p>
              </div>
              <div className={`p-3 rounded ${weatherData.risk === 'High Risk' ? 'bg-red-100' : 'bg-green-100'}`}>
                <p className="text-xs text-gray-500 uppercase">Risk Level</p>
                <p className={`text-lg font-bold ${weatherData.risk === 'High Risk' ? 'text-red-700' : 'text-green-700'}`}>
                  {weatherData.risk}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Advisory:</strong> {weatherData.advisory}
            </div>
          </div>
        )
      }

      {
        showForecast && forecast.length > 0 && result && (
          <div className="mt-8 transition-all duration-300 ease-in-out bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">30-Day Predicted Prices & Profit</h3>

            <div className="overflow-x-auto shadow rounded-lg">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Day</th>
                    <th className="border p-2 text-left">Predicted Price (₹/q)</th>
                    <th className="border p-2 text-left">Predicted Income (₹)</th>
                    <th className="border p-2 text-left">Predicted Profit (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {forecast.map((day, index) => {
                    const predictedIncome =
                      day.Predicted_Price * result.yieldPerAcre * parseFloat(formData.acres);

                    const predictedProfit = predictedIncome - result.totalExpense;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">₹{day.Predicted_Price.toFixed(2)}</td>
                        <td className="border p-2 text-green-600 font-medium">₹{predictedIncome.toFixed(2)}</td>
                        <td className={`border p-2 font-bold ${predictedProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ₹{predictedProfit.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* NEW FEATURES */}
      {arbitrageData && <MarketArbitrageCard arbitrageData={arbitrageData} />}
      {creditData && <CreditScoreCard creditData={creditData} />}



    </div >
  );
};

export default FinanceTracker;
