import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap, FaHourglassHalf } from "react-icons/fa";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-150 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 rounded-full opacity-40 shadow-md"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              x: [-6, 6, -6],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-blue-200/60 max-w-md w-full mx-4 overflow-hidden"
        style={{
          boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "backOut" }}
            className="relative w-28 h-28 mb-4"
          >
            {/* Glow Background */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 blur-2xl"
            />

            {/* Inner Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-blue-300 via-blue-500 to-blue-600 p-1">
              <div className="w-full h-full rounded-full bg-white/95 shadow-inner" />
            </div>

            {/* Logo Content */}
            <div className="absolute inset-2 rounded-full bg-white shadow-xl flex flex-col items-center justify-center text-blue-700 font-bold text-lg tracking-wider border border-blue-100/50 overflow-hidden">
              <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <FaGraduationCap className="text-4xl mb-1 text-blue-600 drop-shadow-sm" />
              </motion.div>
              <div className="text-xs px-2 text-center leading-tight font-semibold text-blue-800 tracking-wide">
                TOEIC MASTER
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center font-bold text-lg tracking-wide mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent"
        >
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaHourglassHalf className="inline mr-2 text-blue-500" />
          </motion.span>
          Đang tải dữ liệu
        </motion.p>

        {/* Bouncing Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-3 mb-8"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-100/60 rounded-full h-2.5 mb-6 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 rounded-full shadow-lg relative overflow-hidden"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm font-medium italic bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent"
        >
          Hãy thư giãn trong khi chúng tôi chuẩn bị
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 1 }}
            className="inline-block ml-1.5">
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingSkeleton;