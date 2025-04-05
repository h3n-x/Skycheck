// API utilities for weather app
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const RESTCOUNTRIES_API_KEY = import.meta.env.VITE_RESTFULCOUNTRIES_API_KEY;

// Default location (Mexico City) to use when geolocation fails
const DEFAULT_LOCATION = {
  city: 'Mexico City',
  country: 'Mexico',
  countryCode: 'MX',
  lat: 19.4326,
  lon: -99.1332
};

// Get location by browser geolocation API
export const getLocationByIP = async () => {
  try {
    // Use browser's geolocation API instead of external services
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Get city and country from coordinates using OpenWeatherMap's reverse geocoding
              const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
              );
              
              if (!response.ok) {
                console.log('Reverse geocoding failed, using default location');
                resolve(DEFAULT_LOCATION);
                return;
              }
              
              const data = await response.json();
              
              if (data && data.length > 0) {
                resolve({
                  city: data[0].name,
                  country: data[0].country,
                  countryCode: data[0].country,
                  lat: position.coords.latitude,
                  lon: position.coords.longitude
                });
              } else {
                console.log('No location data found, using default location');
                resolve(DEFAULT_LOCATION);
              }
            } catch (error) {
              console.error('Error in reverse geocoding:', error);
              resolve(DEFAULT_LOCATION);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            resolve(DEFAULT_LOCATION);
          },
          { timeout: 5000 }
        );
      });
    } else {
      console.log('Geolocation not supported, using default location');
      return DEFAULT_LOCATION;
    }
  } catch (error) {
    console.error('Error getting location by IP:', error);
    console.log('Using default location due to error');
    return DEFAULT_LOCATION;
  }
};

// Get weather data by coordinates
export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.cod === 200) {
      return data;
    }
    throw new Error(data.message || 'Failed to get weather data');
  } catch (error) {
    console.error('Error getting weather by coordinates:', error);
    throw error;
  }
};

// Get weather data by city name
export const getWeatherByCity = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.cod === 200) {
      return data;
    }
    throw new Error(data.message || 'Failed to get weather data');
  } catch (error) {
    console.error('Error getting weather by city:', error);
    throw error;
  }
};

// Get 5-day forecast data with min/max temperatures (excluding current day)
export const getForecastByCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=40`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.cod === '200') {
      // Process forecast data to get one forecast per day with min/max temperatures
      const forecastsByDay = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      // Group forecasts by day
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        date.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        // Skip current day
        if (date.getTime() === today.getTime()) {
          return;
        }
        
        const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!forecastsByDay[day]) {
          forecastsByDay[day] = {
            dt: item.dt,
            date: day,
            temps: [item.main.temp], // Initialize temps array with this temperature
            weather: item.weather,
            main: { ...item.main },
            wind: { ...item.wind },
            minTemp: item.main.temp_min,
            maxTemp: item.main.temp_max
          };
        } else {
          // Update min/max temperatures
          forecastsByDay[day].minTemp = Math.min(forecastsByDay[day].minTemp, item.main.temp_min);
          forecastsByDay[day].maxTemp = Math.max(forecastsByDay[day].maxTemp, item.main.temp_max);
          
          // Add this temperature to the temps array
          forecastsByDay[day].temps.push(item.main.temp);
          
          // If this forecast is at midday (closest to 12:00), use it as the main forecast
          const currentHour = date.getHours();
          const existingDate = new Date(forecastsByDay[day].dt * 1000);
          const existingHour = existingDate.getHours();
          
          const currentDistanceFromNoon = Math.abs(12 - currentHour);
          const existingDistanceFromNoon = Math.abs(12 - existingHour);
          
          if (currentDistanceFromNoon < existingDistanceFromNoon) {
            forecastsByDay[day].dt = item.dt;
            forecastsByDay[day].weather = item.weather;
            forecastsByDay[day].main = { ...item.main };
            forecastsByDay[day].wind = { ...item.wind };
          }
        }
      });
      
      // Convert to array and sort by date
      const dailyForecasts = Object.values(forecastsByDay)
        .sort((a, b) => a.dt - b.dt)
        .slice(0, 5);  // Get 5 days (excluding today)
      
      // Add min/max to main object for compatibility
      dailyForecasts.forEach(forecast => {
        forecast.main.temp_min = forecast.minTemp;
        forecast.main.temp_max = forecast.maxTemp;
      });
      
      return dailyForecasts;
    }
    throw new Error(data.message || 'Failed to get forecast data');
  } catch (error) {
    console.error('Error getting forecast data:', error);
    throw error;
  }
};

// Backup data for the most common countries in case API fails
const COUNTRY_DATA = {
  'MX': {
    name: {
      common: 'Mexico',
      official: 'United Mexican States'
    },
    capital: ['Mexico City'],
    region: 'Americas',
    subregion: 'North America',
    languages: { spa: 'Spanish' },
    currencies: { MXN: { name: 'Mexican peso', symbol: '$' } },
    population: 128932753,
    flags: {
      svg: 'https://flagcdn.com/mx.svg',
      png: 'https://flagcdn.com/w320/mx.png'
    },
    area: 1964375,
    timezones: ['UTC-08:00', 'UTC-07:00', 'UTC-06:00'],
    borders: ['BLZ', 'GTM', 'USA'],
    maps: {
      googleMaps: 'https://goo.gl/maps/s5g7imNPMDEePxzbA'
    }
  },
  'US': {
    name: {
      common: 'United States',
      official: 'United States of America'
    },
    capital: ['Washington, D.C.'],
    region: 'Americas',
    subregion: 'North America',
    languages: { eng: 'English' },
    currencies: { USD: { name: 'United States dollar', symbol: '$' } },
    population: 329484123,
    flags: {
      svg: 'https://flagcdn.com/us.svg',
      png: 'https://flagcdn.com/w320/us.png'
    },
    area: 9372610,
    timezones: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00'],
    borders: ['CAN', 'MEX'],
    maps: {
      googleMaps: 'https://goo.gl/maps/e8M246zY4BSjkjAv6'
    }
  }
};

// Get country information using a CORS-friendly API
export const getCountryInfo = async (countryCode) => {
  try {
    // First check if we have the country data locally (as backup)
    if (COUNTRY_DATA[countryCode]) {
      console.log(`Using local backup data for ${countryCode}`);
      return COUNTRY_DATA[countryCode];
    }
    
    // Try using the REST Countries API through a CORS-friendly endpoint
    try {
      // Using the public API from restcountries.com through a CORS-friendly service
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          console.log(`Successfully fetched data for ${countryCode} from REST Countries API`);
          return data[0];
        }
      } else {
        console.log(`REST Countries API returned status: ${response.status} for ${countryCode}`);
      }
    } catch (error) {
      console.log(`Error fetching from REST Countries API: ${error.message}`);
    }
    
    // Try using an alternative API that doesn't have CORS issues
    try {
      const response = await fetch(`https://api.worldbank.org/v2/country/${countryCode}?format=json`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data[1] && data[1].length > 0) {
          const countryData = data[1][0];
          console.log(`Successfully fetched data for ${countryCode} from World Bank API`);
          
          // Convert World Bank API format to match our expected format
          return {
            name: {
              common: countryData.name,
              official: countryData.name
            },
            capital: [countryData.capitalCity],
            region: countryData.region.value,
            subregion: countryData.region.value,
            languages: { [countryCode.toLowerCase()]: countryData.name },
            currencies: { [countryCode]: { name: 'Local currency', symbol: '' } },
            population: countryData.population,
            flags: {
              svg: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
              png: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
            },
            area: 0,
            timezones: ['Unknown'],
            borders: []
          };
        }
      } else {
        console.log(`World Bank API returned status: ${response.status} for ${countryCode}`);
      }
    } catch (error) {
      console.log(`Error fetching from World Bank API: ${error.message}`);
    }
    
    // Try using the Countries Now API as another alternative
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iso: countryCode
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result && result.data) {
          const countryData = result.data;
          console.log(`Successfully fetched data for ${countryCode} from Countries Now API`);
          
          return {
            name: {
              common: countryData.name,
              official: countryData.name
            },
            capital: [countryData.capital || 'Unknown'],
            region: countryData.region || 'Unknown',
            subregion: countryData.subregion || 'Unknown',
            languages: { [countryCode.toLowerCase()]: 'Local language' },
            currencies: { [countryCode]: { name: 'Local currency', symbol: '' } },
            population: countryData.population || 0,
            flags: {
              svg: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
              png: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
            },
            area: countryData.area || 0,
            timezones: ['Unknown'],
            borders: countryData.borders || []
          };
        }
      } else {
        console.log(`Countries Now API returned status: ${response.status} for ${countryCode}`);
      }
    } catch (error) {
      console.log(`Error fetching from Countries Now API: ${error.message}`);
    }
    
    // If all APIs fail, use a fallback with basic information
    console.log(`All APIs failed for ${countryCode}, using fallback data`);
    return {
      name: {
        common: countryCode,
        official: countryCode
      },
      capital: ['Unknown'],
      region: 'Unknown',
      subregion: 'Unknown',
      languages: { unknown: 'Unknown' },
      currencies: { unknown: { name: 'Unknown', symbol: '' } },
      population: 0,
      flags: {
        svg: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
        png: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
      },
      area: 0,
      timezones: ['Unknown'],
      borders: []
    };
  } catch (error) {
    console.error('Error getting country information:', error);
    // Return a minimal fallback
    return {
      name: {
        common: countryCode,
        official: countryCode
      },
      capital: ['Unknown'],
      flags: {
        svg: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
        png: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
      }
    };
  }
};
