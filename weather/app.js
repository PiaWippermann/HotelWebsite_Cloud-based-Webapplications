import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API_ONE_CALL_URL =
  "https://api.openweathermap.org/data/3.0/onecall";
const GEOCODING_API_URL = "http://api.openweathermap.org/geo/1.0/direct";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.render("weather", {
    defaultCity: "Kempten",
  });
});

app.get("/api/current-weather/:city", async (req, res) => {
  const city = req.params.city;
  if (!city) {
    return res.status(400).json({ message: "City parameter is required." });
  }
  if (!WEATHER_API_KEY) {
    console.error("WEATHER_API_KEY is not set.");
    return res.status(500).json({ message: "Weather API key not configured." });
  }

  try {
    const response = await axios.get(WEATHER_API_BASE_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: "metric",
        lang: "de",
      },
    });

    const weatherData = response.data;

    const filteredData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
    };

    res.json(filteredData);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    if (error.response) {
      console.error("Weather API response error:", error.response.data);
      res.status(error.response.status).json({
        message: "Error from weather API",
        details: error.response.data,
      });
    } else {
      res.status(500).json({ message: "Failed to fetch weather data." });
    }
  }
});

app.get("/api/forecast/:city", async (req, res) => {
  const city = req.params.city;
  if (!city) {
    return res.status(400).json({ message: "City parameter is required." });
  }
  if (!WEATHER_API_KEY) {
    console.error("WEATHER_API_KEY is not set.");
    return res.status(500).json({ message: "Weather API key not configured." });
  }

  try {
    // Rufe die 5-Tages / 3-Stunden Vorhersage ab
    const forecastResponse = await axios.get(FORECAST_API_5_DAY_3_HOUR_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: "metric",
        lang: "de",
      },
    });

    const rawForecastList = forecastResponse.data.list;
    const cityInfo = forecastResponse.data.city;

    // Verarbeitung der 3-Stunden-Daten zu täglichen Zusammenfassungen
    const dailyForecasts = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rawForecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      date.setHours(0, 0, 0, 0); // Normalisiere auf Tagesanfang

      // Nur zukünftige Tage (ab morgen) berücksichtigen
      if (date <= today) {
        return;
      }

      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          temps: [],
          descriptions: [], // Für die Mehrheit oder Midday-Beschreibung
          icons: [], // Für das Mehrheit oder Midday-Icon
          humidity: [],
          windSpeed: [],
        };
      }
      dailyForecasts[dateKey].temps.push(item.main.temp);
      dailyForecasts[dateKey].descriptions.push(item.weather[0].description);
      dailyForecasts[dateKey].icons.push(item.weather[0].icon);
      dailyForecasts[dateKey].humidity.push(item.main.humidity);
      dailyForecasts[dateKey].windSpeed.push(item.wind.speed);
    });

    // Formatiere die täglichen Daten
    const formattedForecast = [];
    const sortedDateKeys = Object.keys(dailyForecasts).sort(); // Sortiere die Tage

    // Limitiere auf die nächsten 5 Tage
    for (let i = 0; i < Math.min(sortedDateKeys.length, 5); i++) {
      const dateKey = sortedDateKeys[i];
      const dayData = dailyForecasts[dateKey];

      const tempMin = Math.min(...dayData.temps);
      const tempMax = Math.max(...dayData.temps);

      // Wähle die Beschreibung/das Icon vom ersten Eintrag des Tages (oft Mitternacht oder früher Morgen)
      // oder du könntest eine Logik implementieren, die die häufigste Beschreibung/Icon für den Tag findet
      const description = dayData.descriptions[0];
      const icon = dayData.icons[0];

      formattedForecast.push({
        date: dateKey,
        dayOfWeek: new Date(dateKey).toLocaleDateString("de-DE", {
          weekday: "long",
        }),
        tempMin: tempMin,
        tempMax: tempMax,
        description: description,
        icon: icon,
        humidity: dayData.humidity[0], // Beispiel: Feuchtigkeit des ersten Intervalls
        windSpeed: dayData.windSpeed[0], // Beispiel: Wind des ersten Intervalls
      });
    }

    res.json({
      city: cityInfo.name,
      country: cityInfo.country,
      forecast: formattedForecast,
    });
  } catch (error) {
    console.error("Error fetching forecast data:", error.message);
    if (error.response) {
      console.error("Forecast API response error:", error.response.data);
      res
        .status(error.response.status)
        .json({
          message: "Error from weather API",
          details: error.response.data,
        });
    } else {
      res.status(500).json({ message: "Failed to fetch forecast data." });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Weather service running on http://localhost:${PORT}`);
});
