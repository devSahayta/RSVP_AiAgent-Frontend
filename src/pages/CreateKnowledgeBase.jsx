import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createKnowledgeBase } from "../api/knowledgeBases";
import useAuthUser from "../hooks/useAuthUser";

export default function CreateKnowledgeBase() {
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await createKnowledgeBase({
      user_id: userId,
      name,
      content,
    });

    navigate("/knowledge-bases");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-100">
      <h1 className="text-2xl font-semibold text-gray-100 mb-6">
        Create Knowledge Base
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-xl shadow-sm space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Knowledge Base Name
          </label>
          <input
            className="w-full border border-[#2a2a2a] bg-[#0f0f0f] text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wedding FAQs"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content
          </label>
          <textarea
            rows={10}
            className="w-full border border-[#2a2a2a] bg-[#0f0f0f] text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter all event-related information here..."
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/knowledge-bases")}
            className="px-4 py-2 border border-[#2a2a2a] rounded-lg text-gray-300 hover:bg-[#1a1a1a]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

