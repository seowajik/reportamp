const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const indexRouter = require("./routes/index");
const reportsRouter = require("./routes/reports");

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", "./views"); // Pastikan folder views ada

// Routes
app.use("/", indexRouter);
app.use("/reports", reportsRouter);

// Custom port
const PORT = 2003;

// Database sync dan server startup
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on:`);
      console.log(`- Local: http://localhost:${PORT}`);
      console.log(`- Network: http://${getIPAddress()}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Helper function untuk mendapatkan IP address
function getIPAddress() {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}
