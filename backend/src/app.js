const express=require('express');
const app=express();

//using /health to check if the server is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "express" });
});


module.exports=app;