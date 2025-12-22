// src/api/knowledgeBases.js

import api from "./apiClient";

/**
 * Create Knowledge Base
 */
export const createKnowledgeBase = (payload) =>
  api.post("/api/knowledge-bases/", payload);

/**
 * List Knowledge Bases by user
 */
export const fetchKnowledgeBases = (userId) =>
  api.get(`/api/knowledge-bases?user_id=${userId}`);

/**
 * Get Knowledge Base with content
 */
export const fetchKnowledgeBaseById = (kbId) =>
  api.get(`/api/knowledge-bases/${kbId}`);
