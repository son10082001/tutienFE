export const translateError = (msg: string) => {
  const mapping: Record<string, string> = {
    'No users found with this email': 'Không tìm thấy người dùng nào có địa chỉ email này.',
    'Incorrect email or password': 'Email hoặc mật khẩu không chính xác.',
    'userId or password is incorrect': 'Tên đăng nhập hoặc mật khẩu không đúng.',
    'user already exists': 'Tài khoản đã tồn tại.',
    'User not found': 'Không tìm thấy tài khoản.',
    'Invalid refresh token': 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.',
    Unauthorized: 'Chưa đăng nhập.',
    Forbidden: 'Bạn không có quyền thực hiện thao tác này.',
    'Validation error': 'Dữ liệu không hợp lệ.',
    'Unknown server error': 'Lỗi máy chủ không xác định.',
  };

  return mapping[msg] || msg;
};
