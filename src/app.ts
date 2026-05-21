import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/auth/auth.route.ts";
import logger from "./middleware/logger.ts";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(logger);

// Server Routing
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Express Server is running",
  });
});

// app.use("/api/users", userRoute);
// app.use("/api/profiles", profileRoute);
app.use("/api/auth", authRoute);

// Global Error Handling Middleware
import globalErrorHandler from "./middleware/globalErrorHandler.ts";
app.use(globalErrorHandler);

export default app;
