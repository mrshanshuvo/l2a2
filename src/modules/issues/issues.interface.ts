export interface TCreateIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporter_id: number;
}

export interface TUpdateIssue {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

export interface TIssueQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

export interface TIssueResponse {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id?: number; // Might be omitted when joining
  reporter?: {
    id: number;
    name: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}
