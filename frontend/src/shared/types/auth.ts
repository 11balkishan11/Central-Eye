export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
}

export interface AuthSession {
  access_token: string;
  user: User;
  session?: {
    tenant_id: string;
  };
}
