import React, { useState } from "react";
import { isLoggedIn } from "../../config/axios";
import FlashcardSetList from "./components/FlashcardSetList";

const FlashcardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"myList" | "explore">("myList");

  return (
    <div className="min-h-screen">
      {/* Panel header */}
      <div className="w-full shadow-lg py-8 px-8"
        style={{
          background:
            "linear-gradient(to right, #f5efe6ff 0%, #D6EAF8 60%, #D6EAF8 100%)",
        }}>
        <div className="flex items-center mb-6">
          <i className="far fa-clone text-4xl mr-4 text-white"></i>
          <span className="text-3xl font-bold text-black">
            📚 Flashcards
          </span>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("myList")}
            className={`text-base font-medium px-4 py-2 rounded-full transition ${
              activeTab === "myList"
                ? "bg-blue-200 text-blue-800"
                : "bg-white text-blue-700 hover:bg-blue-100"
            }`}>
            List từ của tôi
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`text-base font-medium px-4 py-2 rounded-full transition ${
              activeTab === "explore"
                ? "bg-blue-200 text-blue-800"
                : "bg-white text-blue-700 hover:bg-blue-100"
            }`}>
            Khám phá
          </button>
        </div>
      </div>

      {/* Flashcard list */}
      <div className="mt-10 px-8">
        {activeTab === "myList" && <FlashcardSetList type="myList" isLoggedIn={isLoggedIn()}/>}
        {activeTab === "explore" && <FlashcardSetList type="explore" isLoggedIn={isLoggedIn()} />}
      </div>
    </div>
  );
};

export default FlashcardPage;
