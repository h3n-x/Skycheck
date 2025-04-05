// Weather utility functions

// Map weather condition codes to appropriate icons and background colors
export const getWeatherInfo = (weatherCode) => {
  const weatherMap = {
    // Thunderstorm
    '2xx': {
      icon: 'thunderstorm',
      background: 'bg-gradient-to-br from-gray-700 to-gray-900',
      color: 'text-white'
    },
    // Drizzle
    '3xx': {
      icon: 'drizzle',
      background: 'bg-gradient-to-br from-pastel-blue to-blue-300',
      color: 'text-gray-800'
    },
    // Rain
    '5xx': {
      icon: 'rain',
      background: 'bg-gradient-to-br from-blue-400 to-blue-600',
      color: 'text-white'
    },
    // Snow
    '6xx': {
      icon: 'snow',
      background: 'bg-gradient-to-br from-pastel-blue to-blue-100',
      color: 'text-gray-800'
    },
    // Atmosphere (fog, mist, etc.)
    '7xx': {
      icon: 'mist',
      background: 'bg-gradient-to-br from-gray-300 to-gray-400',
      color: 'text-gray-800'
    },
    // Clear
    '800': {
      icon: 'clear',
      background: 'bg-gradient-to-br from-pastel-yellow to-pastel-blue',
      color: 'text-gray-800'
    },
    // Clouds
    '80x': {
      icon: 'clouds',
      background: 'bg-gradient-to-br from-pastel-blue to-blue-200',
      color: 'text-gray-800'
    }
  };

  // Convert weather code to string and find matching pattern
  const code = weatherCode.toString();
  
  if (code === '800') return weatherMap['800'];
  if (code.startsWith('2')) return weatherMap['2xx'];
  if (code.startsWith('3')) return weatherMap['3xx'];
  if (code.startsWith('5')) return weatherMap['5xx'];
  if (code.startsWith('6')) return weatherMap['6xx'];
  if (code.startsWith('7')) return weatherMap['7xx'];
  if (code.startsWith('8')) return weatherMap['80x'];
  
  // Default
  return {
    icon: 'default',
    background: 'bg-gradient-to-br from-pastel-blue to-blue-200',
    color: 'text-gray-800'
  };
};

// Format date from timestamp
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Format time from timestamp
export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get appropriate weather icon based on condition code and time
export const getWeatherIcon = (weatherCode, isDay = true) => {
  // This would be used to determine which icon to show based on the weather code
  // and whether it's day or night
  return `weather-${weatherCode}-${isDay ? 'day' : 'night'}`;
};

// Convert wind speed and get direction
export const getWindInfo = (speed, deg) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  
  return {
    speed: Math.round(speed * 10) / 10,
    direction: directions[index]
  };
};
