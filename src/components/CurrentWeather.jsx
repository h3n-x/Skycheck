import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTemperatureHigh, FaWind, FaWater, FaExchangeAlt, FaClock, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { WiStrongWind } from 'react-icons/wi';
import { getWeatherInfo, formatTime, getWindInfo } from '../utils/weatherUtils';

const CurrentWeather = ({ weather, location, tempUnit }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef(null);
  
  if (!weather) return null;

  const { main, weather: weatherConditions, wind, sys } = weather;
  const condition = weatherConditions[0];
  const weatherInfo = getWeatherInfo(condition.id);
  const windInfo = getWindInfo(wind.speed, wind.deg);
  
  // Convert temperature between Celsius and Fahrenheit
  const convertTemp = (temp) => {
    if (tempUnit === 'C') return Math.round(temp);
    return Math.round((temp * 9/5) + 32);
  };
  
  // Get local time of the location
  const getLocalTime = () => {
    // Calculate local time using UTC time and timezone offset from the API
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (weather.timezone * 1000));
    
    return localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Handle modal open/close
  const handleToggleModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalOpen(!modalOpen);
  };
  
  // Effect to handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <>
      <motion.section
        className="card bg-white shadow-lg rounded-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        aria-label="Información del clima actual"
      >
        <div className={`p-4 ${weatherInfo.background} ${weatherInfo.color}`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <motion.div
                className="flex items-center mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold high-contrast-text">{location?.city}</h2>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center md:justify-start text-lg opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span>{location?.country}</span>
                <div className="flex items-center ml-3 text-sm" aria-label="Hora local">
                  <FaClock className="mr-1" aria-hidden="true" />
                  <span>{getLocalTime()}</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-5xl font-bold high-contrast-text" aria-label={`Temperatura actual: ${convertTemp(main.temp)} grados ${tempUnit === 'C' ? 'Celsius' : 'Fahrenheit'}`}>
                  {convertTemp(main.temp)}°{tempUnit}
                </p>
                <p className="text-lg capitalize">{condition.description}</p>
              </motion.div>
            </div>

            <div className="weather-icon-container animate-float">
              <motion.img 
                src={`https://openweathermap.org/img/wn/${condition.icon}@4x.png`}
                alt={`Icono del clima: ${condition.description}`}
                className="w-28 h-28"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 glass-effect rounded-lg p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300" aria-label={`Sensación térmica: ${convertTemp(main.feels_like)} grados ${tempUnit === 'C' ? 'Celsius' : 'Fahrenheit'}`}>
              <FaTemperatureHigh className="text-xl mb-1" aria-hidden="true" />
              <p className="text-sm opacity-80">Feels Like</p>
              <p className="font-semibold">{convertTemp(main.feels_like)}°{tempUnit}</p>
            </div>
            
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300" aria-label={`Viento: ${windInfo.speed} metros por segundo, dirección ${windInfo.direction}`}>
              <div className="relative">
                <FaWind className="text-xl mb-1" aria-hidden="true" />
                <WiStrongWind 
                  className="text-lg absolute -right-2 -top-1" 
                  style={{ 
                    transform: `rotate(${wind.deg}deg)`,
                    transformOrigin: 'center'
                  }} 
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm opacity-80">Wind</p>
              <p className="font-semibold">{windInfo.speed} m/s {windInfo.direction}</p>
            </div>
            
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300" aria-label={`Humedad: ${main.humidity} por ciento`}>
              <FaWater className="text-xl mb-1" aria-hidden="true" />
              <p className="text-sm opacity-80">Humidity</p>
              <p className="font-semibold">{main.humidity}%</p>
            </div>
          </motion.div>

          {/* Botón para mostrar más información */}
          <motion.div 
            className="mt-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button 
              onClick={handleToggleModal}
              className="flex items-center justify-center bg-white bg-opacity-30 hover:bg-opacity-50 transition-all px-4 py-2 rounded-lg"
              aria-label="Ver más detalles del clima"
              aria-expanded={modalOpen}
            >
              <FaInfoCircle className="mr-2" aria-hidden="true" />
              <span>More Weather Details</span>
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Modal con información detallada */}
      <AnimatePresence>
        {modalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="weather-details-title"
          >
            <motion.div 
              ref={containerRef}
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 bg-pastel-blue text-gray-800 flex justify-between items-center rounded-t-lg">
                <h3 className="text-xl font-semibold" id="weather-details-title">
                  Weather Details for {location?.city}
                </h3>
                <button 
                  onClick={handleToggleModal}
                  className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
                  aria-label="Cerrar detalles del clima"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-pastel-blue bg-opacity-10 p-3 rounded-lg">
                    <div className="flex items-center text-blue-400 mb-2">
                      <FaTemperatureHigh className="mr-2" aria-hidden="true" />
                      <span className="font-medium">Temperature</span>
                    </div>
                    <div className="text-sm">
                      <p>Current: {convertTemp(main.temp)}°{tempUnit}</p>
                      <p>Feels Like: {convertTemp(main.feels_like)}°{tempUnit}</p>
                      <p>Min: {convertTemp(main.temp_min)}°{tempUnit}</p>
                      <p>Max: {convertTemp(main.temp_max)}°{tempUnit}</p>
                    </div>
                  </div>
                  
                  <div className="bg-pastel-blue bg-opacity-10 p-3 rounded-lg">
                    <div className="flex items-center text-blue-400 mb-2">
                      <FaWind className="mr-2" aria-hidden="true" />
                      <span className="font-medium">Wind & Pressure</span>
                    </div>
                    <div className="text-sm">
                      <p>Speed: {windInfo.speed} m/s</p>
                      <p>Direction: {windInfo.direction} ({wind.deg}°)</p>
                      <p>Pressure: {main.pressure} hPa</p>
                      {main.sea_level && <p>Sea Level: {main.sea_level} hPa</p>}
                      {main.grnd_level && <p>Ground Level: {main.grnd_level} hPa</p>}
                    </div>
                  </div>
                  
                  <div className="bg-pastel-blue bg-opacity-10 p-3 rounded-lg">
                    <div className="flex items-center text-blue-400 mb-2">
                      <FaWater className="mr-2" aria-hidden="true" />
                      <span className="font-medium">Humidity & Clouds</span>
                    </div>
                    <div className="text-sm">
                      <p>Humidity: {main.humidity}%</p>
                      <p>Clouds: {weather.clouds?.all || 0}%</p>
                      {weather.visibility && (
                        <p>Visibility: {Math.round(weather.visibility / 1000)} km</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center bg-pastel-blue bg-opacity-10 p-3 rounded-lg">
                  <div className="flex justify-center items-center text-blue-400 mb-2">
                    <FaExchangeAlt className="mr-2" aria-hidden="true" />
                    <span className="font-medium">Change Units</span>
                  </div>
                  <button 
                    onClick={() => {
                      setTempUnit(tempUnit === 'C' ? 'F' : 'C');
                      localStorage.setItem('weatherAppTempUnit', tempUnit === 'C' ? 'F' : 'C');
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-300"
                    aria-label={`Cambiar a grados ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                  >
                    Switch to {tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

};

export default CurrentWeather;
