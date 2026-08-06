import "dotenv/config"
import express from "express"
import morgan from "morgan"
import cors from "cors";
import connectDB from "./db/index.js"
import indexRoutes from "./routes/index.routes.js"
import errorHandler, { notFound } from "./middlewares/errorHandler.js";

await connectDB()

const app = express()

app.set("trust proxy", 1)
app.use(cors({ origin: [process.env.ORIGIN || "http://localhost:5173"] }));
app.use(morgan("dev"))
app.use(express.json())
app.use("/api", indexRoutes)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

