/**
 * Mock Weather Service for MHRS v7.0 SaaS
 * Provides personality-driven tips based on weather forecast
 */

const weatherConditions = [
    { condition: 'Sunny', tip: 'Hava güneşli! Randevunuza gelirken güneş kreminizi sürmeyi unutmayın. ☀️', icon: '☀️' },
    { condition: 'Rainy', tip: 'Dışarıda yağmur var. Şemsiyenizi yanınıza almayı ve dikkatli sürmeyi unutmayın! ☔', icon: '☔' },
    { condition: 'Cloudy', tip: 'Gökyüzü biraz kapalı ama enerjimiz yerinde. İyi muayeneler! ☁️', icon: '☁️' },
    { condition: 'Windy', tip: 'Rüzgarlı bir gün! Sıkı giyinmeyi unutmayın, sağlığınız her şeyden önemli. 🌬️', icon: '🌬️' },
    { condition: 'Snowy', tip: 'Dışarıda kar var! Yollar kaygan olabilir, lütfen randevunuza biraz erken ve dikkatli çıkın. ❄️', icon: '❄️' }
];

export const getMockWeather = (city, date) => {
    // Generate a pseudo-random index based on city name and date string
    const seed = (city?.length || 0) + (new Date(date).getDate() || 0);
    const index = seed % weatherConditions.length;
    return weatherConditions[index];
};
