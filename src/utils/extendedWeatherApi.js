// Extended Weather API utilities using WeatherAPI and Tomorrow.io
const WEATHERAPI_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const TOMORROW_API_KEY = import.meta.env.VITE_TOMORROW_API_KEY;

/**
 * Get additional weather data from WeatherAPI
 * @param {string} city - City name or lat,lon coordinates
 * @returns {Promise<Object>} - Weather data with astronomy and air quality
 */
export const getWeatherAPIData = async (city) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${city}&days=3&aqi=yes&alerts=yes`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and format the relevant data
    const astronomyData = {
      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset,
      moonrise: data.forecast.forecastday[0].astro.moonrise,
      moonset: data.forecast.forecastday[0].astro.moonset,
      moonPhase: data.forecast.forecastday[0].astro.moon_phase,
      moonIllumination: data.forecast.forecastday[0].astro.moon_illumination,
    };
    
    const airQualityData = data.current.air_quality ? {
      co: data.current.air_quality.co,
      no2: data.current.air_quality.no2,
      o3: data.current.air_quality.o3,
      so2: data.current.air_quality.so2,
      pm2_5: data.current.air_quality.pm2_5,
      pm10: data.current.air_quality.pm10,
      usEpaIndex: data.current.air_quality['us-epa-index'],
      gbDefraIndex: data.current.air_quality['gb-defra-index'],
    } : null;
    
    const alertsData = data.alerts && data.alerts.alert ? data.alerts.alert : [];
    
    // Additional forecast data
    const extendedForecast = data.forecast.forecastday.map(day => ({
      date: day.date,
      maxtemp_c: day.day.maxtemp_c,
      maxtemp_f: day.day.maxtemp_f,
      mintemp_c: day.day.mintemp_c,
      mintemp_f: day.day.mintemp_f,
      avgtemp_c: day.day.avgtemp_c,
      avgtemp_f: day.day.avgtemp_f,
      maxwind_mph: day.day.maxwind_mph,
      maxwind_kph: day.day.maxwind_kph,
      totalprecip_mm: day.day.totalprecip_mm,
      totalprecip_in: day.day.totalprecip_in,
      totalsnow_cm: day.day.totalsnow_cm,
      avgvis_km: day.day.avgvis_km,
      avgvis_miles: day.day.avgvis_miles,
      avghumidity: day.day.avghumidity,
      daily_will_it_rain: day.day.daily_will_it_rain,
      daily_chance_of_rain: day.day.daily_chance_of_rain,
      daily_will_it_snow: day.day.daily_will_it_snow,
      daily_chance_of_snow: day.day.daily_chance_of_snow,
      condition: day.day.condition,
      uv: day.day.uv,
      hourly: day.hour.map(hour => ({
        time: hour.time,
        temp_c: hour.temp_c,
        temp_f: hour.temp_f,
        condition: hour.condition,
        wind_mph: hour.wind_mph,
        wind_kph: hour.wind_kph,
        wind_degree: hour.wind_degree,
        wind_dir: hour.wind_dir,
        pressure_mb: hour.pressure_mb,
        pressure_in: hour.pressure_in,
        precip_mm: hour.precip_mm,
        precip_in: hour.precip_in,
        humidity: hour.humidity,
        cloud: hour.cloud,
        feelslike_c: hour.feelslike_c,
        feelslike_f: hour.feelslike_f,
        windchill_c: hour.windchill_c,
        windchill_f: hour.windchill_f,
        heatindex_c: hour.heatindex_c,
        heatindex_f: hour.heatindex_f,
        dewpoint_c: hour.dewpoint_c,
        dewpoint_f: hour.dewpoint_f,
        will_it_rain: hour.will_it_rain,
        chance_of_rain: hour.chance_of_rain,
        will_it_snow: hour.will_it_snow,
        chance_of_snow: hour.chance_of_snow,
        vis_km: hour.vis_km,
        vis_miles: hour.vis_miles,
        gust_mph: hour.gust_mph,
        gust_kph: hour.gust_kph,
        uv: hour.uv,
      })),
    }));
    
    return {
      astronomy: astronomyData,
      airQuality: airQualityData,
      alerts: alertsData,
      extendedForecast: extendedForecast,
      location: data.location,
      current: data.current,
    };
  } catch (error) {
    console.error('Error fetching WeatherAPI data:', error);
    return null;
  }
};

/**
 * Get weather data from Tomorrow.io API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Weather data with detailed forecasts
 */
export const getTomorrowIOData = async (lat, lon) => {
  try {
    // Define fields to request
    const fields = [
      "temperature", 
      "temperatureApparent", 
      "dewPoint",
      "humidity", 
      "windSpeed", 
      "windDirection", 
      "windGust",
      "pressureSurfaceLevel", 
      "precipitationIntensity",
      "precipitationProbability", 
      "precipitationType",
      "visibility", 
      "cloudCover", 
      "uvIndex",
      "uvHealthConcern", 
      "weatherCode"
    ].join(",");

    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${TOMORROW_API_KEY}&units=metric&fields=${fields}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map weather codes to more readable descriptions
    const weatherCodeMap = {
      "0": "Unknown",
      "1000": "Clear, Sunny",
      "1100": "Mostly Clear",
      "1101": "Partly Cloudy",
      "1102": "Mostly Cloudy",
      "1001": "Cloudy",
      "2000": "Fog",
      "2100": "Light Fog",
      "4000": "Drizzle",
      "4001": "Rain",
      "4200": "Light Rain",
      "4201": "Heavy Rain",
      "5000": "Snow",
      "5001": "Flurries",
      "5100": "Light Snow",
      "5101": "Heavy Snow",
      "6000": "Freezing Drizzle",
      "6001": "Freezing Rain",
      "6200": "Light Freezing Rain",
      "6201": "Heavy Freezing Rain",
      "7000": "Ice Pellets",
      "7101": "Heavy Ice Pellets",
      "7102": "Light Ice Pellets",
      "8000": "Thunderstorm"
    };
    
    // Process hourly data
    const hourlyData = data.timelines.hourly.map(item => ({
      time: item.time,
      temperature: item.values.temperature,
      temperatureApparent: item.values.temperatureApparent,
      dewPoint: item.values.dewPoint,
      humidity: item.values.humidity,
      windSpeed: item.values.windSpeed,
      windDirection: item.values.windDirection,
      windGust: item.values.windGust,
      pressureSurfaceLevel: item.values.pressureSurfaceLevel,
      precipitationIntensity: item.values.precipitationIntensity,
      precipitationProbability: item.values.precipitationProbability,
      precipitationType: item.values.precipitationType,
      visibility: item.values.visibility,
      cloudCover: item.values.cloudCover,
      uvIndex: item.values.uvIndex,
      uvHealthConcern: item.values.uvHealthConcern,
      weatherCode: item.values.weatherCode,
      weatherDescription: weatherCodeMap[item.values.weatherCode] || "Unknown"
    }));
    
    // Process daily data
    const dailyData = data.timelines.daily.map(item => ({
      time: item.time,
      temperatureMax: item.values.temperatureMax,
      temperatureMin: item.values.temperatureMin,
      temperatureApparentMax: item.values.temperatureApparentMax,
      temperatureApparentMin: item.values.temperatureApparentMin,
      windSpeedAvg: item.values.windSpeedAvg,
      windGustMax: item.values.windGustMax,
      precipitationProbabilityAvg: item.values.precipitationProbabilityAvg,
      precipitationProbabilityMax: item.values.precipitationProbabilityMax,
      precipitationIntensityAvg: item.values.precipitationIntensityAvg,
      precipitationIntensityMax: item.values.precipitationIntensityMax,
      precipitationAccumulationAvg: item.values.precipitationAccumulationAvg,
      precipitationAccumulationMax: item.values.precipitationAccumulationMax,
      humidityAvg: item.values.humidityAvg,
      humidityMax: item.values.humidityMax,
      humidityMin: item.values.humidityMin,
      visibilityAvg: item.values.visibilityAvg,
      visibilityMin: item.values.visibilityMin,
      pressureSurfaceLevelAvg: item.values.pressureSurfaceLevelAvg,
      uvIndexAvg: item.values.uvIndexAvg,
      uvIndexMax: item.values.uvIndexMax,
      weatherCodeMax: item.values.weatherCodeMax,
      weatherCodeMin: item.values.weatherCodeMin,
      weatherDescription: weatherCodeMap[item.values.weatherCodeMax] || "Unknown"
    }));
    
    return {
      hourly: hourlyData,
      daily: dailyData,
      location: {
        lat: data.location.lat,
        lon: data.location.lon,
        name: data.location.name
      }
    };
  } catch (error) {
    console.error('Error fetching Tomorrow.io data:', error);
    return null;
  }
};

/**
 * Get combined weather data from both APIs
 * @param {string} city - City name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Combined weather data
 */
export const getExtendedWeatherData = async (city, lat, lon) => {
  try {
    // Fetch data from both APIs in parallel
    const [weatherAPIData, tomorrowIOData] = await Promise.all([
      getWeatherAPIData(city),
      getTomorrowIOData(lat, lon)
    ]);
    
    return {
      weatherAPI: weatherAPIData,
      tomorrowIO: tomorrowIOData
    };
  } catch (error) {
    console.error('Error fetching extended weather data:', error);
    return {
      weatherAPI: null,
      tomorrowIO: null
    };
  }
};

// UV Index interpretation
export const uvIndexInterpretation = {
  0: { level: "Low", description: "No protection needed", color: "#299501" },
  1: { level: "Low", description: "No protection needed", color: "#299501" },
  2: { level: "Low", description: "No protection needed", color: "#299501" },
  3: { level: "Moderate", description: "Some protection required", color: "#F7E401" },
  4: { level: "Moderate", description: "Some protection required", color: "#F7E401" },
  5: { level: "Moderate", description: "Some protection required", color: "#F7E401" },
  6: { level: "High", description: "Protection essential", color: "#F95901" },
  7: { level: "High", description: "Protection essential", color: "#F95901" },
  8: { level: "Very High", description: "Extra protection needed", color: "#D90011" },
  9: { level: "Very High", description: "Extra protection needed", color: "#D90011" },
  10: { level: "Very High", description: "Extra protection needed", color: "#D90011" },
  11: { level: "Extreme", description: "Maximum protection essential", color: "#6C49CB" },
  12: { level: "Extreme", description: "Maximum protection essential", color: "#6C49CB" }
};

// Air Quality interpretation (US EPA Index)
export const airQualityInterpretation = {
  1: { level: "Good", description: "Air quality is satisfactory", color: "#00E400" },
  2: { level: "Moderate", description: "Acceptable air quality", color: "#FFFF00" },
  3: { level: "Unhealthy for Sensitive Groups", description: "Sensitive groups may experience health effects", color: "#FF7E00" },
  4: { level: "Unhealthy", description: "Everyone may experience health effects", color: "#FF0000" },
  5: { level: "Very Unhealthy", description: "Health alert: everyone may experience more serious health effects", color: "#99004C" },
  6: { level: "Hazardous", description: "Health warning of emergency conditions", color: "#7E0023" }
};

// Export weather code descriptions
export const weatherCodes = {
  "0": "Unknown",
  "1000": "Clear, Sunny",
  "1100": "Mostly Clear",
  "1101": "Partly Cloudy",
  "1102": "Mostly Cloudy",
  "1001": "Cloudy",
  "2000": "Fog",
  "2100": "Light Fog",
  "4000": "Drizzle",
  "4001": "Rain",
  "4200": "Light Rain",
  "4201": "Heavy Rain",
  "5000": "Snow",
  "5001": "Flurries",
  "5100": "Light Snow",
  "5101": "Heavy Snow",
  "6000": "Freezing Drizzle",
  "6001": "Freezing Rain",
  "6200": "Light Freezing Rain",
  "6201": "Heavy Freezing Rain",
  "7000": "Ice Pellets",
  "7101": "Heavy Ice Pellets",
  "7102": "Light Ice Pellets",
  "8000": "Thunderstorm"
};
