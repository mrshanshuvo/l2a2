import express, {
  type Application,
  type Request,
  type Response,
} from "express";
// import { userRoute } from "./modules/user/user.route.ts";
// import { profileRoute } from "./modules/profile/profile.route.ts";
// import { authRoute } from "./modules/auth/auth.route.ts";
// import logger from "./middleware/logger.ts";
// import CookieParser from "cookie-parser";
// import cors from "cors";
// import globalErrorHandler from "./middleware/globalErrorHandler.ts";

const app: Application = express();

// Middlewares
// app.use(CookieParser());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
// app.use(logger);
// app.use(
//   cors({
//     origin: "http:localhost:3000",
//   }),
// );

// Server Routing
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Express Server is running",
  });
});

// app.use("/api/users", userRoute);
// app.use("/api/profiles", profileRoute);
// app.use("/api/auth", authRoute);

// Global Error Handling Middleware
// app.use(globalErrorHandler);

export default app;
