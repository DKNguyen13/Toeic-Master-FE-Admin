import { CiFacebook, CiInstagram, CiLocationOn, CiMail, CiPhone, CiYoutube } from "react-icons/ci";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">TOEIC Prep</h3>
            <p className="text-sm text-gray-200 max-w-xs leading-relaxed">
              Nền tảng luyện thi TOEIC hàng đầu giúp bạn nâng cao kỹ năng, thi thử và theo dõi tiến độ dễ dàng.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-200 hover:text-white transition-colors duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <CiFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-white transition-colors duration-300 transform hover:scale-110"
                aria-label="YouTube"
              >
                <CiYoutube size={24} />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-white transition-colors duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <CiInstagram size={24} />
              </a>
            </div>
            
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              <li className="flex items-center group">
                <CiPhone className="mr-2 text-blue-300 group-hover:text-white transition-colors duration-300" size={20} />
                <a href="tel:+84123456780" className="hover:underline">+84 123456780</a>
              </li>
              <li className="flex items-center group">
                <CiMail className="mr-2 text-blue-300 group-hover:text-white transition-colors duration-300" size={20} />
                <a href="mailto:abc@gmail.com" className="hover:underline">nbn18@gmail.com</a>
              </li>
              <li className="flex items-center group">
                <CiLocationOn className="mr-2 text-blue-300 group-hover:text-white transition-colors duration-300" size={20} />
                <span>Số 1 Võ Văn Ngân, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Liên kết nhanh</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              <li>
                <a href="#" className="hover:underline hover:text-white transition-colors duration-300">
                  Điều Khoản & Điều Kiện
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-white transition-colors duration-300">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-white transition-colors duration-300">
                  Hỗ Trợ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-[1px] bg-gray-300 opacity-50"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} TOEIC MASTER. All Rights Reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Về chúng tôi
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;