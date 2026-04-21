'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock3, Headset, MessageCircle, ShieldCheck, Ticket } from 'lucide-react';

const fakeFaqs = [
  {
    id: 'faq-1',
    question: 'Nạp tiền bao lâu thì vào tài khoản?',
    answer: 'Thời gian xử lý thường từ 10 giây đến 2 phút sau khi admin duyệt giao dịch.',
  },
  {
    id: 'faq-2',
    question: 'Mua vật phẩm xong chưa thấy trong game?',
    answer: 'Bạn vào đúng server đã chọn khi mua và kiểm tra thư trong game. Nếu vẫn chưa có, gửi mã đơn hàng cho CSKH.',
  },
  {
    id: 'faq-3',
    question: 'Gift code báo đã dùng là sao?',
    answer: 'Mỗi nhân vật chỉ nhận 1 lần cho cùng một gift code. Hãy kiểm tra đúng server và đúng nhân vật.',
  },
];

const fakeTickets = [
  { id: 'TK-2401', title: 'Không nhận được vật phẩm sau khi mua', status: 'Đang xử lý', updatedAt: '10:45 20/04/2026' },
  { id: 'TK-2398', title: 'Sai server khi đổi phiếu', status: 'Đã phản hồi', updatedAt: '09:10 19/04/2026' },
  { id: 'TK-2391', title: 'Lỗi đăng nhập launcher game', status: 'Đã đóng', updatedAt: '18:22 18/04/2026' },
];

export default function SupportPage() {
  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-6xl space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-white'>Chăm sóc khách hàng</h1>
          <p className='mt-2 text-sm text-white/55'>Dữ liệu demo để duyệt UI. Tính năng gửi ticket thật sẽ nối API sau.</p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <Headset size={16} />
              <p className='text-sm font-semibold'>Hỗ trợ trực tuyến</p>
            </div>
            <p className='text-xs text-white/60'>08:00 - 23:00 mỗi ngày</p>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <Clock3 size={16} />
              <p className='text-sm font-semibold'>Thời gian phản hồi</p>
            </div>
            <p className='text-xs text-white/60'>Trung bình dưới 15 phút</p>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <ShieldCheck size={16} />
              <p className='text-sm font-semibold'>Bảo mật thông tin</p>
            </div>
            <p className='text-xs text-white/60'>Mọi trao đổi được lưu và bảo vệ</p>
          </div>
        </div>

        <div className='grid gap-5 lg:grid-cols-[1.2fr_1fr]'>
          <section className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='flex items-center gap-2 text-white'>
              <Ticket size={16} className='text-[#44C8F3]' />
              <h2 className='font-semibold'>Tạo yêu cầu hỗ trợ (Demo UI)</h2>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <Input placeholder='Tên nhân vật' className='border-white/10 bg-black/30 text-white' />
              <Input placeholder='Server' className='border-white/10 bg-black/30 text-white' />
            </div>
            <Input placeholder='Tiêu đề vấn đề' className='border-white/10 bg-black/30 text-white' />
            <textarea
              placeholder='Mô tả chi tiết vấn đề của bạn...'
              className='min-h-[120px] w-full rounded-md border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:ring-1 focus:ring-[#44C8F3]/50'
            />
            <div className='flex items-center justify-between'>
              <p className='text-xs text-white/45'>Form demo: chưa gửi dữ liệu thật lên server.</p>
              <Button className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
                <MessageCircle size={14} className='mr-1' />
                Gửi yêu cầu
              </Button>
            </div>
          </section>

          <section className='space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
            <h2 className='font-semibold text-white'>Yêu cầu gần đây (Fake data)</h2>
            {fakeTickets.map((ticket) => (
              <div key={ticket.id} className='rounded-lg border border-white/10 bg-black/30 p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='font-mono text-xs text-white/45'>{ticket.id}</p>
                  <p className='text-xs text-[#44C8F3]'>{ticket.status}</p>
                </div>
                <p className='mt-1 text-sm font-medium text-white'>{ticket.title}</p>
                <p className='mt-1 text-xs text-white/45'>Cập nhật: {ticket.updatedAt}</p>
              </div>
            ))}
          </section>
        </div>

        <section className='space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h2 className='font-semibold text-white'>Câu hỏi thường gặp (Fake data)</h2>
          {fakeFaqs.map((faq) => (
            <div key={faq.id} className='rounded-lg border border-white/10 bg-black/30 p-3'>
              <p className='text-sm font-semibold text-white'>{faq.question}</p>
              <p className='mt-1 text-sm text-white/65'>{faq.answer}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
