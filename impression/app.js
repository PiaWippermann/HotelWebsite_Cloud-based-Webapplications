import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "minio";

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Endpoint to render the impression images
// This page will display the images from the MinIO hotelimpression bucket
app.get("/impressions", (req, res) => {
  const files = [];

  const stream = minioClient.listObjects("hotelimpression", "", true);

  stream.on("data", (obj) => {
    const url = `http://localhost:9002/hotelimpression/${obj.name}`;
    files.push(url);
  });

  stream.on("end", () => {
    res.render("impression", {
      files,
    });
  });

  stream.on("error", (err) => {
    console.error("Fehler beim Abrufen von MinIO:", err);
    res.status(500).send("Fehler beim Laden");
  });
});

// Endpoint to render the media page
// This page will display the videos from the MinIO hotelvideos bucket
app.get("/media", (req, res) => {
  res.render("media", {
    minioUrl: `http://localhost:${process.env.MINIO_PORT}/hotelvideos`,
  });
});

app.listen(PORT, () => {
  console.log(`Impressions is running http://localhost:${PORT}`);
});
