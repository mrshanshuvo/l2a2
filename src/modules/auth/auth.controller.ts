import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import config from "../../config/index.js";

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const { refreshToken, ...responseData } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: config.node_env === "production",
      httpOnly: true,
      sameSite: "strict",
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      return next({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized access",
        errors: "No refresh token provided in cookies",
      });
    }

    const result = await authService.generateFreshToken(token);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  signup,
  login,
  refreshToken,
};
