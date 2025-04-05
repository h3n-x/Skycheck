import { useState, useEffect } from 'react';
import './App.css';
import useWeather from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import CountryInfo from './components/CountryInfo';
import ExtendedWeather from './components/ExtendedWeather';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaCloudSun, FaCloudMoon, FaHeart, FaThermometerHalf, FaThermometerFull } from 'react-icons/fa';

function App() {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [timeTheme, setTimeTheme] = useState({
    background: 'from-pastel-blue to-pastel-purple',
    textColor: 'text-gray-800',
    secondaryTextColor: 'text-gray-600',
    buttonBg: 'bg-white',
    buttonText: 'text-gray-800',
    icon: <FaSun className="text-yellow-400 text-2xl" />,
    cardBg: 'bg-white bg-opacity-80'
  });
  
  const [tempUnit, setTempUnit] = useState(() => {
    // Check if user has a saved temperature unit preference
    const savedUnit = localStorage.getItem('weatherAppTempUnit');
    return savedUnit || 'C';
  });
  
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('weatherAppFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  const { 
    location, 
    weather, 
    forecast, 
    countryInfo, 
    loading, 
    error, 
    searchByCity 
  } = useWeather();
  
  // Emitir evento para almacenar datos del clima en IndexedDB (acceso offline)
  useEffect(() => {
    if (location && weather) {
      const weatherData = {
        location: {
          city: location.city,
          country: location.country,
          lat: location.lat,
          lon: location.lon
        },
        current: {
          temp: weather.main.temp,
          feels_like: weather.main.feels_like,
          humidity: weather.main.humidity,
          pressure: weather.main.pressure,
          description: weather.weather[0].description,
          icon: weather.weather[0].icon,
          windSpeed: weather.wind.speed,
          windDirection: weather.wind.deg
        }
      };
      
      // Emitir evento personalizado para que el service worker almacene los datos
      window.dispatchEvent(new CustomEvent('weather-data-updated', { 
        detail: weatherData 
      }));
    }
  }, [location, weather]);

  // Determine time of day and set appropriate theme
  useEffect(() => {
    const updateTimeTheme = () => {
      const hour = new Date().getHours();
      
      // Early morning (5am-8am)
      if (hour >= 5 && hour < 8) {
        setTimeOfDay('dawn');
        setTimeTheme({
          background: 'from-blue-200 to-pink-200',
          textColor: 'text-gray-800',
          secondaryTextColor: 'text-gray-700',
          buttonBg: 'bg-white',
          buttonText: 'text-gray-800',
          icon: <FaCloudSun className="text-orange-300 text-2xl" />,
          cardBg: 'bg-white bg-opacity-80'
        });
      }
      // Day (8am-5pm)
      else if (hour >= 8 && hour < 17) {
        setTimeOfDay('day');
        setTimeTheme({
          background: 'from-pastel-blue to-pastel-purple',
          textColor: 'text-gray-800',
          secondaryTextColor: 'text-gray-600',
          buttonBg: 'bg-white',
          buttonText: 'text-gray-800',
          icon: <FaSun className="text-yellow-400 text-2xl" />,
          cardBg: 'bg-white bg-opacity-80'
        });
      }
      // Evening (5pm-9pm)
      else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
        setTimeTheme({
          background: 'from-orange-300 to-purple-500',
          textColor: 'text-white',
          secondaryTextColor: 'text-gray-100',
          buttonBg: 'bg-white bg-opacity-90',
          buttonText: 'text-gray-800',
          icon: <FaCloudSun className="text-orange-300 text-2xl" />,
          cardBg: 'bg-gray-800 bg-opacity-50'
        });
      }
      // Night (9pm-5am)
      else {
        setTimeOfDay('night');
        setTimeTheme({
          background: 'from-gray-900 to-blue-900',
          textColor: 'text-white',
          secondaryTextColor: 'text-gray-300',
          buttonBg: 'bg-gray-800',
          buttonText: 'text-white',
          icon: <FaMoon className="text-blue-200 text-2xl" />,
          cardBg: 'bg-gray-800 bg-opacity-50'
        });
      }
    };
    
    // Initial update
    updateTimeTheme();
    
    // Update every hour
    const interval = setInterval(updateTimeTheme, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle temperature unit
  const toggleTempUnit = () => {
    const newUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(newUnit);
    localStorage.setItem('weatherAppTempUnit', newUnit);
  };
  
  // Add or remove a location from favorites
  const toggleFavorite = () => {
    if (!location) return;
    
    const isFavorite = favorites.some(fav => 
      fav.city.toLowerCase() === location.city.toLowerCase()
    );
    
    let newFavorites;
    
    if (isFavorite) {
      // Remove from favorites
      newFavorites = favorites.filter(fav => 
        fav.city.toLowerCase() !== location.city.toLowerCase()
      );
    } else {
      // Add to favorites
      newFavorites = [...favorites, { 
        city: location.city, 
        country: location.country,
        lat: location.lat,
        lon: location.lon
      }];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('weatherAppFavorites', JSON.stringify(newFavorites));
  };
  
  // Check if current location is in favorites
  const isFavorite = location && favorites.some(fav => 
    fav.city.toLowerCase() === location.city.toLowerCase()
  );

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-1000 bg-gradient-to-br ${timeTheme.background}`}>
      <div className="container mx-auto">
        <motion.header 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center items-center mb-2">
            <h1 className={`text-4xl font-bold ${timeTheme.textColor} tracking-wide`}>SkyCheck</h1>
            <motion.div 
              className="ml-3"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {timeTheme.icon}
            </motion.div>
          </div>
          
          <p className={`${timeTheme.secondaryTextColor} mb-4 max-w-2xl mx-auto text-sm md:text-base leading-relaxed`}>
            Sun, clouds, or storm? Find out in seconds with SkyCheck. Reliable data, a clean minimalist view, and useful features to keep you ready for anything.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={toggleTempUnit}
              className={`px-4 py-2 rounded-full ${timeTheme.buttonBg} ${timeTheme.buttonText} shadow-sm hover:shadow-md transition-all duration-300 flex items-center`}
            >
              {tempUnit === 'C' ? (
                <FaThermometerHalf className="text-blue-500 mr-2 text-lg" />
              ) : (
                <FaThermometerFull className="text-red-500 mr-2 text-lg" />
              )}
              <span className="font-medium">{tempUnit === 'C' ? 'Celsius' : 'Fahrenheit'}</span>
            </button>
            
            {location && (
              <button 
                onClick={toggleFavorite}
                className={`px-4 py-2 rounded-full flex items-center shadow-sm hover:shadow-md transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-pink-100 text-pink-600' 
                    : `${timeTheme.buttonBg} ${timeTheme.buttonText}`
                }`}
              >
                <FaHeart className={`mr-2 ${isFavorite ? 'text-pink-500' : 'text-gray-400'}`} />
                {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              </button>
            )}
          </div>
          
          {favorites.length > 0 && (
            <div className="mt-4">
              <p className={`text-sm ${timeTheme.secondaryTextColor} mb-2`}>Favorites:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {favorites.map((fav, index) => (
                  <button
                    key={`${fav.city}-${index}`}
                    onClick={() => searchByCity(fav.city)}
                    className={`px-3 py-1 ${timeOfDay === 'night' || timeOfDay === 'evening' ? 'bg-pink-400' : 'bg-pink-200'} rounded-full text-sm hover:bg-opacity-100 transition-all duration-300 flex items-center`}
                  >
                    <FaHeart className="text-pink-500 mr-1 text-xs" />
                    <span className={timeOfDay === 'night' || timeOfDay === 'evening' ? 'text-white' : 'text-gray-800'}>
                      {fav.city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.header>

        <SearchBar onSearch={searchByCity} loading={loading} timeOfDay={timeOfDay} />
        
        <ErrorMessage message={error} />
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <CurrentWeather weather={weather} location={location} tempUnit={tempUnit} />
            </div>
            
            {location && (
              <div>
                <ExtendedWeather 
                  city={location.city} 
                  lat={location.lat} 
                  lon={location.lon} 
                  tempUnit={tempUnit} 
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="forecast-container" className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                <Forecast forecast={forecast} tempUnit={tempUnit} />
              </div>
              
              <div id="country-info-container" className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                <CountryInfo countryInfo={countryInfo} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
