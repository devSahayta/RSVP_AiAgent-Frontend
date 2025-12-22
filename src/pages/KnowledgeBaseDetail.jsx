import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchKnowledgeBaseById } from "../api/knowledgeBases";

export default function KnowledgeBaseDetail() {
  const { id } = useParams();
  const [kb, setKb] = useState(null);

  useEffect(() => {
    fetchKnowledgeBaseById(id).then((res) => {
      setKb(res.data);
    });
  }, [id]);

  if (!kb) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">{kb.name}</h1>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Knowledge Content
        </h3>

        {kb.knowledge_entries.map((entry, index) => (
          <pre
            key={index}
            className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
          >
            {entry.content}
          </pre>
        ))}
      </div>
    </div>
  );
}
