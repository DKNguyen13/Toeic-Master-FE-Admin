import React from "react";

interface PartSelectorProps {
  parts: number[];
  currentPart: number;
  setCurrentPart: (part: number) => void;
  setCurrentQuestion: (index: number) => void;
}

const PartSelector: React.FC<PartSelectorProps> = ({
  parts,
  currentPart,
  setCurrentPart,
  setCurrentQuestion,
}) => {
  return (
    <div className="flex gap-2 my-4">
      {parts.map((p) => (
        <button
          key={p}
          onClick={() => {
            setCurrentPart(p);
            setCurrentQuestion(0);
          }}
          className={`px-3 py-1 rounded-md ${
            currentPart === p ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Part {p}
        </button>
      ))}
    </div>
  );
};

export default PartSelector;
