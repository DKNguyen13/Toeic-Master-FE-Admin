// MainLayout.tsx
import React, { useState } from "react";
import AdminHeader from "./common/Header";
import Footer from "./common/Footer";
import Chatbot from "../components/chatbot/Chatbot";
const MainLayout = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<AdminHeader />
			<main className="min-h-screen">
				{React.cloneElement(children, { setIsOpen })} {/* Truyền setIsOpen xuống component con */}
			</main>
			<Chatbot isOpen={isOpen} setIsOpen={setIsOpen} socketUrl="http://localhost:8081"/>
			<Footer />
		</>
	);
};

export default MainLayout;
