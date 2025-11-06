export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (status: boolean) => void;
  socketUrl?: string;
}