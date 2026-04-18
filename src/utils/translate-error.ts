export const translateError = (msg: string) => {
  const mapping: Record<string, string> = {
    'No users found with this email': 'Không tìm thấy người dùng nào có địa chỉ email này.',
    'Incorrect email or password': 'Email hoặc mật khẩu không chính xác.',
  };

  return mapping[msg] || msg;
};
