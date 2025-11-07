export type OperationType = "add" | "subtract" | "multiply" | "divide";

export interface PublicUser {
  id: number;
  username: string;
  createdAt: string;
}

export interface OperationNode {
  id: number;
  threadId: number;
  parentOperationId: number | null;
  operationType: OperationType;
  operand: number;
  result: number;
  createdAt: string;
  author: PublicUser;
  children: OperationNode[];
}

export interface ThreadNode {
  id: number;
  initialValue: number;
  createdAt: string;
  author: PublicUser;
  operations: OperationNode[];
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface ThreadsResponse {
  threads: ThreadNode[];
}
