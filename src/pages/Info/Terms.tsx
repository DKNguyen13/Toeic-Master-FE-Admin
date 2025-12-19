import React from "react";

const AdminTerms: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl text-center font-bold mt-4 mb-4">Điều khoản sử dụng</h1>

      <p className="mb-4">
        Chào mừng bạn đến với hệ thống Admin của Toeic Master! Bằng cách sử dụng quyền truy cập Admin, bạn đồng ý tuân thủ các điều khoản sau:
      </p>

      <h3 className="text-xl font-semibold mt-4">1. Quyền hạn của Admin</h3>
      <p>
        Admin có quyền truy cập và quản lý dữ liệu người dùng, nội dung, bài kiểm tra, báo cáo và các chức năng quản trị hệ thống khác. Quyền hạn này chỉ được sử dụng trong phạm vi công việc và mục đích được cấp phép. Mọi hành vi vượt quá quyền hạn có thể dẫn đến chấm dứt quyền truy cập.
      </p>

      <h3 className="text-xl font-semibold mt-4">2. Trách nhiệm bảo mật</h3>
      <p>
        Admin có trách nhiệm bảo mật thông tin đăng nhập, mật khẩu và dữ liệu nhạy cảm của hệ thống. Không chia sẻ tài khoản, thông tin truy cập hoặc dữ liệu với bên thứ ba. Mọi vi phạm bảo mật sẽ chịu trách nhiệm pháp lý và có thể dẫn đến thu hồi quyền truy cập.
      </p>

      <h3 className="text-xl font-semibold mt-4">3. Trách nhiệm khi thao tác dữ liệu</h3>
      <p>
        Admin phải đảm bảo rằng tất cả các thao tác trên dữ liệu người dùng hoặc nội dung hệ thống đều chính xác, minh bạch và tuân thủ quy định của công ty. Sai sót hoặc thao tác trái phép có thể gây mất dữ liệu, và Admin sẽ chịu trách nhiệm theo quy định.
      </p>

      <h3 className="text-xl font-semibold mt-4">4. Hạn chế sử dụng</h3>
      <p>
        Toeic Master bảo lưu quyền hạn tạm ngừng hoặc chấm dứt quyền truy cập Admin nếu phát hiện vi phạm các điều khoản trong văn bản này. Chúng tôi có quyền tạm ngừng hệ thống vì lý do bảo trì hoặc sự cố kỹ thuật mà không cần thông báo trước.
      </p>

      <h3 className="text-xl font-semibold mt-4">5. Quyền thay đổi điều khoản</h3>
      <p>
        Toeic Master có quyền cập nhật, điều chỉnh hoặc thay đổi các điều khoản Admin bất kỳ lúc nào mà không cần thông báo trước. Việc tiếp tục sử dụng quyền Admin đồng nghĩa với việc chấp nhận các thay đổi này.
      </p>

      <h3 className="text-xl font-semibold mt-4">6. Quyền sở hữu trí tuệ</h3>
      <p>
        Mọi nội dung trong hệ thống Admin, bao gồm logo, tài liệu, báo cáo, phần mềm và dữ liệu, đều thuộc quyền sở hữu trí tuệ của Toeic Master. Admin không được sao chép, phân phối hoặc sử dụng trái phép bất kỳ nội dung nào mà không có sự đồng ý bằng văn bản.
      </p>

      <h3 className="text-xl font-semibold mt-4">7. Liên hệ</h3>
      <p>
        Nếu có câu hỏi về Điều khoản Admin này hoặc cần hỗ trợ, vui lòng liên hệ: <strong>support@toeicmaster.com</strong> hoặc gọi <strong>(123) 456-7890</strong>.
      </p>

      <p className="mt-4 mb-2">
        Cảm ơn bạn đã tuân thủ các điều khoản này và sử dụng quyền Admin của Toeic Master một cách an toàn và hiệu quả!
      </p>
    </div>
  );
};

export default AdminTerms;