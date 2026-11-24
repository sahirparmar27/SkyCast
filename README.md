# 🌦️ SkyCast — Weather App

A futuristic, responsive weather application built with React.js and the OpenWeather API. Search for a city to view live conditions on an interactive dashboard with animated gauges and a sky that changes colour with the weather.



---

## ✨ Features

- 🌍 **City-Based Search:** Search for weather information by city name, with quick buttons for popular cities.
- 🌡️ **Temperature Ring:** View the current temperature in Celsius inside an animated gauge, with the feels-like temperature below it.
- 🌬️ **Wind Compass:** See the wind speed and the direction the wind is coming from.
- 💧 **Humidity Tube:** Check the humidity percentage as a tube that fills to the current level.
- 📊 **Pressure Gauge:** View atmospheric pressure in hPa, labelled as low, normal or high.
- ☁️ **Weather Conditions:** View the current weather description and icon.
- 🌅 **Extra Details:** See the low and high temperature, visibility, cloud cover, sunrise and sunset.
- 🕒 **City-Local Time:** Date, time, sunrise and sunset are shown in the searched city's own time zone.
- 🎨 **Weather-Aware Sky:** The background changes for clear day, clear night, clouds, rain, thunderstorm, snow and mist.
- ⚡ **Loading and Error Handling:** Display feedback while fetching weather data and when a search fails.
- 📱 **Responsive UI:** Works on desktop, tablet and mobile screens.
- ♿ **Accessible:** Visible keyboard focus, labelled form fields, and animations that switch off for users with reduced motion enabled.
- 🚀 **Live Deployment:** Hosted on Vercel with GitHub integration.

## 🖼️ Interface Highlights

| Screen | What you see |
|---|---|
| **Start screen** | A glowing planet with slowly turning rings, a glass search bar and popular-city buttons |
| **Weather dashboard** | Temperature ring, wind compass, humidity tube, pressure gauge and a details strip |
| **Loading screen** | A spinner with a message for the city being searched |
| **Error screen** | A clear message (city not found, invalid API key, no connection) and a box to try again |

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend application |
| JavaScript | Application logic |
| HTML5 | Page structure |
| CSS3 | Styling, sky themes, animations and responsive design |
| Inline SVG | Temperature ring, wind compass and pressure gauge |
| Axios | HTTP requests |
| React Loader Spinner | Loading indicator |
| Font Awesome | Error icon |
| Google Fonts | Unbounded and Manrope typefaces |
| OpenWeather API | Current weather data |
| Git and GitHub | Version control and source code hosting |
| Vercel | Deployment and hosting |

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- Node.js and npm installed
- An OpenWeather API key

### 1. Clone the repository

```bash
git clone https://github.com/sahirparmar27/weather-app.git
cd weather-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API key

Create a `.env` file in the project's root directory and add:

```env
REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your own API key from [OpenWeather](https://home.openweathermap.org/api_keys).

### 4. Start the development server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production (optional)

```bash
npm run build
```

## 🌐 API Integration

SkyCast uses the OpenWeather Current Weather API to retrieve weather information for searched cities.

The application requests weather data in metric units, displaying temperature in Celsius and atmospheric pressure in hPa.

### Data used from the API response

| Shown in the app | API field |
|---|---|
| Temperature, feels like | `main.temp`, `main.feels_like` |
| Low and high temperature | `main.temp_min`, `main.temp_max` |
| Humidity, pressure | `main.humidity`, `main.pressure` |
| Wind speed and direction | `wind.speed`, `wind.deg` |
| Visibility | `visibility` |
| Cloud cover | `clouds.all` |
| Sunrise, sunset | `sys.sunrise`, `sys.sunset` |
| City-local time | `timezone` |
| Condition, icon and sky theme | `weather[0].main`, `weather[0].description`, `weather[0].icon` |

### Good to know

- OpenWeather limits visibility to 10 km, so "10.0 km" means 10 km or more.
- Low and high come from nearby weather stations right now. They are not the full day's forecast.
- The wind needle points to where the wind is blowing toward, and the text says where it is coming from.

## 🎨 Design Notes

- **Sky themes:** The `data-sky` attribute on the main element selects one of nine palettes (dawn, clear day, clear night, clouds, cloudy night, rain, storm, snow, mist). They are defined at the top of `App.css`, and the colours cross-fade when the weather changes.
- **Gauges:** The temperature ring, wind compass and pressure gauge are inline SVG in `App.js` (`TempRing`, `WindCompass`, `PressureArc`), so no chart library is needed.
- **Fonts:** Unbounded for headings and numbers, Manrope for text. They load from Google Fonts and need an internet connection; system fonts are used without it.
- **Motion:** The temperature ring sweeps once when the result appears. Animations are turned off when the device is set to reduced motion.

## 🔐 API Key Configuration

- Keep your local `.env` file excluded from Git using `.gitignore`.
- Never commit your actual API key to the repository.
- React environment variables prefixed with `REACT_APP_` are included in the client-side JavaScript bundle and are not secret.
- Restrict your API key where supported and monitor your OpenWeather account usage.

## 📂 Project Structure

```text
weather-app/
├── public/
├── src/
│   ├── App.js        # Search, API request, gauges and all screens
│   ├── App.css       # Sky themes, gauges, layout and responsive rules
│   ├── index.js
│   └── ...
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above is representative. Your actual project may contain additional files.*

## 🎯 Project Objective

The goal of this project is to build a user-friendly weather application that retrieves current weather information from an external API and presents it through a modern, futuristic and responsive interface.

## 📚 Key Learnings

- Integrating REST APIs into a React application
- Handling asynchronous HTTP requests using Axios
- Managing loading states and API errors
- Configuring environment variables
- Designing responsive user interfaces
- Building data gauges with inline SVG
- Using CSS variables and animations for themes and motion
- Working with time zone offsets to show a city's local time
- Making interfaces accessible with focus styles and reduced-motion support
- Using Git and GitHub for version control
- Deploying a frontend application with Vercel

## 👨‍💻 Author

**Sahir Parmar**

B.Tech Artificial Intelligence Student

- **GitHub:** [sahirparmar27](https://github.com/sahirparmar27)
- **Project Repository:** [SkyCast](https://github.com/sahirparmar27/weather-app)
- **Live Application:** [SkyCast Weather App](https://weather-r70z5iymb-sahirparmar27.vercel.app/)

---

If you find this project useful, consider giving the repository a ⭐.
