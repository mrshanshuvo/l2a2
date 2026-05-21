import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.ts";
import config from "../../config/index.ts";
import type { TSignupData, TLoginData, TUserResponse } from "./auth.interface.ts";

export class CustomError extends Error {
  statusCode: number;
  errors: string;

  constructor(statusCode: number, message: string, errors: string) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const registerUserIntoDB = async (payload: TSignupData): Promise<TUserResponse> => {
  const { name, email, password, role = "contributor" } = payload;

  if (role !== "contributor" && role !== "maintainer") {
    throw new CustomError(400, "Invalid role", "role must be either contributor or maintainer");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password as string, 10);

  // Check if email exists
  const existingUser = await pool.query(
    `
      SELECT id 
      FROM users 
      WHERE email = $1
    `,
    [email]
  );

  if (existingUser.rowCount && existingUser.rowCount > 0) {
    throw new CustomError(409, "Email already exists", "A user with this email already exists");
  }

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

const loginUserFromDB = async (payload: TLoginData): Promise<{ token: string; refreshToken: string; user: TUserResponse }> => {
  const { email, password } = payload;

  // Fetch user
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  if (!result.rowCount || result.rowCount === 0) {
    throw new CustomError(401, "Invalid credentials", "No user found with this email");
  }

  const user = result.rows[0];

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password as string, user.password);
  if (!isPasswordValid) {
    throw new CustomError(401, "Invalid credentials", "Incorrect password");
  }

  // Generate JWT
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.access_secret as string, {
    expiresIn: (config.access_token_expiration || "1d") as "1d",
  });
  
  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: (config.refresh_token_expiration || "7d") as "7d",
  });

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, refreshToken, user: userData };
};

const generateFreshToken = async (token: string) => {
  try {
    // 1. Token check
    if (!token) {
      throw new CustomError(401, "Unauthorized", "No token provided");
    }

    // 2. Verify token
    const decoded = jwt.verify(
      token as string,
      config.refresh_secret as string,
    ) as jwt.JwtPayload;

    // 4. Check user existence
    const userData = await pool.query(
      `
        SELECT id, name, email, role
        FROM users
        WHERE email = $1
      `,
      [decoded.email]
    );

    if (userData.rowCount === 0) {
      throw new CustomError(404, "User not found", "User not found!");
    }

    const user = userData.rows[0];

    // 5. Generate the JWT token
    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = jwt.sign(jwtPayload, config.access_secret as string, {
      expiresIn: (config.access_token_expiration || "1d") as "1d",
    });

    return { accessToken };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError(401, "Unauthorized", "Invalid or expired refresh token");
  }
};

export const authService = {
  registerUserIntoDB,
  loginUserFromDB,
  generateFreshToken,
};
