export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
