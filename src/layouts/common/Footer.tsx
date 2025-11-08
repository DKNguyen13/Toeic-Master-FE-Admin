import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">TOEIC Prep</h3>
            <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
              Nền tảng luyện thi TOEIC hàng đầu giúp bạn nâng cao kỹ năng, thi thử và theo dõi tiến độ dễ dàng.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-gray-700 hover:bg-yellow-400 transition transform hover:scale-110"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-yellow-400 transition">
                <Phone size={18} /> <a href="tel:+84123456780">+84 123456780</a>
              </li>
              <li className="flex items-center gap-2 hover:text-yellow-400 transition">
                <Mail size={18} /> <a href="mailto:nbn18@gmail.com">nbn18@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 hover:text-yellow-400 transition">
                <MapPin size={18} /> <span>Số 1 Võ Văn Ngân, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {["Điều Khoản & Điều Kiện", "Chính Sách Bảo Mật", "Hỗ Trợ"].map(
                (text, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-yellow-400 transition">{text}</a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className="my-8 h-px bg-gray-600 opacity-50"></div>
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TOEIC MASTER. All Rights Reserved.</p>
          <div className="mt-3 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-yellow-400 transition">Về chúng tôi</a>
            <a href="#" className="hover:text-yellow-400 transition">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;