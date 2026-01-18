export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId?: string | null;
  totalPoints: number;
  currentQuestionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

export interface AdminSugnupCredentials extends SignupCredentials{
  adminSecret:string;
}
