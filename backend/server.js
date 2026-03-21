const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { sequelize } = require("./src/lib/db");
const routes = require("./src/routes/routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: [
      "https://ratinggraph.onrender.com",
      "http://localhost:5173",
      "https://backend-ratinggraph.onrender.com",
    ],
  }),
);
app.use(express.json());

//Rotas
app.use("/", routes);

// Health check
app.get("/health", async (req, res) => {
  try {
    await cloudinary.api.ping();
    res.status(200).json({
      status: "healthy",
      cloudinary: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      cloudinary: "disconnected",
      error: error.message,
    });
  }
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao sincronizar DB:", error);
  });
