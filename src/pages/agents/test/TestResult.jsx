import React, { useEffect, useState } from "react";
import { fetchTestSession } from "../../../api/agentTests";
import { useParams } from "react-router-dom";

const TestResult = () => {
  const { session_id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchTestSession(session_id);
      setData(res.data.data);
    };
    load();
  }, [session_id]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <h1 className="text-xl font-semibold mb-6">Test Result</h1>

      <div className="bg-[#12121A] p-6 rounded-xl border border-[#1F1F2E]">
        <p>Status: {data.test_status}</p>
        <p>Type: {data.test_type}</p>
        <p>Duration: {data.duration_seconds}</p>

        {data.test_data_collected && (
          <pre className="mt-4 text-sm text-gray-400">
            {JSON.stringify(data.test_data_collected, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TestResult;
