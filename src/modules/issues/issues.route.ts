import { Router } from "express";
import { issueController } from "./issues.controller.js";
import auth from "../../middleware/auth.js";

export const issueRoute = Router();

issueRoute.post("/", auth("contributor", "maintainer"), issueController.createIssue);
issueRoute.get("/", issueController.getAllIssues);
issueRoute.get("/:id", issueController.getSingleIssue);
issueRoute.patch("/:id", auth("contributor", "maintainer"), issueController.updateIssue);
issueRoute.delete("/:id", auth("maintainer"), issueController.deleteIssue);
