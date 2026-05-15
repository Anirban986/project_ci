const express=require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app=express();

const userRoutes=require("./routes/user.routes");

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Frontend URL
    credentials: true, // Allow cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//using /health to check if the server is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "express" });
});

app.use("/api/auth", userRoutes);

module.exports=app;