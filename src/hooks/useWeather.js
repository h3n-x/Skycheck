import { useState, useEffect } from 'react';
import { 
  getLocationByIP, 
  getWeatherByCoords, 
  getWeatherByCity, 
  getForecastByCoords,
  getCountryInfo 
} from '../utils/api';

const useWeather = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get initial location and weather data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get location by IP
        const locationData = await getLocationByIP();
        setLocation(locationData);
        
        // Get weather data
        const weatherData = await getWeatherByCoords(locationData.lat, locationData.lon);
        setWeather(weatherData);
        
        // Get forecast data
        const forecastData = await getForecastByCoords(locationData.lat, locationData.lon);
        setForecast(forecastData);
        
        // Get country information
        const countryData = await getCountryInfo(locationData.countryCode);
        setCountryInfo(countryData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
        console.error('Error in fetchInitialData:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Search for weather by city name
  const searchByCity = async (city) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get weather data for the city
      const weatherData = await getWeatherByCity(city);
      setWeather(weatherData);
      
      // Update location data
      const newLocation = {
        city: weatherData.name,
        country: weatherData.sys.country,
        countryCode: weatherData.sys.country,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      };
      setLocation(newLocation);
      
      // Get forecast data
      const forecastData = await getForecastByCoords(weatherData.coord.lat, weatherData.coord.lon);
      setForecast(forecastData);
      
      // Get country information
      const countryData = await getCountryInfo(weatherData.sys.country);
      setCountryInfo(countryData);
      
      setLoading(false);
    } catch (err) {
      setError('City not found. Please try another location.');
      setLoading(false);
      console.error('Error in searchByCity:', err);
    }
  };

  return {
    location,
    weather,
    forecast,
    countryInfo,
    loading,
    error,
    searchByCity
  };
};

export default useWeather;
