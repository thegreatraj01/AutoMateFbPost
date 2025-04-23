import app from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;



connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("App Error:", err);
      throw err;
    });

    app.listen(PORT, () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Database connection failed in index.js:\n${err}`);
  });
