'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import api from '@/lib/axios';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function SupportPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [loaiSuCo, setLoaiSuCo] = useState('LOI_CONG_DIEM');
  const [noiDung, setNoiDung] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Danh sách khiếu nại đã gửi
  const [danhSachKhieuNai, setDanhSachKhieuNai] = useState<any[]>([]);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const decoded = decodeJwt(token);
      setUserInfo(decoded);

      const maKH = decoded?.sub || decoded?.maKH || decoded?.id;

      try {
        const res = await api.get('/loyalty/khieu-nai').catch(() => ({ data: [] }));
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          const myTickets = data.filter(
            (item: any) => item.maKH == maKH || item.maKhachHang == maKH || item.email === decoded?.email
          );
          setDanhSachKhieuNai(myTickets.length > 0 ? myTickets : data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách khiếu nại:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDung.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung phản hồi / khiếu nại.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const maKH = userInfo?.sub || userInfo?.maKH || userInfo?.id;

    try {
      const payload = {
        maKH: maKH ? Number(maKH) : undefined,
        loaiSuCo,
        noiDung,
        ngayTao: new Date().toISOString(),
        trangThai: 'CHO_XU_LY',
      };

      const res = await api.post('/loyalty/khieu-nai', payload);
      const newTicket = res.data?.data || res.data || {
        id: Date.now(),
        loaiSuCo,
        noiDung,
        ngayTao: new Date().toLocaleDateString('vi-VN'),
        trangThai: 'CHO_XU_LY',
      };

      setDanhSachKhieuNai((prev) => [newTicket, ...prev]);
      setNoiDung('');
      setMessage({ type: 'success', text: 'Gửi yêu cầu hỗ trợ thành công! Ban quản trị sẽ phản hồi sớm nhất.' });
    } catch (err: any) {
      console.error('Lỗi khi gửi khiếu nại:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể gửi khiếu nại. Vui lòng thử lại sau.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        Đang tải trung tâm hỗ trợ...
      </div>
    );
  }

  const isAdmin =
    userInfo?.role === 'ADMIN' ||
    userInfo?.maVaiTro === 'ADMIN' ||
    userInfo?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 h-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-8">
          <div
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              Cardify Rewards
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
            <button onClick={() => router.push('/')} className="hover:text-slate-900 transition">
              Tổng quan
            </button>
            <button onClick={() => router.push('/rewards')} className="hover:text-slate-900 transition">
              Đổi quà
            </button>
            <button onClick={() => router.push('/history')} className="hover:text-slate-900 transition">
              Kho E-Voucher
            </button>
            <button onClick={() => router.push('/support')} className="text-blue-600 font-semibold">
              Hỗ trợ
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition"
            >
              Trang Quản Trị
            </button>
          )}

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userInfo?.email || 'Hội viên'}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Trung tâm Hỗ trợ & Khiếu nại</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gửi phản hồi sự cố tích điểm, đổi voucher hoặc nhờ giải đáp thắc mắc.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trở về trang chủ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form gửi khiếu nại */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Gửi phản hồi mới</h2>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vấn đề gặp phải
                </label>
                <select
                  value={loaiSuCo}
                  onChange={(e) => setLoaiSuCo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="LOI_CONG_DIEM">Sự cố tích điểm đơn hàng</option>
                  <option value="LOI_DOI_QUA">Lỗi khi đổi quà / E-Voucher</option>
                  <option value="LOI_TAI_KHOAN">Vấn đề tài khoản & Hạng hội viên</option>
                  <option value="KHAC">Góp ý khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={4}
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  placeholder="Mô tả cụ thể mã đơn hàng, số điểm bị thiếu hoặc mã voucher không sử dụng được..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition resize-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi khiếu nại ngay</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Hướng dẫn */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Lưu ý gửi hỗ trợ</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>Cung cấp rõ mã đơn hàng khi báo thiếu điểm.</li>
                <li>Phản hồi sẽ được xử lý trong vòng 24 giờ làm việc.</li>
                <li>Kiểm tra trạng thái xử lý ở danh sách bên dưới.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Danh sách các yêu cầu đã gửi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Lịch sử yêu cầu hỗ trợ của bạn
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {danhSachKhieuNai.length} yêu cầu
            </span>
          </div>

          {danhSachKhieuNai.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Bạn chưa gửi yêu cầu hỗ trợ nào.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {danhSachKhieuNai.map((item, idx) => (
                <div key={item.id || idx} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {item.loaiSuCo === 'LOI_CONG_DIEM'
                        ? 'Sự cố tích điểm'
                        : item.loaiSuCo === 'LOI_DOI_QUA'
                        ? 'Lỗi đổi quà'
                        : 'Hỗ trợ chung'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.trangThai === 'DA_XU_LY' || item.trangThai === 'DA_GIAI_QUYET'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.trangThai === 'DA_XU_LY' || item.trangThai === 'DA_GIAI_QUYET'
                        ? 'Đã giải quyết'
                        : 'Đang xử lý'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{item.noiDung}</p>

                  <p className="text-[10px] text-slate-400">
                    Ngày gửi: {item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : 'Mới đây'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}