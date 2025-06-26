import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// home route impressions
app.get("/", async (req, res) => {
  res.render("layout.ejs", { title: "Start" });
});

app.get("/main", async (req, res) => {
  try {
    // console.log(`Lade Impressionen von ${impressionServiceUrl}/html`);
    // const html = await fetch(`${impressionServiceUrl}/html`).then((r) =>
    //   r.text()
    // );
    // console.log("Impressionen erfolgreich geladen.");
    // res.render("main.ejs", { title: "Start", impressions: html });
    res.render("main.ejs", { title: "Start" });
  } catch (err) {
    res.status(500).send("Fehler beim Laden der Microservice-Seite.");
  }
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
