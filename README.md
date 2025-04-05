# SkyCheck

Una aplicación moderna de clima con una interfaz visualmente atractiva, desarrollada con React, Vite y Tailwind CSS.

![SkyCheck Screenshot](https://github.com/user-attachments/assets/228ece5d-cf34-4916-9b46-fab20166430f)

## Características

- **Geolocalización automática**: Detecta automáticamente la ubicación del usuario al abrir la aplicación
- **Búsqueda de ciudades**: Permite buscar el clima de cualquier ciudad del mundo
- **Información detallada del clima**: Muestra temperatura actual, sensación térmica, humedad, viento y más
- **Información extendida del clima**: Datos de astronomía, calidad del aire, índice UV y pronóstico por hora
- **Pronóstico de 5 días**: Visualiza el pronóstico del tiempo para los próximos 5 días
- **Información del país**: Muestra datos relevantes del país como bandera, capital, población, idiomas y moneda
- **Temas dinámicos según hora del día**: Cambia automáticamente los colores según sea mañana, día, tarde o noche
- **Diseño responsive**: Adaptable a dispositivos móviles y de escritorio
- **Animaciones suaves**: Transiciones y animaciones para una experiencia de usuario mejorada
- **Colores pasteles**: Interfaz con colores suaves y agradables a la vista

## APIs utilizadas

- **OpenWeatherMap**: Para obtener datos del clima actual y pronóstico
- **WeatherAPI**: Para datos extendidos como astronomía, calidad del aire y alertas
- **Tomorrow.io**: Para pronósticos hiperlocales y datos meteorológicos avanzados
- **REST Countries**: Para obtener información detallada de los países
- **IP-API**: Para la geolocalización automática por IP

## Tecnologías

- React
- Vite
- Tailwind CSS
- Framer Motion (para animaciones)
- React Icons

## Instalación

1. Clona este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del proyecto con tus claves API:
   ```
   VITE_OPENWEATHER_API_KEY=tu_clave_api
   VITE_WEATHER_API_KEY=tu_clave_api
   VITE_TOMORROW_API_KEY=tu_clave_api
   VITE_RESTFULCOUNTRIES_API_KEY=tu_clave_api
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del proyecto

```
/src
  /components       # Componentes React
    CurrentWeather.jsx  # Clima actual
    Forecast.jsx        # Pronóstico de 5 días
    CountryInfo.jsx     # Información del país
    ExtendedWeather.jsx # Información extendida del clima
    SearchBar.jsx       # Barra de búsqueda
    LoadingSpinner.jsx  # Indicador de carga
    ErrorMessage.jsx    # Mensajes de error
  /hooks            # Custom hooks
    useWeather.js       # Hook para gestionar datos del clima
  /utils            # Funciones de utilidad
    api.js              # Funciones para llamadas a API
    weatherUtils.js     # Utilidades para procesar datos del clima
    extendedWeatherApi.js # Utilidades para APIs adicionales
  App.jsx           # Componente principal
  main.jsx          # Punto de entrada
```

## Características de la información extendida

- **Astronomía**: Datos de salida y puesta del sol y la luna, fase lunar e iluminación
- **Calidad del aire**: Índice de calidad del aire y concentración de contaminantes
- **Índice UV**: Nivel actual de radiación UV con recomendaciones
- **Pronóstico por hora**: Previsión detallada hora a hora
- **Alertas meteorológicas**: Avisos de condiciones climáticas severas

## Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

## Licencia

MIT
