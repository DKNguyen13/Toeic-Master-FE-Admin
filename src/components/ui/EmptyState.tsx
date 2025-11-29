import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ 
  message = "Lỗi kết nối. Vui lòng thử lại sau!" 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500">
      <AlertCircle className="mx-auto mb-4 w-10 h-10 text-red-400" />
      <p>{message}</p>
    </div>
  );
}