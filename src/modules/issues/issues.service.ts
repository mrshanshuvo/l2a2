import { pool } from "../../db/index.ts";
import type { TCreateIssue, TIssueQuery, TIssueResponse, TUpdateIssue } from "./issues.interface.ts";

export class CustomError extends Error {
  statusCode: number;
  errors: string;

  constructor(statusCode: number, message: string, errors: string) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const createIssue = async (payload: TCreateIssue): Promise<TIssueResponse> => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [title, description, type, reporter_id]
  );

  return result.rows[0];
};

const getAllIssues = async (query: TIssueQuery): Promise<TIssueResponse[]> => {
  const { sort = "newest", type, status } = query;

  // 1. Build the dynamic SQL for filtering issues
  let sql = "SELECT * FROM issues WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (type) {
    sql += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    sql += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Add sorting
  if (sort === "oldest") {
    sql += " ORDER BY created_at ASC";
  } else {
    sql += " ORDER BY created_at DESC";
  }

  // 2. Fetch the issues
  const issuesResult = await pool.query(sql, params);
  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  // 3. Extract unique reporter_ids
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  // 4. Fetch reporters without JOIN
  const reportersResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = ANY($1)",
    [reporterIds]
  );
  
  // Create a map for quick lookup
  const reportersMap = new Map();
  for (const reporter of reportersResult.rows) {
    reportersMap.set(reporter.id, reporter);
  }

  // 5. Merge issues and reporters
  const populatedIssues = issues.map((issue) => {
    const reporter = reportersMap.get(issue.reporter_id);
    const { reporter_id, ...issueData } = issue; // Omit reporter_id as per spec example
    return {
      ...issueData,
      reporter,
    };
  });

  return populatedIssues;
};

const getSingleIssue = async (id: number): Promise<TIssueResponse> => {
  const issueResult = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);

  if (issueResult.rowCount === 0) {
    throw new CustomError(404, "Issue not found", "No issue exists with this ID");
  }

  const issue = issueResult.rows[0];

  const reporterResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );

  const { reporter_id, ...issueData } = issue;
  return {
    ...issueData,
    reporter: reporterResult.rows[0],
  };
};

const updateIssue = async (id: number, payload: TUpdateIssue): Promise<TIssueResponse> => {
  const { title, description, type, status } = payload;

  const updates: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    params.push(title);
    paramIndex++;
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    params.push(description);
    paramIndex++;
  }
  if (type !== undefined) {
    updates.push(`type = $${paramIndex}`);
    params.push(type);
    paramIndex++;
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // Always update updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  params.push(id);
  
  const sql = `
    UPDATE issues 
    SET ${updates.join(", ")} 
    WHERE id = $${paramIndex} 
    RETURNING *
  `;

  const result = await pool.query(sql, params);
  return result.rows[0];
};

const deleteIssue = async (id: number): Promise<void> => {
  await pool.query("DELETE FROM issues WHERE id = $1", [id]);
};

// Internal utility to check issue existence and owner
const getIssueByIdRaw = async (id: number) => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  return result.rows[0];
};

export const issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
  getIssueByIdRaw,
};
