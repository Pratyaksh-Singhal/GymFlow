export type AuthUser = {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  [key: string]: unknown;
};

export type SignupPayload = {
  gym_name: string;
  owner_name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ResetPasswordRequestPayload = {
  email: string;
};

export type CompleteResetPayload = {
  email: string;
  token: string;
  password: string;
};

async function fetchJson<T>(
  url: string,
  body: unknown = undefined,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export type SignupResponse = {
  user: AuthUser;
  tenant: { id: string; name: string };
  token: string;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export type RefreshResponse = {
  user: AuthUser;
  token: string;
};

export type ResetResponse = {
  success: boolean;
  message: string;
};

export async function signUpUser(payload: SignupPayload): Promise<SignupResponse> {
  return fetchJson<SignupResponse>('/api/auth/signup', payload);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/api/auth/login', payload);
}

export async function logoutUser(): Promise<{ message: string }> {
  return fetchJson<{ message: string }>('/api/auth/logout', {});
}

export async function refreshSession(): Promise<RefreshResponse> {
  return fetchJson<RefreshResponse>('/api/auth/refresh', undefined, {
    method: 'POST',
  });
}

export async function sendResetPasswordEmail(
  payload: ResetPasswordRequestPayload
): Promise<ResetResponse> {
  return fetchJson<ResetResponse>('/api/auth/reset-password', payload);
}

export async function completePasswordReset(payload: CompleteResetPayload): Promise<ResetResponse> {
  return fetchJson<ResetResponse>('/api/auth/reset-password', payload);
}
