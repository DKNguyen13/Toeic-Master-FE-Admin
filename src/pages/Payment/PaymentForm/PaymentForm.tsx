import React, { useState } from "react";
import { GoArrowLeft } from "react-icons/go";

const PaymentPage: React.FC = () => {
	// State điều khiển popup
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);

	const handlePayment = (event: React.FormEvent) => {
		event.preventDefault();
		setShowSuccessPopup(true);
	};

	return (
		<div className="min-h-screen flex bg-gray-50 pt-5 pl-5">
			{/* Left Content */}
			<div className="w-[598px] h-[585px] relative bg-[#e9effd] overflow-hidden">
				<img
					className="w-[597px] h-[372px] left-0 top-[222px] absolute"
					src="./../src/assets/images/hands-pinches.png"
					alt="Payment"
				/>
				<div className="w-[391px] left-[101px] top-[108px] absolute inline-flex flex-col justify-start items-start gap-1.5">
					<div className="self-stretch justify-center text-[#123276] text-base font-bold font-['Poppins']">
						Gói năm
					</div>
					<div className="self-stretch flex flex-col justify-start items-start">
						<div className="self-stretch justify-center text-[#123276] text-[32px] font-bold font-['Inter']">
							Chỉ 299.000đ/Tháng
						</div>
						<div className="self-stretch justify-center text-[#163b8d] text-sm font-normal font-['Poppins']">
							The best for those seeking a life of learning and growth
						</div>
					</div>
				</div>
				<div className="w-[98px] left-[74px] top-[48px] absolute inline-flex justify-start items-start gap-[3px]">
					<GoArrowLeft className="text-blue-600" />
					<div className="flex-1 justify-center text-blue-600 text-base font-normal font-['Poppins']">
						Back
					</div>
				</div>
			</div>

			{/* Right Content - Payment Form */}
			<div className="flex-1 p-8 pl-20">
				<h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
					Thanh toán bằng thẻ
				</h1>
				<form onSubmit={handlePayment}>
					{/* Email */}
					<div className="mb-6">
						<label className="block text-gray-700 mb-2" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							type="email"
							defaultValue="phanhuuyen203@gmail.com"
							className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Card Information */}
					<div className="mb-6">
						<label
							className="block text-gray-700 mb-2"
							htmlFor="card-info"
						>
							Card information
						</label>
						<div className="flex space-x-4">
							<input
								id="card-info"
								type="text"
								placeholder="1234 1234 1234 1234"
								className="w-2/3 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="text"
								placeholder="MM/YY"
								className="w-1/3 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Card Holder */}
					<div className="mb-6">
						<label
							className="block text-gray-700 mb-2"
							htmlFor="card-holder"
						>
							Tên khách hàng
						</label>
						<input
							id="card-holder"
							type="text"
							placeholder="Tên khách hàng"
							className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Country */}
					<div className="mb-6">
						<label className="block text-gray-700 mb-2" htmlFor="country">
							Quốc gia
						</label>
						<select
							id="country"
							className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="Turkey">Turkey</option>
							<option value="Vietnam">Vietnam</option>
							<option value="USA">USA</option>
							<option value="Germany">Germany</option>
						</select>
					</div>

					{/* Submit Button */}
					<div className="text-center">
						<button
							type="submit"
							className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300"
						>
							Xác nhận thanh toán
						</button>
					</div>
				</form>

				{/* Popup Thanh toán thành công */}
				{showSuccessPopup && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
						<div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
							<h2 className="text-xl font-bold mb-4 text-center text-green-600">
								Thanh toán thành công!
							</h2>
							<p className="text-gray-700 mb-6 text-center">
								Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
							</p>
							<div className="text-center">
								<button
									onClick={() => setShowSuccessPopup(false)}
									className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
								>
									OK
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PaymentPage;
