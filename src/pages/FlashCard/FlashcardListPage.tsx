import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlashcardList from "./components/FlashcardList";

const FlashcardListPage: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      localStorage.removeItem("flashcard_mode");
    };
  }, []);

  return (
    <FlashcardList
      setId={setId}
      onBack={() => navigate(-1)}
    />
  );
};

export default FlashcardListPage;