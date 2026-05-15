import { useState, useEffect } from "react";
import { T1, T2, T3, T4 } from "../utils/glass";

interface Weather {
  city: string;
  temp: number;
  feelsLike: number;
  code: number;
  high: number;
  low: number;
}

const WMO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  56: "🌧️", 57: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  66: "🌧️", 67: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌦️", 81: "🌦️", 82: "🌦️",
  85: "❄️", 86: "❄️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

function emoji(code: number): string {
  // Range matching: 1-3, 51-55, etc.
  if (code >= 1 && code <= 3) return ["🌤️", "⛅", "☁️"][code - 1];
  if (code >= 51 && code <= 55) return "🌦️";
  if (code >= 56 && code <= 57) return "🌧️";
  if (code >= 61 && code <= 65) return "🌧️";
  if (code >= 66 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95 && code <= 99) return "⛈️";
  return WMO_EMOJI[code] || "🌤️";
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        // Step 1: Get location — try browser geolocation first, then IP fallback
        let lat: number = 31.2, lon: number = 121.4, city = "上海";

        const geoPos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
        ).catch(() => null);

        if (geoPos) {
          lat = geoPos.coords.latitude;
          lon = geoPos.coords.longitude;
          // Reverse geocode via Open-Meteo
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=zh&format=json`,
            { signal: AbortSignal.timeout(4000) }
          );
          const geoData = await geoRes.json();
          city = geoData.results?.[0]?.name || "当前位置";
        }

        // Step 2: Get weather from Open-Meteo
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
          { signal: AbortSignal.timeout(5000) }
        );
        const w = await wRes.json();

        if (!cancelled) {
          setWeather({
            city,
            temp: Math.round(w.current.temperature_2m),
            feelsLike: Math.round(w.current.apparent_temperature),
            code: w.current.weather_code,
            high: Math.round(w.daily.temperature_2m_max[0]),
            low: Math.round(w.daily.temperature_2m_min[0]),
          });
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    fetchWeather();
    const t = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10min
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (error || !weather) return null;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 select-none"
      style={{
        borderRadius: 99,
        background: "var(--lg-fill-1)",
        fontSize: 13,
        color: T2,
        animation: "fadeIn 0.6s ease 0.5s both",
      }}
      title={`体感 ${weather.feelsLike}°C · 最高 ${weather.high}°C · 最低 ${weather.low}°C`}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji(weather.code)}</span>
      <span style={{ fontWeight: 500, color: T1 }}>{weather.temp}°C</span>
      <span style={{ color: T3 }}>·</span>
      <span style={{ color: T3, fontSize: 12 }}>{weather.city}</span>
      <span style={{ color: T4, fontSize: 11, display: "none" }} className="sm:inline">
        H{weather.high}° L{weather.low}°
      </span>
    </div>
  );
}
