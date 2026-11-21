import React, { useState } from "react";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFrown } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";

/* ---------- helpers ---------- */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// City-local date and time, using the timezone offset (seconds) the API returns.
function formatLocal(timezone = 0) {
  const shifted = new Date(Date.now() + timezone * 1000);
  const date = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" }).format(shifted);
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(shifted);
  return `${date}, ${time} local time`;
}

function formatClock(unixSeconds, timezone = 0) {
  if (!unixSeconds) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date((unixSeconds + timezone) * 1000));
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const degToCompass = (deg) => COMPASS[Math.round(deg / 22.5) % 16];

// Picks the sky palette from the condition group and the day/night suffix of the icon code.
function skyFor(main, icon) {
  const night = icon?.endsWith("n");
  switch (main) {
    case "Clear": return night ? "clear-night" : "clear-day";
    case "Clouds": return night ? "clouds-night" : "clouds";
    case "Drizzle":
    case "Rain": return "rain";
    case "Thunderstorm": return "storm";
    case "Snow": return "snow";
    case undefined: return "dawn";
    default: return "mist";
  }
}

function pressureLabel(hpa) {
  if (hpa < 1005) return "Low pressure";
  if (hpa > 1020) return "High pressure";
  return "Normal pressure";
}

/* ---------- instruments (SVG) ---------- */

// Hero visual for the start screen: a glowing planet with slow rotating rings.
function SkyOrb() {
  return (
    <svg className="sky-orb" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="orb-core" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fff3dc" />
          <stop offset="45%" stopColor="#ffb27a" />
          <stop offset="100%" stopColor="#ff6f91" />
        </radialGradient>
        <radialGradient id="orb-halo" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#ff9a7a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff9a7a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="198" fill="url(#orb-halo)" />
      <circle cx="200" cy="200" r="112" fill="url(#orb-core)" />
      <g className="orb-ring orb-ring-a"><circle cx="200" cy="200" r="150" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" /></g>
      <g className="orb-ring orb-ring-b">
        <circle cx="200" cy="200" r="174" fill="none" stroke="#7ff3ff" strokeOpacity="0.7" strokeWidth="1.2" />
        <circle cx="374" cy="200" r="6" fill="#7ff3ff" />
      </g>
      <g className="orb-ring orb-ring-c">
        <circle cx="200" cy="200" r="194" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2 14" />
        <circle cx="200" cy="6" r="4" fill="#ffffff" />
      </g>
    </svg>
  );
}

// Main temperature gauge: a 270 degree arc covering -10 to 50 °C.
function TempRing({ temp }) {
  const R = 120;
  const C = 2 * Math.PI * R;
  const arc = C * 0.75;
  const fraction = clamp((temp + 10) / 60, 0, 1);
  const end = 135 + 270 * fraction;
  return (
    <svg className="temp-ring" viewBox="0 0 300 300" aria-hidden="true" focusable="false" key={temp}>
      <defs>
        <linearGradient id="ring-fill" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7ff3ff" />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffc58a" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r={R} fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${arc} ${C}`} transform="rotate(135 150 150)" />
      <circle className="ring-progress" cx="150" cy="150" r={R} fill="none" stroke="url(#ring-fill)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${arc * fraction} ${C}`} style={{ "--full": `${arc * fraction}` }} transform="rotate(135 150 150)" />
      <circle cx="150" cy="150" r="96" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="1 7" />
      <g className="ring-knob" style={{ "--end": `${end}deg` }}>
        <circle cx={150 + R} cy="150" r="11" fill="#ffffff" fillOpacity="0.28" />
        <circle cx={150 + R} cy="150" r="5.5" fill="#ffffff" />
      </g>
      <text x="62" y="272" textAnchor="middle" className="ring-scale">−10°</text>
      <text x="238" y="272" textAnchor="middle" className="ring-scale">50°</text>
    </svg>
  );
}

function WindCompass({ deg }) {
  const hasDir = typeof deg === "number";
  return (
    <svg className="compass" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="52" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="60" y1="8" x2="60" y2={i % 6 === 0 ? 16 : 12} stroke="#ffffff" strokeOpacity={i % 6 === 0 ? 0.8 : 0.35} strokeWidth="1.2" transform={`rotate(${i * 15} 60 60)`} />
      ))}
      <text x="60" y="29" textAnchor="middle" className="compass-label">N</text>
      <text x="96" y="64" textAnchor="middle" className="compass-label">E</text>
      <text x="60" y="100" textAnchor="middle" className="compass-label">S</text>
      <text x="24" y="64" textAnchor="middle" className="compass-label">W</text>
      {hasDir && (
        <g className="compass-needle" style={{ "--deg": `${(deg + 180) % 360}deg` }}>
          <path d="M60 34 L66 64 L60 58 L54 64 Z" fill="#7ff3ff" />
        </g>
      )}
      <circle cx="60" cy="60" r="3" fill="#ffffff" />
    </svg>
  );
}

function PressureArc({ hpa }) {
  const length = Math.PI * 56;
  const fraction = clamp(((hpa ?? 1013) - 960) / 100, 0, 1);
  return (
    <svg className="pressure-arc" viewBox="0 0 140 84" aria-hidden="true" focusable="false">
      <path d="M14 70 A56 56 0 0 1 126 70" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="10" strokeLinecap="round" />
      <path className="arc-progress" d="M14 70 A56 56 0 0 1 126 70" fill="none" stroke="#7ff3ff" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${length * fraction} ${length}`} style={{ "--full": `${length * fraction}` }} />
      <g className="arc-knob" style={{ "--end": `${180 * fraction}deg` }}>
        <circle cx="14" cy="70" r="4.5" fill="#ffffff" />
      </g>
      <text x="14" y="83" textAnchor="middle" className="ring-scale">960</text>
      <text x="126" y="83" textAnchor="middle" className="ring-scale">1060</text>
    </svg>
  );
}

/* ---------- app ---------- */

export default function GfGWeatherApp() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState({ loading: false, data: null, error: "" });

  const search = async (event) => {
    event?.preventDefault();
    const city = input.trim();
    if (!city || weather.loading) return;
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setWeather({ loading: false, data: null, error: "API key is missing. Check your local .env file." });
      return;
    }
    setWeather({ loading: true, data: null, error: "" });
    try {
      const response = await axios.get(API_URL, { params: { q: city, units: "metric", appid: apiKey } });
      setWeather({ loading: false, data: response.data, error: "" });
      setInput("");
    } catch (err) {
      const message = err?.response?.status === 404
        ? "We couldn't find that city. Check the spelling and try again."
        : err?.response?.status === 401
        ? "The weather API key was rejected. Check your OpenWeather API key."
        : "Unable to fetch weather right now. Check your connection and try again.";
      setWeather({ loading: false, data: null, error: message });
    }
  };

  const data = weather.data;
  const current = data?.main;
  const condition = data?.weather?.[0];
  const iconUrl = condition?.icon ? `https://openweathermap.org/img/wn/${condition.icon}@2x.png` : "";
  const sky = data && condition ? skyFor(condition.main, condition.icon) : "dawn";
  const feelsLike = current ? Math.round(current.feels_like ?? current.temp) : null;
  const humidity = current?.humidity ?? 0;
  const windSpeed = data?.wind?.speed;
  const windDeg = data?.wind?.deg;
  const timezone = data?.timezone ?? 0;

  return (
    <main className="weather-app" data-sky={sky}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="SkyCast home" onClick={(e) => { e.preventDefault(); setWeather({ loading: false, data: null, error: "" }); setInput(""); }}>
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <circle cx="16" cy="16" r="6" fill="currentColor" />
            <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 4" strokeLinecap="round" />
          </svg>
          <strong>SkyCast</strong>
        </a>
        <span className="topbar-status"><span className="status-dot" /> Live data</span>
      </header>

      {!data && !weather.loading && !weather.error && (
        <section className="welcome-layout">
          <div className="welcome-copy">
            <h1>Check the sky anywhere.</h1>
            <p className="hero-description">Search a city to see its live temperature, wind, humidity and pressure.</p>
            <form className="search-form" onSubmit={search}>
              <label className="sr-only" htmlFor="city-search">Search city</label>
              <svg className="search-symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <input id="city-search" type="text" placeholder="Search city (e.g., Ahmedabad, London...)" value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" />
              <button type="submit" disabled={!input.trim()}>Check weather</button>
            </form>
            <div className="popular-cities">
              <span>Popular cities</span>
              {["Ahmedabad", "Mumbai", "Jaipur", "Delhi", "London"].map((city) => <button key={city} type="button" onClick={() => setInput(city)}>{city}</button>)}
            </div>
          </div>
          <SkyOrb />
        </section>
      )}

      {weather.loading && <section className="message-panel" aria-live="polite"><Oval color="#7ff3ff" secondaryColor="rgba(255,255,255,0.25)" height={58} width={58} /><h2>Fetching live weather...</h2><p>Getting the latest conditions for {input || "your city"}.</p></section>}

      {weather.error && !weather.loading && (
        <section className="message-panel error-panel" role="alert">
          <FontAwesomeIcon icon={faFrown} /><h2>We couldn't load that weather</h2><p>{weather.error}</p>
          <form className="search-form compact-search" onSubmit={search}>
            <label className="sr-only" htmlFor="city-search-error">Search city</label>
            <input id="city-search-error" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Try another city..." />
            <button type="submit" disabled={!input.trim()}>Try again</button>
          </form>
        </section>
      )}

      {data && current && condition && (
        <section className="dashboard">
          <form className="search-form result-search" onSubmit={search}>
            <label className="sr-only" htmlFor="city-search-result">Search another city</label>
            <input id="city-search-result" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search another city..." />
            <button type="submit" disabled={!input.trim()}>Search</button>
          </form>

          <div className="dashboard-heading">
            <div>
              <h1>{data.name}<span>{data.sys?.country}</span></h1>
              <p>{formatLocal(timezone)}</p>
            </div>
            <span className="live-pill"><span className="status-dot" /> Live observation</span>
          </div>

          <div className="dashboard-grid">
            <article className="ring-panel">
              <div className="ring-wrap">
                <TempRing temp={current.temp} />
                <div className="ring-center">
                  {iconUrl && <img src={iconUrl} alt="" />}
                  <div className="temperature-value">{Math.round(current.temp)}<span>°C</span></div>
                  <div className="condition-label">{condition.description}</div>
                  <div className="feels-like">Feels like {feelsLike}°C</div>
                </div>
              </div>
            </article>

            <article className="instrument wind-panel">
              <h2>Wind</h2>
              <WindCompass deg={windDeg} />
              <div className="reading">{windSpeed ?? "—"} <small>m/s</small></div>
              <p>{typeof windDeg === "number" ? `From the ${degToCompass(windDeg)}` : "Direction not reported"}</p>
            </article>

            <article className="instrument humidity-panel">
              <h2>Humidity</h2>
              <div className="tube" role="img" aria-label={`Humidity ${humidity} percent`}>
                <div className="tube-fill" style={{ "--level": `${clamp(humidity, 0, 100)}%` }} />
              </div>
              <div className="reading">{current.humidity ?? "—"} <small>%</small></div>
              <p>Moisture in the air</p>
            </article>

            <article className="instrument pressure-panel">
              <h2>Pressure</h2>
              <PressureArc hpa={current.pressure} />
              <div className="reading">{current.pressure ?? "—"} <small>hPa</small></div>
              <p>{current.pressure ? pressureLabel(current.pressure) : "Atmospheric pressure"}</p>
            </article>

            <article className="details-strip">
              <dl>
                <div><dt>Low / High</dt><dd>{Math.round(current.temp_min ?? current.temp)}° / {Math.round(current.temp_max ?? current.temp)}°</dd></div>
                <div><dt>Visibility</dt><dd>{data.visibility != null ? `${(data.visibility / 1000).toFixed(1)} km` : "—"}</dd></div>
                <div><dt>Cloud cover</dt><dd>{data.clouds?.all != null ? `${data.clouds.all}%` : "—"}</dd></div>
                <div><dt>Sunrise</dt><dd>{formatClock(data.sys?.sunrise, timezone)}</dd></div>
                <div><dt>Sunset</dt><dd>{formatClock(data.sys?.sunset, timezone)}</dd></div>
              </dl>
            </article>
          </div>
        </section>
      )}

      <footer className="footer"><span><strong>SkyCast</strong> · Precision Weather</span><span>Powered by OpenWeather</span></footer>
    </main>
  );
}
