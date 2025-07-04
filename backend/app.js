import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 80;

const impressionServiceUrl = process.env.IMPRESSION_SERVICE_URL;
const roomServiceUrl = process.env.ROOM_SERVICE_PUBLIC_BASE_URL;
const eventServiceUrl = process.env.EVENT_SERVICE_PUBLIC_BASE_URL;
const weatherServiceUrl = process.env.WEATHER_SERVICE_PUBLIC_BASE_URL;

console.log(`Impression Service URL: ${impressionServiceUrl}`);
console.log(`Room Service URL: ${roomServiceUrl}`);
console.log(`Event Service URL: ${eventServiceUrl}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// home route impressions
app.get("/", async (req, res) => {
  res.render("layout.ejs", {
    roomServiceUrl: roomServiceUrl,
    eventServiceUrl: eventServiceUrl,
    weatherServiceUrl: weatherServiceUrl,
  });
});

app.get("/main", async (req, res) => {
  try {
    const impressions = await fetch(`${impressionServiceUrl}/impressions`).then(
      (r) => r.text()
    );
    console.log("Impressionen erfolgreich geladen.");

    const media = await fetch(`${impressionServiceUrl}/media`).then((r) =>
      r.text()
    );

    // render the main page with impressions and media
    res.render("main.ejs", {
      title: "Start",
      impressions: impressions,
      media: media,
      minioUrl: `http://localhost:${process.env.MINIO_PORT}/hotelimages`,
    });
  } catch (err) {
    res.status(500).send("Error loading impressions or media: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend is running http://localhost:${PORT}`);
});
