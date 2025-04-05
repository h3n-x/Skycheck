import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaWind, FaCloud, FaThermometerHalf, FaUmbrella, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { WiHumidity, WiBarometer, WiSunrise, WiSunset, WiMoonrise, WiMoonset } from 'react-icons/wi';
import { getExtendedWeatherData, uvIndexInterpretation, airQualityInterpretation } from '../utils/extendedWeatherApi';

const ExtendedWeather = ({ city, lat, lon, tempUnit }) => {
  const [extendedData, setExtendedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('astronomy');

  useEffect(() => {
    const fetchData = async () => {
      if (!city || !lat || !lon) return;
      
      setLoading(true);
      try {
        const data = await getExtendedWeatherData(city, lat, lon);
        setExtendedData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching extended weather data:', err);
        setError('Failed to load extended weather data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [city, lat, lon]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !extendedData || (!extendedData.weatherAPI && !extendedData.tomorrowIO)) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Extended weather data is currently unavailable</p>
      </div>
    );
  }

  const { weatherAPI, tomorrowIO } = extendedData;

  // Convert temperature based on unit
  const convertTemp = (temp) => {
    if (!temp) return 'N/A';
    if (tempUnit === 'C') return Math.round(temp);
    return Math.round((temp * 9/5) + 32);
  };

  // Render astronomy data
  const renderAstronomy = () => {
    if (!weatherAPI || !weatherAPI.astronomy) return <p>Astronomy data unavailable</p>;
    
    const { astronomy } = weatherAPI;
    
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <FaSun className="mr-2 text-orange-400" /> Sun
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <WiSunrise className="text-2xl text-orange-500 mr-1" />
              <div>
                <p className="text-xs text-gray-600">Sunrise</p>
                <p className="font-medium">{astronomy.sunrise}</p>
              </div>
            </div>
            <div className="flex items-center">
              <WiSunset className="text-2xl text-orange-700 mr-1" />
              <div>
                <p className="text-xs text-gray-600">Sunset</p>
                <p className="font-medium">{astronomy.sunset}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
            <FaMoon className="mr-2 text-indigo-500" /> Moon
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <WiMoonrise className="text-2xl text-indigo-500 mr-1" />
              <div>
                <p className="text-xs text-gray-600">Moonrise</p>
                <p className="font-medium">{astronomy.moonrise}</p>
              </div>
            </div>
            <div className="flex items-center">
              <WiMoonset className="text-2xl text-indigo-700 mr-1" />
              <div>
                <p className="text-xs text-gray-600">Moonset</p>
                <p className="font-medium">{astronomy.moonset}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm"><span className="font-medium">Phase:</span> {astronomy.moonPhase}</p>
            <p className="text-sm"><span className="font-medium">Illumination:</span> {astronomy.moonIllumination}%</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render air quality data
  const renderAirQuality = () => {
    if (!weatherAPI || !weatherAPI.airQuality) return <p>Air quality data unavailable</p>;
    
    const { airQuality } = weatherAPI;
    const aqiLevel = airQualityInterpretation[airQuality.usEpaIndex] || airQualityInterpretation[1];
    
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Air Quality Index</h3>
          <div className="flex items-center mb-3">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: aqiLevel.color }}
            >
              <span className="text-xl font-bold text-white">{airQuality.usEpaIndex}</span>
            </div>
            <div>
              <p className="font-semibold text-lg">{aqiLevel.level}</p>
              <p className="text-sm text-gray-600">{aqiLevel.description}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Pollutants</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">Carbon Monoxide (CO)</p>
              <p className="font-medium">{airQuality.co.toFixed(1)} μg/m³</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">Nitrogen Dioxide (NO₂)</p>
              <p className="font-medium">{airQuality.no2.toFixed(1)} μg/m³</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">Ozone (O₃)</p>
              <p className="font-medium">{airQuality.o3.toFixed(1)} μg/m³</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">Sulfur Dioxide (SO₂)</p>
              <p className="font-medium">{airQuality.so2.toFixed(1)} μg/m³</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">PM2.5</p>
              <p className="font-medium">{airQuality.pm2_5.toFixed(1)} μg/m³</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-500">PM10</p>
              <p className="font-medium">{airQuality.pm10.toFixed(1)} μg/m³</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render UV index data
  const renderUVIndex = () => {
    let uvIndex = 0;
    
    if (tomorrowIO && tomorrowIO.hourly && tomorrowIO.hourly.length > 0) {
      uvIndex = tomorrowIO.hourly[0].uvIndex;
    } else if (weatherAPI && weatherAPI.current) {
      uvIndex = weatherAPI.current.uv;
    }
    
    const uvInfo = uvIndexInterpretation[Math.round(uvIndex)] || uvIndexInterpretation[0];
    
    return (
      <motion.div 
        className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-orange-800 mb-3">UV Index</h3>
        <div className="flex items-center mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: uvInfo.color }}
          >
            <span className="text-xl font-bold text-white">{Math.round(uvIndex)}</span>
          </div>
          <div>
            <p className="font-semibold text-lg">{uvInfo.level}</p>
            <p className="text-sm text-gray-600">{uvInfo.description}</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${Math.min(100, (uvIndex / 11) * 100)}%`,
              background: `linear-gradient(to right, #299501, #F7E401, #F95901, #D90011, #6C49CB)`
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0</span>
          <span>3</span>
          <span>6</span>
          <span>8</span>
          <span>11+</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Very High</span>
          <span>Extreme</span>
        </div>
      </motion.div>
    );
  };

  // Render hourly forecast
  const renderHourlyForecast = () => {
    let hourlyData = [];
    
    if (tomorrowIO && tomorrowIO.hourly && tomorrowIO.hourly.length > 0) {
      hourlyData = tomorrowIO.hourly.slice(0, 24);
    } else if (weatherAPI && weatherAPI.extendedForecast && weatherAPI.extendedForecast.length > 0) {
      hourlyData = weatherAPI.extendedForecast[0].hourly.slice(0, 24);
    }
    
    if (hourlyData.length === 0) {
      return <p>Hourly forecast data unavailable</p>;
    }
    
    return (
      <motion.div 
        className="overflow-x-auto bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex space-x-4 pb-2 min-w-max">
          {hourlyData.map((hour, index) => {
            // Format time
            const time = new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Get temperature
            let temp;
            if (hour.temperature !== undefined) {
              temp = convertTemp(hour.temperature);
            } else if (hour.temp_c !== undefined) {
              temp = tempUnit === 'C' ? Math.round(hour.temp_c) : Math.round((hour.temp_c * 9/5) + 32);
            }
            
            // Get weather icon
            let icon, condition;
            if (hour.weatherCode !== undefined) {
              // Tomorrow.io
              const weatherCode = hour.weatherCode.toString();
              icon = `/icons/tomorrow/${weatherCode}.svg`;
              condition = hour.weatherDescription;
            } else if (hour.condition !== undefined) {
              // WeatherAPI
              icon = hour.condition.icon;
              condition = hour.condition.text;
            }
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center bg-white bg-opacity-60 p-2 rounded-lg shadow-sm min-w-[80px]"
              >
                <p className="text-sm font-medium">{time}</p>
                {icon && (
                  <img 
                    src={icon} 
                    alt={condition || 'weather'} 
                    className="w-10 h-10 my-1"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://openweathermap.org/img/wn/02d@2x.png';
                    }}
                  />
                )}
                <p className="text-lg font-semibold">{temp}°{tempUnit}</p>
                <div className="flex items-center text-xs text-gray-600">
                  <FaWind className="mr-1" size={10} />
                  <span>
                    {hour.windSpeed !== undefined 
                      ? Math.round(hour.windSpeed) 
                      : (hour.wind_kph !== undefined ? Math.round(hour.wind_kph / 3.6) : 'N/A')
                    } m/s
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <WiHumidity className="mr-1" size={14} />
                  <span>
                    {hour.humidity !== undefined 
                      ? Math.round(hour.humidity) 
                      : 'N/A'
                    }%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Render alerts
  const renderAlerts = () => {
    if (!weatherAPI || !weatherAPI.alerts || weatherAPI.alerts.length === 0) {
      return (
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <p className="text-gray-600">No weather alerts at this time</p>
        </div>
      );
    }
    
    return (
      <motion.div 
        className="space-y-3 bg-gradient-to-br from-pink-50 to-red-50 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {weatherAPI.alerts.map((alert, index) => (
          <div key={index} className="bg-red-50 border-l-4 border-red-300 p-4 rounded-r-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-400 mr-2 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-700">{alert.event}</h4>
                <p className="text-sm text-gray-700 mt-1">{alert.desc}</p>
                <div className="mt-2 text-xs text-gray-600">
                  <p>Effective: {new Date(alert.effective).toLocaleString()}</p>
                  <p>Expires: {new Date(alert.expires).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="card bg-white shadow-lg rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-pastel-blue to-pastel-purple p-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Extended Weather Information</h2>
      </div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'astronomy' 
              ? 'bg-blue-400 text-white' 
              : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
          }`}
          onClick={() => setActiveTab('astronomy')}
        >
          <div className="flex items-center">
            <FaSun className="mr-1" />
            <span className="font-medium">Astronomy</span>
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'airQuality' 
              ? 'bg-green-400 text-white' 
              : 'bg-green-100 text-gray-700 hover:bg-green-200'
          }`}
          onClick={() => setActiveTab('airQuality')}
        >
          <div className="flex items-center">
            <FaWind className="mr-1" />
            <span className="font-medium">Air Quality</span>
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'uvIndex' 
              ? 'bg-yellow-400 text-white' 
              : 'bg-yellow-100 text-gray-700 hover:bg-yellow-200'
          }`}
          onClick={() => setActiveTab('uvIndex')}
        >
          <div className="flex items-center">
            <FaSun className="mr-1" />
            <span className="font-medium">UV Index</span>
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'hourly' 
              ? 'bg-purple-400 text-white' 
              : 'bg-purple-100 text-gray-700 hover:bg-purple-200'
          }`}
          onClick={() => setActiveTab('hourly')}
        >
          <div className="flex items-center">
            <FaThermometerHalf className="mr-1" />
            <span className="font-medium">Hourly Forecast</span>
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'alerts' 
              ? 'bg-red-400 text-white' 
              : 'bg-red-100 text-gray-700 hover:bg-red-200'
          }`}
          onClick={() => setActiveTab('alerts')}
        >
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-1" />
            <span className="font-medium">Alerts</span>
          </div>
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        {activeTab === 'astronomy' && renderAstronomy()}
        {activeTab === 'airQuality' && renderAirQuality()}
        {activeTab === 'uvIndex' && renderUVIndex()}
        {activeTab === 'hourly' && renderHourlyForecast()}
        {activeTab === 'alerts' && renderAlerts()}
      </div>
    </motion.div>
  );

};

export default ExtendedWeather;
