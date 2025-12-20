import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlashcardList from "./components/FlashcardList";

const FlashcardListPage: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 rounded-lg border rounded hover:bg-gray-100">
        ← Quay lại
      </button>
      <FlashcardList setId={setId} />
    </div>
  );
};

export default FlashcardListPage;
