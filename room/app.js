import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mysql from "mysql2/promise"; // Use mysql2/promise for async DB operations

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
  waitForConnections: true, // Wait if all connections in the pool are used
  connectionLimit: 10, // Max. 10 simultaneous connections
  queueLimit: 0, // Unlimited queue for requests
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

async function checkDbConnection(retries = 30) {
  // Increase the number of retries
  while (retries > 0) {
    try {
      const connection = await pool.getConnection(); // Try to get a connection
      connection.release(); // Immediately release the connection
      console.log(
        "Room Service: Successfully connected to the MySQL database!"
      );
      return true; // Connection successful, exit loop
    } catch (err) {
      console.error(
        `Room Service: Database connection failed. Retries left: ${retries}. Error:`,
        err.message
      );
      retries--;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  console.error(
    "Room Service: Failed to connect to the database after several attempts. Exiting application."
  );
  process.exit(1);
}

app.get("/", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = "SELECT * FROM rooms";
    const [rows] = await connection.execute(query);
    console.log("Rooms fetched successfully:", rows.length, "rows.");

    res.render("room", {
      rooms: rows,
      bookingServiceUrl: process.env.BOOKING_SERVICE_URL,
      minioUrl: `http://localhost:${process.env.MINIO_PORT}/hotelrooms`,
    });
  } catch (err) {
    console.error("Error fetching the rooms:", err.message);
    return res
      .status(500)
      .send("Internal Server error when fetching the rooms.");
  } finally {
    if (connection) connection.release();
  }
});

(async () => {
  await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`Rooms service is running on http://localhost:${PORT}`);
  });
})();
