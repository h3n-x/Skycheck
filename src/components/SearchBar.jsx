import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaHistory, FaMapMarkerAlt } from 'react-icons/fa';

// Popular cities for suggestions
const POPULAR_CITIES = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 
  'Berlin', 'Madrid', 'Rome', 'Moscow', 'Dubai'
];

const SearchBar = ({ onSearch, loading, timeOfDay = 'day' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Determine theme colors based on time of day
  const getThemeColors = () => {
    switch(timeOfDay) {
      case 'dawn':
        return {
          inputBg: 'bg-white',
          inputText: 'text-gray-800',
          inputBorder: 'border-blue-200',
          suggestionBg: 'bg-white',
          suggestionText: 'text-gray-800',
          suggestionHover: 'hover:bg-blue-100',
          iconColor: 'text-blue-400'
        };
      case 'day':
        return {
          inputBg: 'bg-white',
          inputText: 'text-gray-800',
          inputBorder: 'border-pastel-blue',
          suggestionBg: 'bg-white',
          suggestionText: 'text-gray-800',
          suggestionHover: 'hover:bg-pastel-blue hover:bg-opacity-20',
          iconColor: 'text-pastel-blue'
        };
      case 'evening':
        return {
          inputBg: 'bg-white',
          inputText: 'text-gray-800',
          inputBorder: 'border-orange-300',
          suggestionBg: 'bg-white',
          suggestionText: 'text-gray-800',
          suggestionHover: 'hover:bg-orange-100',
          iconColor: 'text-orange-400'
        };
      case 'night':
        return {
          inputBg: 'bg-gray-800',
          inputText: 'text-white',
          inputBorder: 'border-blue-500',
          suggestionBg: 'bg-gray-800',
          suggestionText: 'text-white',
          suggestionHover: 'hover:bg-gray-700',
          iconColor: 'text-blue-300'
        };
      default:
        return {
          inputBg: 'bg-white',
          inputText: 'text-gray-800',
          inputBorder: 'border-pastel-blue',
          suggestionBg: 'bg-white',
          suggestionText: 'text-gray-800',
          suggestionHover: 'hover:bg-pastel-blue hover:bg-opacity-20',
          iconColor: 'text-pastel-blue'
        };
    }
  };

  const themeColors = getThemeColors();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (city) => {
    const updatedSearches = [
      city,
      ...recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase())
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      saveRecentSearch(query.trim());
      setQuery('');
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (city) => {
    onSearch(city);
    saveRecentSearch(city);
    setQuery('');
    setShowSuggestions(false);
  };

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim().length > 1) {
      // Filter popular cities based on query
      const filteredCities = POPULAR_CITIES.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filteredCities);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      className="w-full max-w-md mx-auto mb-8 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className={`w-full py-3 px-4 pr-12 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${themeColors.inputBg} ${themeColors.inputText} focus:ring-blue-400 border ${themeColors.inputBorder}`}
          disabled={loading}
        />
        <button 
          type="submit" 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeColors.iconColor} transition-colors duration-300`}
          disabled={loading}
        >
          <FaSearch className="text-xl" />
        </button>
      </form>
      
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div 
            ref={suggestionsRef}
            className={`absolute mt-2 w-full rounded-lg shadow-lg overflow-hidden z-10 ${themeColors.suggestionBg} border ${themeColors.inputBorder}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {suggestions.length > 0 && (
              <div>
                <div className={`px-4 py-2 font-medium text-sm ${themeColors.suggestionText} bg-opacity-10`}>
                  Suggestions
                </div>
                <ul>
                  {suggestions.map((city, index) => (
                    <li key={`suggestion-${index}`}>
                      <button
                        className={`w-full text-left px-4 py-2 ${themeColors.suggestionText} ${themeColors.suggestionHover} flex items-center transition-colors duration-200`}
                        onClick={() => handleSuggestionClick(city)}
                      >
                        <FaMapMarkerAlt className={`mr-2 ${themeColors.iconColor}`} />
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {recentSearches.length > 0 && (
              <div>
                <div className={`px-4 py-2 font-medium text-sm ${themeColors.suggestionText} bg-opacity-10`}>
                  Recent Searches
                </div>
                <ul>
                  {recentSearches.map((city, index) => (
                    <li key={`recent-${index}`}>
                      <button
                        className={`w-full text-left px-4 py-2 ${themeColors.suggestionText} ${themeColors.suggestionHover} flex items-center transition-colors duration-200`}
                        onClick={() => handleSuggestionClick(city)}
                      >
                        <FaHistory className={`mr-2 ${themeColors.iconColor}`} />
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;
