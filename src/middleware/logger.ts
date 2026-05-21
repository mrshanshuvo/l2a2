import fs from "fs";

import type { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } ${res.statusCode} - ${duration}ms`;

    console.log(log);
    fs.appendFileSync("logs.txt", log + "\n");
  });

  next();
};

export default logger;
