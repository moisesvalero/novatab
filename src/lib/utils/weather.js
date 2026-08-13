export const WEATHER_CODES = {
  0: { desc: 'Cielo despejado', icon: 'Sun' },
  1: { desc: 'Principalmente despejado', icon: 'SunCloud' },
  2: { desc: 'Parcialmente nublado', icon: 'CloudSun' },
  3: { desc: 'Nublado', icon: 'Cloud' },
  45: { desc: 'Niebla', icon: 'CloudFog' },
  48: { desc: 'Niebla escarchada', icon: 'CloudFog' },
  51: { desc: 'Llovizna ligera', icon: 'CloudDrizzle' },
  53: { desc: 'Llovizna moderada', icon: 'CloudDrizzle' },
  55: { desc: 'Llovizna densa', icon: 'CloudDrizzle' },
  61: { desc: 'Lluvia ligera', icon: 'CloudRain' },
  63: { desc: 'Lluvia moderada', icon: 'CloudRain' },
  65: { desc: 'Lluvia fuerte', icon: 'CloudRain' },
  71: { desc: 'Nieve ligera', icon: 'Snowflake' },
  73: { desc: 'Nieve moderada', icon: 'Snowflake' },
  75: { desc: 'Nieve fuerte', icon: 'Snowflake' },
  95: { desc: 'Tormenta eléctrica', icon: 'CloudLightning' }
};

export async function fetchWeatherData(lat = 40.4168, lon = -3.7038) { // Default Madrid, Spain
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    const current = data.current_weather;
    const weatherInfo = WEATHER_CODES[current.weathercode] || { desc: 'Despejado', icon: 'Sun' };
    
    return {
      temp: Math.round(current.temperature),
      windspeed: current.windspeed,
      code: current.weathercode,
      desc: weatherInfo.desc,
      icon: weatherInfo.icon,
      tempMax: data.daily?.temperature_2m_max?.[0] ? Math.round(data.daily.temperature_2m_max[0]) : null,
      tempMin: data.daily?.temperature_2m_min?.[0] ? Math.round(data.daily.temperature_2m_min[0]) : null
    };
  } catch (e) {
    console.error('Weather fetch error', e);
    return null;
  }
}
