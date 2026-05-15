import { useState, useEffect, useRef, useCallback } from "react";
import { T1, T2, T3, T4, accent, F2, BORDER, glassCard } from "../utils/glass";
import { Check, X, MapPin } from "lucide-react";

interface Weather {
  city: string;
  temp: number;
  feelsLike: number;
  code: number;
  high: number;
  low: number;
}

function emoji(code: number): string {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return ["🌤️", "⛅", "☁️"][code - 1];
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌤️";
}

const CITY_KEY = "weather-city";

async function geocodeCity(name: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=zh&format=json`,
    { signal: AbortSignal.timeout(5000) }
  );
  const data = await res.json();
  const r = data.results?.[0];
  if (!r) throw new Error("未找到城市");
  return { lat: r.latitude, lon: r.longitude, city: r.name };
}

async function fetchWeatherByCoords(lat: number, lon: number, city: string) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    { signal: AbortSignal.timeout(5000) }
  );
  const w = await res.json();
  return {
    city,
    temp: Math.round(w.current.temperature_2m),
    feelsLike: Math.round(w.current.apparent_temperature),
    code: w.current.weather_code,
    high: Math.round(w.daily.temperature_2m_max[0]),
    low: Math.round(w.daily.temperature_2m_min[0]),
  };
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cityDraft, setCityDraft] = useState("");
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doFetch = useCallback(async () => {
    setLocating(true);
    setError(false);
    try {
      const customCity = localStorage.getItem(CITY_KEY) || "";

      if (customCity) {
        const geo = await geocodeCity(customCity);
        const w = await fetchWeatherByCoords(geo.lat, geo.lon, geo.city);
        if (!weather || weather.city !== geo.city) setWeather(w);
        else setWeather(w);
      } else {
        // Try browser geolocation, fallback to Shanghai
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
        ).catch(() => null);

        if (pos) {
          const { latitude: lat, longitude: lon } = pos.coords;
          const geo = await geocodeCity(`${lat.toFixed(2)},${lon.toFixed(2)}`).catch(() => null);
          const city = geo?.city || "当前位置";
          const w = await fetchWeatherByCoords(lat, lon, city);
          setWeather(w);
        } else {
          // Default: Shanghai
          const w = await fetchWeatherByCoords(31.2, 121.4, "上海");
          setWeather(w);
        }
      }
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const t = setInterval(doFetch, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [doFetch]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const openEditor = () => {
    setCityDraft(localStorage.getItem(CITY_KEY) || "");
    setEditing(true);
  };

  const saveCity = async () => {
    const city = cityDraft.trim();
    setEditing(false);
    if (!city) {
      localStorage.removeItem(CITY_KEY);
    } else {
      localStorage.setItem(CITY_KEY, city);
    }
    doFetch();
  };

  const clearCity = () => {
    localStorage.removeItem(CITY_KEY);
    setEditing(false);
    doFetch();
  };

  if (error && !weather) return null;

  return (
    <div className="relative">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 select-none"
        style={{
          borderRadius: 99,
          background: "var(--lg-fill-1)",
          fontSize: 13,
          color: T2,
          animation: "fadeIn 0.6s ease 0.5s both",
        }}
        title={`体感 ${weather?.feelsLike ?? "—"}°C · 最高 ${weather?.high ?? "—"}°C · 最低 ${weather?.low ?? "—"}°C`}
      >
        {locating && !weather ? (
          <span style={{ color: T3, fontSize: 12 }}>定位中…</span>
        ) : weather ? (
          <>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji(weather.code)}</span>
            <span style={{ fontWeight: 500, color: T1 }}>{weather.temp}°C</span>
            <span style={{ color: T3 }}>·</span>
            <button
              onClick={openEditor}
              className="hover:underline inline-flex items-center gap-1"
              style={{ color: T3, fontSize: 12, cursor: "pointer" }}
              aria-label="更改城市"
            >
              <MapPin size={10} />
              {weather.city}
            </button>
          </>
        ) : null}
      </div>

      {editing && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 299 }} onClick={() => setEditing(false)} />
          <div
            className="absolute flex items-center gap-2 px-3 py-2"
            style={{
              ...glassCard,
              zIndex: 300,
              top: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              minWidth: 240,
              animation: "fadeIn 150ms ease",
            }}
          >
            <MapPin size={14} style={{ color: T3, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={cityDraft}
              onChange={e => setCityDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveCity()}
              placeholder="输入城市名，如 北京"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 13, color: T1, minWidth: 0 }}
            />
            {cityDraft.trim() && (
              <button
                onClick={saveCity}
                className="flex items-center justify-center"
                style={{ color: accent }}
                aria-label="确认"
              >
                <Check size={14} />
              </button>
            )}
            <button
              onClick={clearCity}
              className="flex items-center justify-center"
              style={{ color: T3 }}
              aria-label="清除"
              title="使用自动定位"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
