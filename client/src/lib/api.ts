import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";

import { authStorage } from "./authStorage";
import type { AuthResponse, OperationType, ThreadNode, ThreadsResponse } from "../types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const api = axios.create({
  baseURL,
  withCredentials: false
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  async login(data: { username: string; password: string }) {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },
  async register(data: { username: string; password: string }) {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },
  async me() {
    const response = await api.get<{ user: AuthResponse["user"] }>("/auth/me");
    return response.data.user;
  }
};

export const threadApi = {
  async list(): Promise<ThreadsResponse> {
    const response = await api.get<ThreadsResponse>("/threads");
    return response.data;
  },
  async create(initialValue: number): Promise<{ thread: ThreadNode }> {
    const response = await api.post<{ thread: ThreadNode }>("/threads", { initialValue });
    return response.data;
  },
  async createOperation(options: {
    threadId: number;
    parentOperationId: number | null;
    operationType: OperationType;
    operand: number;
  }) {
    const response = await api.post<{ operation: ThreadNode["operations"][number] }>(
      `/threads/${options.threadId}/operations`,
      {
        parentOperationId: options.parentOperationId,
        operationType: options.operationType,
        operand: options.operand
      }
    );
    return response.data;
  }
};
