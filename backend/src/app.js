const express=require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app=express();

const userRoutes=require("./routes/user.routes");
const fileRoutes=require("./routes/file.routes");

app.use(
  cors({
    origin:/* process.env.FRONTEND_URL||*/"http://localhost:3000",
    credentials: true, // Allow cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization","X-Internal-Key"],
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
app.use("/api/files",fileRoutes);
fileRoutes.stack
  .filter(r => r.route)
  .forEach(r => {
    console.log(Object.keys(r.route.methods)[0].toUpperCase(), '/api/files' + r.route.path);
  });
module.exports=app;