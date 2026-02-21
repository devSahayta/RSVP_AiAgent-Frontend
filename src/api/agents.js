// src/api/agents.js
import api from "./apiClient";

// Get All Agent by user
export const fetchUserAgents = (userId) =>
  api.get(`/api/agent-system/user/${userId}`);

// Get agents details
export const fetchAgentById = (agentId) =>
  api.get(`/api/agent-system/${agentId}`);
