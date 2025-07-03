export interface AdminLogin {
  username: string;
  password: string;
}

export interface AdminToken {
  access_token: string;
  token_type: string;
}

export interface AdminMe {
  username: string;
  is_superuser: boolean;
}

export interface AdminPasswordChange {
  old_password: string;
  new_password: string;
}

export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
} 