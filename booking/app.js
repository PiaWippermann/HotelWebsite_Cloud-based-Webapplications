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

// endpoint to render the booking page with the given room data given in the body
app.get("/room-booking/:room_id", async (req, res) => {
  const roomId = req.params.room_id;

  // fetch the room from the database
  let connection;

  try {
    connection = await pool.getConnection();

    const query = "SELECT * FROM rooms WHERE id = ?";
    const [rows] = await connection.execute(query, [roomId]);

    if (rows.length > 0) {
      res.render("room-booking.ejs", {
        room: rows[0],
      });
    }
  } catch (err) {
    console.error("Error fetching the rooms:", err.message);
    return res
      .status(500)
      .send("Internal Server error when fetching the rooms.");
  } finally {
    if (connection) connection.release();
  }
});

// endpoint to render the booking page with the given event data given in the body
app.get("/event-booking/:event_id", async (req, res) => {
  const eventId = req.params.event_id;

  // fetch the room from the database
  let connection;

  try {
    connection = await pool.getConnection();

    const query = "SELECT * FROM events WHERE id = ?";
    const [rows] = await connection.execute(query, [eventId]);

    if (rows.length > 0) {
      res.render("event-booking.ejs", {
        event: rows[0],
      });
    }
  } catch (err) {
    console.error("Error fetching the events:", err.message);
    return res
      .status(500)
      .send("Internal Server error when fetching the events.");
  } finally {
    if (connection) connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Booking service is running on http://localhost:${PORT}`);
});
