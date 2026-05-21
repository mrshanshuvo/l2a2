import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/index.ts";
import { pool } from "../db/index.ts";
import type { ROLES } from "../types/index.ts";
import { StatusCodes } from "http-status-codes";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        email: string;
        role: "contributor" | "maintainer";
      };
    }
  }
}

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      // 1. Token check
      if (!authHeader) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access",
          errors: "No token provided",
        });
        return;
      }

      // 2. Extract Bearer token
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      // 3. Verify token
      const decoded = jwt.verify(
        token as string,
        config.access_secret as string,
      ) as JwtPayload;

      // 4. Check user existence
      const userData = await pool.query(
        `
        SELECT id, email, role
        FROM users
        WHERE email = $1
        `,
        [decoded.email] // Assumes email is stored in the JWT payload! We need to make sure our login endpoint puts it there.
      );

      if (userData.rowCount === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "User not found",
          errors: "The user belonging to this token no longer exists",
        });
        return;
      }

      const user = userData.rows[0];

      // 5. Attach user to request
      req.user = user;

      // 6. Role check
      if (roles.length && !roles.includes(user.role)) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden",
          errors: "You do not have the required permissions to perform this action",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or expired token",
        errors: error instanceof Error ? error.message : "Authentication failed",
      });
      return;
    }
  };
};

export default auth;
