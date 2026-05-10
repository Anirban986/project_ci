const app = require("./src/app");
const pool = require("./src/db/pool");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);

    process.exit(1);
  }
}

startServer();