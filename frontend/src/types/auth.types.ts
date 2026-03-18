export interface CompleteProfilePayload {
  name: string;
  phone: string;
  location?: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: number;
  location?: string;
  profile_image?: string;
}