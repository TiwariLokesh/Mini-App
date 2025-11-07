import { beforeEach, describe, expect, it } from "vitest";

import { db } from "../src/db.js";
import { createOperation, createThread, getThreadsWithTree } from "../src/services/threadService.js";

const createUser = (username: string) => {
  const result = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, "hashed");
  return Number(result.lastInsertRowid);
};

describe("threadService", () => {
  beforeEach(() => {
    db.exec("DELETE FROM operations; DELETE FROM threads; DELETE FROM users;");
  });

  it("builds nested operation trees", () => {
    const userId = createUser("alice");
    const thread = createThread(10, userId);

    const op1 = createOperation(thread.id, null, "add", 5, userId);
    const op2 = createOperation(thread.id, op1.id, "multiply", 2, userId);

    createOperation(thread.id, op2.id, "subtract", 3, userId);

    const threads = getThreadsWithTree();
    expect(threads).toHaveLength(1);
    expect(threads[0].operations).toHaveLength(1);
    expect(threads[0].operations[0].children[0].result).toBe(30);
    expect(threads[0].operations[0].children[0].children[0].result).toBe(27);
  });

  it("throws when dividing by zero", () => {
    const userId = createUser("bob");
    const thread = createThread(10, userId);
    expect(() => createOperation(thread.id, null, "divide", 0, userId)).toThrow("Division by zero");
  });
});
