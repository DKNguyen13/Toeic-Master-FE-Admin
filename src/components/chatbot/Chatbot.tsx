import React, { useState, useEffect, useCallback } from "react";
import ChatMessages from "./ChatContainer";
import ChatInput from "./ChatInput";
import { Message, ChatbotProps } from "./types/chatbot";
import socketService from "../../service/socket";

const Chatbot: React.FC<ChatbotProps> = ({
  isOpen,
  setIsOpen,
  socketUrl = "http://localhost:3001",
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Xin chào! Tôi là TOEIC Bot. Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (isOpen) {
      const socket = socketService.connect(socketUrl);

      socket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      socket.on("response", (text: string) => {
        console.log("Received from server:", text);
        
        // Remove loading message
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));

        // Add bot response
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: text,
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
        setIsWaitingResponse(false);
      });

      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        
        // Remove loading message
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
        setIsWaitingResponse(false);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("response");
        socket.off("error");
      };
    }
  }, [isOpen, socketUrl]);

  const handleSendMessage = useCallback((text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsWaitingResponse(true);

    // Send message via socket
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("message", text);
    } else {
      console.error("Socket not connected");
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Không thể kết nối đến server. Vui lòng thử lại.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsWaitingResponse(false);
    }
  }, []);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-96 h-[550px] bg-white rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <h2 className="text-lg font-semibold">TOEIC Bot</h2>
            </div>
            <button
              onClick={toggleChatbot}
              className="hover:bg-blue-700 rounded-full p-1 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} />

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected || isWaitingResponse}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;