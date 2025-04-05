import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGlobe, FaUsers, FaLanguage, FaMoneyBillWave, 
  FaMapMarkerAlt, FaGlobeAmericas, FaInfoCircle, FaTimes
} from 'react-icons/fa';

const CountryInfo = ({ countryInfo }) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);
  
  // Efecto para manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar si está expandido y el clic fue fuera del contenedor
      if (expanded && containerRef.current && !containerRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    // Agregar listener global
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar listener al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);
  
  if (!countryInfo) return null;

  // Extract country data
  const {
    name,
    flags,
    capital,
    population,
    languages,
    currencies,
    region,
    subregion,
    area,
    timezones,
    borders
  } = countryInfo;

  // Format languages - handle cases where languages might be missing or in different formats
  let languagesList = 'N/A';
  if (languages) {
    if (typeof languages === 'object' && Object.values(languages).length > 0) {
      languagesList = Object.values(languages).join(', ');
    } else if (typeof languages === 'string') {
      languagesList = languages;
    }
  }
  
  // Format currencies - handle cases where currencies might be missing or in different formats
  let currenciesList = 'N/A';
  let currencySymbols = '';
  if (currencies) {
    const currencyValues = Object.values(currencies);
    if (currencyValues.length > 0) {
      const formattedCurrencies = currencyValues.map(currency => {
        const name = currency.name || 'Unknown';
        const symbol = currency.symbol || '';
        if (symbol) currencySymbols = symbol;
        return symbol ? `${name} (${symbol})` : name;
      });
      currenciesList = formattedCurrencies.join(', ');
    }
  }

  // Format population with commas
  const formattedPopulation = population ? population.toLocaleString() : 'N/A';
  
  // Format area with commas
  const formattedArea = area ? area.toLocaleString() : 'N/A';
  
  // Format borders
  const bordersList = borders && borders.length > 0 ? borders.join(', ') : 'None';

  // Format capital
  const capitalName = capital && capital.length > 0 ? capital[0] : 'N/A';

  // Format region and subregion
  const regionName = region || 'N/A';
  const subregionName = subregion || 'N/A';
  const regionDisplay = subregionName !== 'N/A' && subregionName !== regionName 
    ? `${regionName} & ${subregionName}`
    : regionName;

  // Handle toggle expansion with stopPropagation to prevent event bubbling
  const handleToggleExpand = (e) => {
    // Detener completamente la propagación del evento
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpanded(!expanded);
  };

  return (
    <>
      <motion.div 
        ref={containerRef}
        className="card bg-white w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="p-3 bg-pastel-purple text-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Country Information</h3>
          <button 
            onClick={handleToggleExpand}
            className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
            aria-label="View detailed country information"
            data-component="country-info-toggle"
            id="country-info-toggle-button"
          >
            <FaInfoCircle />
          </button>
        </div>
        
        <div className="p-3">
          <div className="flex items-center mb-3">
            {flags && flags.svg ? (
              <img 
                src={flags.svg} 
                alt={`Flag of ${name?.common || 'country'}`}
                className="w-16 h-10 object-cover rounded shadow-sm mr-3"
              />
            ) : (
              <div className="w-16 h-10 bg-gray-200 rounded shadow-sm mr-3 flex items-center justify-center">
                <FaGlobe className="text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{name?.common || name?.official || 'Unknown Country'}</h2>
              <p className="text-sm text-gray-500">{name?.official !== name?.common ? name?.official : ''}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start">
              <div className="text-pastel-purple mr-2 mt-1">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-gray-500">Capital</p>
                <p>{capitalName}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-pastel-purple mr-2 mt-1">
                <FaUsers />
              </div>
              <div>
                <p className="text-gray-500">Population</p>
                <p>{formattedPopulation}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-pastel-purple mr-2 mt-1">
                <FaLanguage />
              </div>
              <div>
                <p className="text-gray-500">Languages</p>
                <p>{languagesList}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-pastel-purple mr-2 mt-1">
                <FaMoneyBillWave />
              </div>
              <div>
                <p className="text-gray-500">Currency</p>
                <p>{currenciesList}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-pastel-purple mr-2 mt-1">
                <FaGlobeAmericas />
              </div>
              <div>
                <p className="text-gray-500">Region</p>
                <p>{regionDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de información detallada que aparece en el centro */}
      <AnimatePresence>
        {expanded && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 bg-pastel-purple text-gray-800 flex justify-between items-center rounded-t-lg">
                <h3 className="text-xl font-semibold flex items-center">
                  {flags && flags.svg && (
                    <img 
                      src={flags.svg} 
                      alt={`Flag of ${name?.common || 'country'}`}
                      className="w-8 h-6 object-cover rounded shadow-sm mr-3"
                    />
                  )}
                  {name?.common || name?.official || 'Country Information'}
                </h3>
                <button 
                  onClick={handleToggleExpand}
                  className="p-1 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all"
                  aria-label="Close detailed information"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-3 text-pastel-purple">General Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Official Name</p>
                      <p className="font-medium">{name?.official || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Capital</p>
                      <p className="font-medium">{capitalName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Region</p>
                      <p className="font-medium">{regionDisplay}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Area</p>
                      <p className="font-medium">{formattedArea} km²</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Population</p>
                      <p className="font-medium">{formattedPopulation}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3 text-pastel-purple">Additional Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Languages</p>
                      <p className="font-medium">{languagesList}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Currencies</p>
                      <p className="font-medium">{currenciesList}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Timezones</p>
                      <p className="font-medium break-words">{timezones && timezones.length > 0 ? timezones.join(', ') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Bordering Countries</p>
                      <p className="font-medium break-words">{bordersList}</p>
                    </div>
                  </div>
                </div>
                
                {countryInfo.maps && countryInfo.maps.googleMaps && (
                  <div className="md:col-span-2 mt-2">
                    <a 
                      href={countryInfo.maps.googleMaps} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-pastel-purple text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CountryInfo;
