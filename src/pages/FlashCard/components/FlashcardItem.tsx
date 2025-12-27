import React, { useState } from "react";
import { Flashcard } from "./FlashcardList";
import { Trash, Music, Volume2, Lightbulb } from "lucide-react";

interface FlashcardItemProps {
  flashcard: Flashcard;
  onDelete?: (id: string) => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ flashcard, onDelete }) => {
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speakWord = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(flashcard.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full h-64 cursor-pointer" style={{ perspective: "1000px" }} onClick={() => setFlipped(!flipped)}>
      <div className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Mặt trước */}
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: "hidden" }}>
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 h-full flex flex-col justify-center items-center border-2 border-gray-200 hover:border-blue-400 transition-all duration-300">
            <div className="flex-1 w-full flex flex-col justify-center items-center overflow-y-auto px-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 break-all text-center leading-tight">{flashcard.word}</h2>   
              <p className="text-gray-500 text-sm">Nhấn để xem nghĩa</p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord();
              }}
              disabled={isPlaying}
              className={`mt-4 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 ${
                isPlaying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className={`text-lg ${isPlaying ? 'animate-pulse' : ''}`}>
                {isPlaying ? <Volume2 className="text-lg" /> : <Music className="text-lg" />}
              </span>
              {isPlaying ? 'Đang phát...' : 'Phát âm'}
            </button>
          </div>
        </div>

        {/* Mặt sau */}
        <div className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}>
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 h-full flex flex-col border-2 border-gray-200 hover:border-green-400 transition-all duration-300">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="text-center">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-2xl">🇻🇳</span>
                </div>
                
                <p className="text-xl font-bold text-gray-800 mb-3 break-words px-2">
                  {flashcard.meaning}
                </p>
                
                {flashcard.example && (
                  <div className="bg-amber-50 rounded-2xl p-4 mb-4 border-l-4 border-amber-400 max-w-lg mx-auto cursor-default"
                    title={`"${flashcard.example}"`}>
                    <p className="text-sm font-medium text-gray-700 italic text-left leading-relaxed line-clamp-3">"{flashcard.example}"</p>
                  </div>
                )}

                {flashcard.note && (
                  <div className="bg-blue-50 rounded-2xl p-4 mb-4 border-l-4 border-blue-400 max-w-lg mx-auto cursor-default" title={`${flashcard.note}`}>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 text-left leading-relaxed line-clamp-3 flex-1">{flashcard.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {flashcard._id && onDelete && (
              <div className="flex justify-center mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(flashcard._id!);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-2">
                  <Trash className="text-white text-xl" />
                  <span className="font-medium">Xóa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardItem;