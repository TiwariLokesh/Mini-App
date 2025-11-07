import { db } from "../db.js";
import { OperationNode, OperationType, ThreadNode } from "../types.js";

export const getThreadsWithTree = (): ThreadNode[] => {
  const threadRows = db
    .prepare(`
      SELECT
        t.id,
        t.initial_value,
        t.created_at,
        u.id as author_id,
        u.username as author_username,
        u.created_at as author_created_at
      FROM threads t
      JOIN users u ON u.id = t.author_id
      ORDER BY t.created_at DESC
    `)
    .all() as Array<{
      id: number;
      initial_value: number;
      created_at: string;
      author_id: number;
      author_username: string;
      author_created_at: string;
    }>;

  return threadRows.map((thread) => {
    const operations = db
      .prepare(`
        SELECT
          o.id,
          o.thread_id,
          o.parent_operation_id,
          o.operation_type,
          o.operand,
          o.result,
          o.created_at,
          u.id as author_id,
          u.username as author_username,
          u.created_at as author_created_at
        FROM operations o
        JOIN users u ON u.id = o.author_id
        WHERE o.thread_id = ?
        ORDER BY o.created_at ASC
      `)
      .all(thread.id) as Array<{
        id: number;
        thread_id: number;
        parent_operation_id: number | null;
        operation_type: OperationType;
        operand: number;
        result: number;
        created_at: string;
        author_id: number;
        author_username: string;
        author_created_at: string;
      }>;

    const operationMap = new Map<number, OperationNode>();
    const root: OperationNode[] = [];

    operations.forEach((op) => {
      const node: OperationNode = {
        id: op.id,
        threadId: op.thread_id,
        parentOperationId: op.parent_operation_id,
        operationType: op.operation_type,
        operand: op.operand,
        result: op.result,
        createdAt: op.created_at,
        author: {
          id: op.author_id,
          username: op.author_username,
          createdAt: op.author_created_at
        },
        children: []
      };
      operationMap.set(node.id, node);
    });

    operationMap.forEach((node) => {
      if (node.parentOperationId) {
        const parent = operationMap.get(node.parentOperationId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        root.push(node);
      }
    });

    return {
      id: thread.id,
      initialValue: thread.initial_value,
      createdAt: thread.created_at,
      author: {
        id: thread.author_id,
        username: thread.author_username,
        createdAt: thread.author_created_at
      },
      operations: root
    };
  });
};

const getThreadBaseValue = (threadId: number): number | null => {
  const row = db
    .prepare("SELECT initial_value FROM threads WHERE id = ?")
    .get(threadId) as { initial_value: number } | undefined;
  return row ? row.initial_value : null;
};

const getOperationResult = (operationId: number): number | null => {
  const row = db
    .prepare("SELECT result FROM operations WHERE id = ?")
    .get(operationId) as { result: number } | undefined;
  return row ? row.result : null;
};

const applyOperation = (
  left: number,
  type: OperationType,
  operand: number
): number => {
  switch (type) {
    case "add":
      return left + operand;
    case "subtract":
      return left - operand;
    case "multiply":
      return left * operand;
    case "divide":
      if (operand === 0) {
        throw new Error("Division by zero");
      }
      return left / operand;
    default:
      return left;
  }
};

export const createThread = (initialValue: number, authorId: number): ThreadNode => {
  const result = db
    .prepare("INSERT INTO threads (initial_value, author_id) VALUES (?, ?)")
    .run(initialValue, authorId);
  const row = db
    .prepare(`
      SELECT
        t.id,
        t.initial_value,
        t.created_at,
        u.id as author_id,
        u.username as author_username,
        u.created_at as author_created_at
      FROM threads t
      JOIN users u ON u.id = t.author_id
      WHERE t.id = ?
    `)
    .get(result.lastInsertRowid) as {
      id: number;
      initial_value: number;
      created_at: string;
      author_id: number;
      author_username: string;
      author_created_at: string;
    };

  return {
    id: row.id,
    initialValue: row.initial_value,
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      createdAt: row.author_created_at
    },
    operations: []
  };
};

export const createOperation = (
  threadId: number,
  parentOperationId: number | null,
  type: OperationType,
  operand: number,
  authorId: number
): OperationNode => {
  const baseValue = parentOperationId
    ? getOperationResult(parentOperationId)
    : getThreadBaseValue(threadId);

  if (baseValue === null) {
    throw new Error("Parent computation not found");
  }

  const resultValue = applyOperation(baseValue, type, operand);

  const result = db
    .prepare(
      `INSERT INTO operations (thread_id, parent_operation_id, operation_type, operand, result, author_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(threadId, parentOperationId, type, operand, resultValue, authorId);

  const row = db
    .prepare(`
      SELECT
        o.id,
        o.thread_id,
        o.parent_operation_id,
        o.operation_type,
        o.operand,
        o.result,
        o.created_at,
        u.id as author_id,
        u.username as author_username,
        u.created_at as author_created_at
      FROM operations o
      JOIN users u ON u.id = o.author_id
      WHERE o.id = ?
    `)
    .get(result.lastInsertRowid) as {
      id: number;
      thread_id: number;
      parent_operation_id: number | null;
      operation_type: OperationType;
      operand: number;
      result: number;
      created_at: string;
      author_id: number;
      author_username: string;
      author_created_at: string;
    };

  return {
    id: row.id,
    threadId: row.thread_id,
    parentOperationId: row.parent_operation_id,
    operationType: row.operation_type,
    operand: row.operand,
    result: row.result,
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      createdAt: row.author_created_at
    },
    children: []
  };
};
