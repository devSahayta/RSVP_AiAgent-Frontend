// src/api/agentTests.js
import api from "./apiClient";

/* ===============================
   VOICE TEST
================================= */
export const testVoiceAgent = (agentId, data) =>
  api.post(`/api/agent-system/${agentId}/test-voice`, data);

/* ===============================
   CHAT TEST
================================= */
export const testChatAgent = (agentId, data) =>
  api.post(`/api/agent-system/${agentId}/test-chat`, data);

/* ===============================
   GET SINGLE TEST
================================= */
export const fetchTestSession = (sessionId) =>
  api.get(`/api/agent-system/test-sessions/${sessionId}`);

/* ===============================
   GET ALL USER TESTS
================================= */
// export const fetchUserTestSessions = (userId, page = 1, limit = 10) =>
//   api.get(`/api/agent-system/test-sessions`, {
//     data: { user_id: userId },
//     params: { page, limit },
//   });

export const fetchUserTestSessions = (userId, page = 1, limit = 10) =>
  api.get(`/api/agent-system/test-sessions`, {
    params: { user_id: userId, page, limit },
  });

/* ===============================
   SYNC VOICE STATUS
================================= */
export const syncVoiceTest = (conversationId) =>
  api.post(`/api/agent-system/test-sessions/sync/${conversationId}`);
