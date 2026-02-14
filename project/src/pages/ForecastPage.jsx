import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForecastPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { district, crop, acres, total_expense } = location.state || {};

  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Yield Dictionary (Simple lookup) - Same as backend
  const YIELD_PER_ACRE = {
    "Paddy": 20,
    "Maize": 18,
    "Wheat": 12,
    "Cotton": 15,
    "Groundnut": 8,
    "Chilli": 10
  };

  useEffect(() => {
    if (!district || !crop || !acres) {
      // Redirect if missing data
      navigate('/finance');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Weather & Risk
        const weatherRes = await axios.get(`https://theagritradeanalyst.onrender.com/weather?district=${district}`);
        setWeatherData(weatherRes.data);

        // 2. Fetch 30-Day Forecast using /predict-latest
        const forecastRes = await axios.get('https://theagritradeanalyst.onrender.com/predict-latest', {
          params: { crop, district }
        });

        // Process forecast data to add profit calculations
        const rawForecast = forecastRes.data;
        const cropYield = YIELD_PER_ACRE[crop] || 15; // Default 15

        const processedForecast = rawForecast.map((item, index) => {
          const price = item.Predicted_Price;
          const predicted_income = price * cropYield * parseFloat(acres);
          const predicted_profit = predicted_income - parseFloat(total_expense);

          // Format date
          let dateStr = `Day ${index + 1}`;
          if (item.Date) {
            const d = new Date(item.Date);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString('en-GB'); // DD/MM/YYYY
            }
          }

          return {
            day: index + 1,
            date: dateStr,
            price: Math.round(price * 100) / 100,
            income: Math.round(predicted_income * 100) / 100,
            profit: Math.round(predicted_profit * 100) / 100
          };
        });

        setForecastData(processedForecast);
      } catch (err) {
        console.error(err);
        setError('Failed to load forecast data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [district, crop, acres, total_expense, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-green-700">
          🔮 30-Day Forecast & Advisory
        </h2>
        <button
          onClick={() => navigate('/finance')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          ← Back to Finance Tracker
        </button>
      </div>

      {loading && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">Loading predictions and weather data...</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {!loading && !error && (
        <>
          {/* WEATHER ADVISORY */}
          {weatherData && (
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                🌤️ Weather Advisory
              </h3>

              <div className={`p-4 rounded-lg ${weatherData.risk === 'High Risk' ? 'bg-red-100 border-l-4 border-red-500' :
                weatherData.risk === 'Moderate Risk' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                  'bg-green-100 border-l-4 border-green-500'
                }`}>
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg mb-1">Current Weather in {weatherData.district}</h4>
                    <p className="text-sm text-gray-700">
                      Temp: <strong>{weatherData.weather.temp}°C</strong> |
                      Humidity: <strong>{weatherData.weather.humidity}%</strong> |
                      Rain: <strong>{weatherData.weather.rainfall}mm</strong>
                    </p>
                  </div>
                  <div className="text-center md:text-right mt-4 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-1 ${weatherData.risk === 'High Risk' ? 'bg-red-200 text-red-800' :
                      weatherData.risk === 'Moderate Risk' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                      {weatherData.risk}
                    </span>
                    <p className="font-medium text-gray-800">{weatherData.advisory}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 30-DAY FORECAST TABLE */}
          {forecastData && (
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📈 30-Day Price & Profit Projection
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Day</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Pred. Price (₹/q)</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Est. Income (₹)</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Est. Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((day) => (
                      <tr key={day.day} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">{day.day}</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">{day.date}</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">₹{day.price}</td>
                        <td className="py-2 px-4 border-b text-sm text-green-600 font-medium">₹{day.income.toLocaleString()}</td>
                        <td className={`py-2 px-4 border-b text-sm font-bold ${day.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ₹{day.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ForecastPage;
