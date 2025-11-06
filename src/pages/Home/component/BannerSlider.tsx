import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './BannerSlider.css';

const BannerSlider = () => {
  return (
    <div className="relative w-full bg-blue-500"> {/* Thêm background xanh ở container */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        speed={800}
        className="banner-swiper"
      >
        {/* Slide 1: Giới thiệu */}
        <SwiperSlide>
          <div className="flex bg-blue-500 gap-8 min-h-[35vh] pt-5">
            <div className="flex-[65%] pt-6 hidden md:block">
              <div className="text-white space-y-6 ml-[12%] mt-[2%] p-6">
                {/* Title */}
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
                    Nền tảng thi thử TOEIC®<br />
                    trực tuyến hàng đầu
                  </h1>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 text-white/95">
                      <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={20} />
                      <p className="text-base md:text-lg">Tuyển tập đề thi sát với kỳ thi thật nhất</p>
                    </div>
                    <div className="flex items-start gap-3 text-white/95">
                      <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={20} />
                      <p className="text-base md:text-lg">Đánh giá chính xác năng lực của bạn</p>
                    </div>
                    <div className="flex items-start gap-3 text-white/95">
                      <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={20} />
                      <p className="text-base md:text-lg">Chatbot AI hỗ trợ học tập 24/7</p>
                    </div>
                  </div>


                <Link to={"/register"}>
                  <button className="mt-5 bg-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition border border-orange-500">
                    Bắt đầu ngay
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex-[35%] relative hidden md:block">
              <img
                src="src/assets/images/banner-img.svg"
                alt="Banner"
                className="h-[80%] absolute bottom-0 right-10"
              />
            </div>

            {/* Mobile view */}
            <div className="md:hidden flex flex-col items-center justify-center text-white p-8 w-full mt-[20%]">
              <h2 className="text-2xl font-bold text-center mb-4">
                Nền tảng thi thử TOEIC® trực tuyến miễn phí
              </h2>
              <Link to={"/register"}>
                <button className="mt-5 bg-red-500 text-white font-semibold px-6 py-3 rounded-lg">
                  Bắt đầu ngay
                </button>
              </Link>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2: Giảm giá - CÙNG BACKGROUND XANH */}
        <SwiperSlide>
          <div className="flex bg-blue-500 gap-8 min-h-[35vh] pt-5 relative overflow-hidden">
            {/* Decorative elements - màu vàng/cam để nổi bật trên nền xanh */}
            <div className="flex-[65%] hidden md:block relative z-10 mb-4">
              <div className="text-white space-y-6 ml-[12%] mt-[2%] p-6">
              {/* Discount Badge */}
              <div className="inline-flex items-center gap-4 mb-6">
                {/* Vòng tròn 50% OFF */}
                <div className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-red-600 to-orange-500 shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-[pulse-glow_2s_infinite]">
                  <span className="text-5xl font-extrabold text-white drop-shadow-lg">50%</span>
                  <span className="text-lg font-semibold text-yellow-200 drop-shadow-md">OFF</span>

                  {/* Viền ngoài sáng nhẹ */}
                  <div className="absolute inset-0 rounded-full border-4 border-white/40 blur-sm"></div>
                </div>

                {/* Nút HOT DEAL */}
                <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-5 py-3 rounded-xl font-extrabold text-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300">
                  🔥 HOT DEAL
                </div>
              </div>


                <h2 className="text-4xl font-bold">
                  Khuyến Mãi Đặc Biệt - Giảm Giá Sốc!
                </h2>

                <div className="flex items-center gap-4 mt-6">
                  <Link to={"/payment"}>
                    <button className="bg-gradient-to-r from-red-400 to-red-500 text-white font-bold px-8 py-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg">
                      🛒 Mua Ngay - Tiết Kiệm 50%
                    </button>
                  </Link>
                  <div className="text-white">
                    <div className="text-sm line-through opacity-75">999.000đ</div>
                    <div className="text-3xl font-bold">499.000đ</div>
                  </div>
                </div>

                <div className="text-sm mt-4 bg-red-500 bg-opacity-80 inline-block px-4 py-2 rounded-lg shadow-lg">
                  ⏰ Ưu đãi có giới hạn - Chỉ còn <span className="font-bold text-yellow-200">48 giờ</span>
                </div>
              </div>
            </div>

            <div>
              <img
                src="src/assets/images/discount-banner.png"
                alt="Discount Banner"
                className="h-[80%] absolute bottom-0 right-10 opacity-20 md:opacity-100 hidden md:block"
              />
            </div>
            

            {/* Mobile view */}
            <div className="md:hidden flex flex-col items-center justify-center text-white p-8 w-full">
              <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl mb-6">
                <span className="text-5xl font-black text-white">50%</span>
                <span className="text-lg font-bold text-white">OFF</span>
              </div>
              <h2 className="text-3xl font-bold text-center mb-4">
                Giảm Giá Đặc Biệt!
              </h2>
              <p className="text-lg text-center mb-6">
                Premium 6 tháng chỉ còn <span className="font-bold text-yellow-300">499.000đ</span>
              </p>
              <Link to={"/pricing"}>
                <button className="bg-gradient-to-r from-red-400 to-red-500 text-white font-bold px-8 py-4 rounded-lg shadow-xl">
                  Mua Ngay
                </button>
              </Link>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      </div>
  );
};

export default BannerSlider;