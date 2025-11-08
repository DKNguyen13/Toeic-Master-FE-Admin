// MainLayout.tsx
import React, { useState } from "react";
import AdminHeader from "./common/Header";
import Footer from "./common/Footer";
const MainLayout = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<AdminHeader />
			<main className="min-h-screen">
				{React.cloneElement(children, { setIsOpen })} {/* Truyền setIsOpen xuống component con */}
			</main>
			<Footer />
		</>
	);
};

export default MainLayout;
