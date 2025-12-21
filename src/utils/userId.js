// src/utils/userId.js
import { v4 as uuidv4 } from "uuid";

const KEY = "flux_user_id";

export function getOrCreateUserId() {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  const id = uuidv4();
  localStorage.setItem(KEY, id);
  return id;
}
