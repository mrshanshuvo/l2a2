import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route Imports
import { authRoute } from "./modules/auth/auth.route.ts";
import { issueRoute } from "./modules/issues/issues.route.ts";

// Middleware Imports
import logger from "./middleware/logger.ts";
import globalErrorHandler from "./middleware/globalErrorHandler.ts";

const app: Application = express();

// 1. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Crucial for sending back cookies
  })
);

// 2. Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Custom Middlewares
app.use(logger);

// 4. Base Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Express Server is running",
  });
});

// 5. Application Routes
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

// 6. Global Error Handler
app.use(globalErrorHandler);

export default app;
