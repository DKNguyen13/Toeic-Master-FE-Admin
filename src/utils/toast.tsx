import React from "react";
import { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastOptions, ToastContainer, Slide } from "react-toastify";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warn" = "info",
  options?: ToastOptions
) => {
  const config: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    pauseOnHover: true,
    closeOnClick: true,
    transition: Slide,
    theme: "light",
    ...options,
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "warn":
      toast.warn(message, config);
      break;
    default:
      toast.info(message, config);
  }
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => (
  <>
    {children}
    <ToastContainer newestOnTop={true} />
  </>
);