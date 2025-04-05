import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/weatherUtils';
import { FaChevronLeft, FaChevronRight, FaTemperatureHigh, FaTemperatureLow, FaTimes, FaWind, FaWater } from 'react-icons/fa';

const Forecast = ({ forecast, tempUnit = 'C' }) => {
  const [activeDay, setActiveDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef(null);
  
  if (!forecast || forecast.length === 0) return null;

  // Filtrar solo los próximos 5 días (excluyendo el día actual)
  const filteredForecast = forecast.slice(0, 5);

  // Convert temperature between Celsius and Fahrenheit
  const convertTemp = (temp) => {
    if (tempUnit === 'C') return Math.round(temp);
    return Math.round((temp * 9/5) + 32);
  };

  // Handle day click with stopPropagation to prevent event bubbling
  const handleDayClick = (e, index) => {
    e.stopPropagation(); // Prevenir que el evento se propague a otros componentes
    setActiveDay(index);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalOpen(false);
  };

  // Handle scroll buttons with stopPropagation
  const handleScrollLeft = (e) => {
    e.stopPropagation();
    const container = document.getElementById('forecast-scroll');
    container.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleScrollRight = (e) => {
    e.stopPropagation();
    const container = document.getElementById('forecast-scroll');
    container.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Efecto para manejar clics fuera del modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar si el modal está abierto y el clic fue fuera del contenedor
      if (modalOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };

    // Agregar listener global
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar listener al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <>
      <motion.div 
        className="card bg-white w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-3 bg-pastel-blue text-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">5-Day Forecast</h3>
          <div className="flex space-x-2 md:hidden">
            <button 
              className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
              onClick={handleScrollLeft}
              data-component="forecast-scroll-left"
            >
              <FaChevronLeft />
            </button>
            <button 
              className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
              onClick={handleScrollRight}
              data-component="forecast-scroll-right"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        <div 
          id="forecast-scroll"
          className="p-3 flex overflow-x-auto scrollbar-hide space-x-2 pb-2 justify-center items-center min-h-[220px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredForecast.map((day, index) => (
            <motion.div 
              key={day.dt}
              className="flex-shrink-0 w-[120px] h-[180px] bg-pastel-blue bg-opacity-20 rounded-lg p-2 text-center cursor-pointer transition-all duration-300 hover:bg-opacity-30 flex flex-col justify-center"
              onClick={(e) => handleDayClick(e, index)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ y: -3 }}
              data-component="forecast-day-item"
            >
              <p className="font-medium text-sm">{formatDate(day.dt)}</p>
              <div className="relative">
                <img 
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt={day.weather[0].description}
                  className="w-14 h-14 mx-auto"
                />
              </div>
              <p className="text-xs capitalize">{day.weather[0].description}</p>
              <p className="font-semibold">{convertTemp(day.main.temp)}°{tempUnit}</p>
              
              {/* Mostrar min/max siempre */}
              <div className="mt-1 text-xs flex justify-between items-center px-1">
                <div className="flex items-center text-blue-500">
                  <FaTemperatureLow className="mr-1" size={10} />
                  <span>{convertTemp(day.main.temp_min)}°</span>
                </div>
                <div className="flex items-center text-red-500">
                  <FaTemperatureHigh className="mr-1" size={10} />
                  <span>{convertTemp(day.main.temp_max)}°</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hide scrollbar for Chrome, Safari and Opera */
            #forecast-scroll::-webkit-scrollbar {
              display: none;
            }
            
            /* Hide scrollbar for IE, Edge and Firefox */
            #forecast-scroll {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          `
        }} />
      </motion.div>

      {/* Modal detallado del pronóstico del día seleccionado */}
      <AnimatePresence>
        {modalOpen && activeDay !== null && filteredForecast[activeDay] && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <motion.div 
              ref={containerRef}
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 bg-pastel-blue text-gray-800 flex justify-between items-center rounded-t-lg">
                <h3 className="text-xl font-semibold">
                  {formatDate(filteredForecast[activeDay].dt)}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
                  aria-label="Close weather details"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <img 
                      src={`https://openweathermap.org/img/wn/${filteredForecast[activeDay].weather[0].icon}@2x.png`}
                      alt={filteredForecast[activeDay].weather[0].description}
                      className="w-24 h-24 mx-auto"
                    />
                    <p className="text-lg capitalize font-medium">{filteredForecast[activeDay].weather[0].description}</p>
                    <p className="text-3xl font-bold mt-2">{convertTemp(filteredForecast[activeDay].main.temp)}°{tempUnit}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5 mt-6">
                  <div className="bg-pastel-blue bg-opacity-10 p-4 rounded-lg flex flex-col items-center">
                    <div className="flex items-center text-blue-500 mb-2">
                      <FaTemperatureLow className="mr-2" size={16} />
                      <span className="font-medium">Min</span>
                    </div>
                    <p className="text-xl font-bold">{convertTemp(filteredForecast[activeDay].main.temp_min)}°{tempUnit}</p>
                  </div>
                  
                  <div className="bg-pastel-blue bg-opacity-10 p-4 rounded-lg flex flex-col items-center">
                    <div className="flex items-center text-red-500 mb-2">
                      <FaTemperatureHigh className="mr-2" size={16} />
                      <span className="font-medium">Max</span>
                    </div>
                    <p className="text-xl font-bold">{convertTemp(filteredForecast[activeDay].main.temp_max)}°{tempUnit}</p>
                  </div>
                  
                  <div className="bg-pastel-blue bg-opacity-10 p-4 rounded-lg flex flex-col items-center">
                    <div className="flex items-center text-blue-400 mb-2">
                      <FaWater className="mr-2" size={16} />
                      <span className="font-medium">Humidity</span>
                    </div>
                    <p className="text-xl font-bold">{filteredForecast[activeDay].main.humidity}%</p>
                  </div>
                  
                  <div className="bg-pastel-blue bg-opacity-10 p-4 rounded-lg flex flex-col items-center">
                    <div className="flex items-center text-gray-500 mb-2">
                      <FaWind className="mr-2" size={16} />
                      <span className="font-medium">Wind</span>
                    </div>
                    <p className="text-xl font-bold">{Math.round(filteredForecast[activeDay].wind.speed * 10) / 10} m/s</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center bg-pastel-blue bg-opacity-10 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">
                    Pressure: {filteredForecast[activeDay].main.pressure} hPa
                    {filteredForecast[activeDay].main.sea_level ? ` | Sea Level: ${filteredForecast[activeDay].main.sea_level} hPa` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Forecast;
