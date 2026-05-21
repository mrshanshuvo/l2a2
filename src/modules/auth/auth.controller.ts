import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.ts";
import sendResponse from "../../utils/sendResponse.ts";
import { StatusCodes } from "http-status-codes";

const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Missing required fields",
        errors: "name, email, and password are required",
      });
    }

    const newUser = await authService.registerUserIntoDB({ name, email, password, role });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Missing credentials",
        errors: "email and password are required",
      });
    }

    const result = await authService.loginUserFromDB({ email, password });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  signup,
  login,
};