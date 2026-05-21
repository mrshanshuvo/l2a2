import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

interface ICustomError extends Error {
  statusCode?: number;
  errors?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (err: ICustomError, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || err;

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
