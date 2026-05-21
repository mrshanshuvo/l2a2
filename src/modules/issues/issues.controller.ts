import type { Request, Response, NextFunction } from "express";
import { issueService } from "./issues.service.ts";
import sendResponse from "../../utils/sendResponse.ts";
import { StatusCodes } from "http-status-codes";

const createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, type } = req.body;
    
    // We expect the auth middleware to set req.user
    const reporter_id = req.user.id;

    if (!title || !description || !type) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Missing required fields",
        errors: "title, description, and type are required",
      });
    }

    if (type !== "bug" && type !== "feature_request") {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid type",
        errors: "type must be bug or feature_request",
      });
    }

    const newIssue = await issueService.createIssue({ title, description, type, reporter_id });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
      data: newIssue,
    });
  } catch (error) {
    next(error);
  }
};

const getAllIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issues = await issueService.getAllIssues(req.query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid ID",
        errors: "Issue ID must be an integer",
      });
    }

    const issue = await issueService.getSingleIssue(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue retrieved successfully",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid ID",
        errors: "Issue ID must be an integer",
      });
    }

    const user = req.user;
    
    // Check if issue exists
    const existingIssue = await issueService.getIssueByIdRaw(id);
    
    if (!existingIssue) {
      return next({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Issue not found",
        errors: "No issue exists with this ID",
      });
    }

    // Authorization matrix check
    if (user.role === "contributor") {
      // Must be their own issue
      if (existingIssue.reporter_id !== user.id) {
        return next({
          statusCode: StatusCodes.FORBIDDEN,
          message: "Forbidden",
          errors: "Contributors can only edit their own issues",
        });
      }
      
      // Must be open
      if (existingIssue.status !== "open") {
        return next({
          statusCode: StatusCodes.CONFLICT, // 409 Conflict as per readme
          message: "Conflict",
          errors: "Contributors cannot edit issues that are no longer open",
        });
      }
    }

    // Only allow specific updates
    const { title, description, type, status } = req.body;
    
    if (Object.keys(req.body).length === 0) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "No updates provided",
        errors: "Provide at least one field to update",
      });
    }

    const updatedIssue = await issueService.updateIssue(id, { title, description, type, status });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

const deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return next({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid ID",
        errors: "Issue ID must be an integer",
      });
    }
    
    const existingIssue = await issueService.getIssueByIdRaw(id);
    if (!existingIssue) {
      return next({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Issue not found",
        errors: "No issue exists with this ID",
      });
    }

    await issueService.deleteIssue(id);

    // According to REST standards (204 No Content), but assignment says return 200 OK with JSON message
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
