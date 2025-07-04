import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mysql from "mysql2/promise"; // Verwende mysql2/promise für asynchrone DB-Operationen

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true, // Warte, wenn alle Verbindungen im Pool genutzt werden
  connectionLimit: 10, // Max. 10 gleichzeitige Verbindungen
  queueLimit: 0, // Unbegrenzte Warteschlange für Anfragen
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Checks if the database connection is available before starting the server
async function checkDbConnection(retries = 30) {
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log("Event Service: Successfully connected to database!");
      return true;
    } catch (err) {
      console.error(
        `Event Service: Database connection failed. Retries left: ${retries}. Error:`,
        err.message
      );
      retries--;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  console.error(
    "Event Service: Connection to database failed after multiple attempts. Exiting application."
  );
  process.exit(1);
}

app.get("/", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = "SELECT * FROM events";
    const [rows] = await connection.execute(query);
    console.log("Events fetched successfully:", rows.length, "rows.");

    res.render("event.ejs", {
      events: rows,
      bookingServiceUrl: process.env.BOOKING_SERVICE_URL,
      minioUrl: `http://localhost:${process.env.MINIO_PORT}/hotelevents`,
    });
  } catch (err) {
    console.error("Error fetching the events:", err.message);
    return res
      .status(500)
      .send("Internal Server error when fetching the events.");
  } finally {
    if (connection) connection.release();
  }
});

(async () => {
  await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`Events service is running on http://localhost:${PORT}`);
  });
})();
