import React from "react";

const AdminPrivacy: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl text-center font-bold mt-2 mb-4">Chính sách bảo mật</h1>

      <p className="mb-4">
        Chào mừng Admin của Toeic Master! Trang Chính sách bảo mật này giải thích cách chúng tôi quản lý thông tin nhạy cảm mà Admin có quyền truy cập, bao gồm dữ liệu người dùng, nội dung hệ thống và thông tin tài khoản. Bằng việc sử dụng quyền Admin, bạn đồng ý tuân thủ các quy định bảo mật này.
      </p>

      <h3 className="text-xl font-semibold mt-4">1. Thông tin Admin và dữ liệu nhạy cảm</h3>
      <p>
        Admin có quyền truy cập các loại dữ liệu sau:
      </p>
      <ul className="list-disc pl-6">
        <li>Thông tin cá nhân của người dùng (tên, email, số điện thoại nếu có)</li>
        <li>Thông tin tài khoản người dùng, tiến độ học tập và kết quả bài thi</li>
        <li>Dữ liệu hệ thống, nội dung bài học, bài kiểm tra và tài liệu học tập</li>
        <li>Nhật ký hoạt động và thông tin bảo mật liên quan đến Admin</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">2. Mục đích sử dụng dữ liệu</h3>
      <p>
        Admin chỉ được sử dụng dữ liệu nhạy cảm trong phạm vi công việc, bao gồm:
      </p>
      <ul className="list-disc pl-6">
        <li>Quản lý, giám sát và cải thiện chất lượng dịch vụ</li>
        <li>Hỗ trợ người dùng, giải quyết khiếu nại hoặc sự cố kỹ thuật</li>
        <li>Phân tích dữ liệu tổng hợp để đưa ra các báo cáo quản trị</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">3. Bảo mật thông tin</h3>
      <p>
        Admin phải đảm bảo bảo mật thông tin đăng nhập và không chia sẻ quyền truy cập với bất kỳ ai. Các biện pháp bảo mật bao gồm mật khẩu mạnh, xác thực hai lớp (nếu có) và tuân thủ các quy định nội bộ về dữ liệu.
      </p>

      <h3 className="text-xl font-semibold mt-4">4. Cookies và theo dõi</h3>
      <p>
        Hệ thống có thể sử dụng cookies hoặc các công cụ theo dõi để giám sát hoạt động Admin nhằm mục đích bảo mật, phân tích và tối ưu trải nghiệm quản trị.
      </p>

      <h3 className="text-xl font-semibold mt-4">5. Quyền truy cập và chỉnh sửa dữ liệu</h3>
      <p>
        Admin phải tuân thủ các quyền hạn được cấp. Mọi yêu cầu truy cập hoặc chỉnh sửa dữ liệu nhạy cảm ngoài phạm vi được phép phải được phê duyệt bởi quản trị cấp cao.
      </p>

      <h3 className="text-xl font-semibold mt-4">6. Chia sẻ dữ liệu</h3>
      <p>
        Admin không được chia sẻ thông tin người dùng hoặc dữ liệu nhạy cảm với bất kỳ bên thứ ba nào mà không có sự cho phép rõ ràng từ Ban quản trị. Vi phạm sẽ dẫn đến thu hồi quyền truy cập và có thể chịu trách nhiệm pháp lý.
      </p>

      <h3 className="text-xl font-semibold mt-4">7. Thay đổi Chính sách bảo mật</h3>
      <p>
        Toeic Master có quyền cập nhật hoặc thay đổi Chính sách bảo mật Admin bất kỳ lúc nào. Admin chịu trách nhiệm kiểm tra thường xuyên để nắm bắt các thay đổi.
      </p>

      <h3 className="text-xl font-semibold mt-4">8. Liên hệ</h3>
      <p className="mb-4">
        Nếu có thắc mắc hoặc cần hỗ trợ về bảo mật dữ liệu Admin, vui lòng liên hệ: <strong>support@toeicmaster.com</strong> hoặc <strong>(123) 456-7890</strong>.
      </p>
    </div>
  );
};

export default AdminPrivacy;