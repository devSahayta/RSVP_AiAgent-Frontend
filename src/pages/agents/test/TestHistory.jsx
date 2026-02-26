import React, { useEffect, useState } from "react";
import { fetchUserTestSessions } from "../../../api/agentTests";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../../../hooks/useAuthUser";
// import useAuthUser from "../../../hooks/useAuthUser";

const TestHistory = () => {
  const { userId } = useAuthUser();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const res = await fetchUserTestSessions(userId);
      setTests(res.data.data || []);
    };

    load();
  }, [userId]);

  console.log({ userId });

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Test Sessions</h1>

      <div className="space-y-4">
        {tests.map((test) => (
          <div
            key={test.test_session_id}
            onClick={() =>
              navigate(`/agents/test-history/${test.test_session_id}`)
            }
            className="cursor-pointer p-4 rounded-xl bg-[#12121A] border border-[#1F1F2E] hover:border-blue-500"
          >
            <p className="text-sm text-gray-400">Type: {test.test_type}</p>
            <p>Status: {test.test_status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestHistory;
