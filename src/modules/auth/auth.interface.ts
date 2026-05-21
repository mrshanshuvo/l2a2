export interface TSignupData {
  name: string;
  email: string;
  password?: string;
  role?: "contributor" | "maintainer";
}

export interface TLoginData {
  email: string;
  password?: string;
}

export interface TUserResponse {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}
