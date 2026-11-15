'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Gift,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Wallet,
  PackageX,
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

export default function RewardsPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [danhMucQua, setDanhMucQua] = useState<any[]>([]);
  const [diemHienTai, setDiemHienTai] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCatalogAndPoints = async (decodedUser: any) => {
    const tokenSub = decodedUser?.sub || decodedUser?.maKH || decodedUser?.id;

    try {
      // 1. Tải danh mục quà
      const resQua = await api.get('/loyalty/danh-muc-qua').catch(() => ({ data: [] }));
      const dataQua = resQua.data?.data || resQua.data;
      if (Array.isArray(dataQua)) {
        setDanhMucQua(dataQua);
      }

      // 2. Lấy điểm khách hàng từ CSDL
      let points = 0;
      try {
        const resKH = await api.get(`/loyalty/khach-hang/${tokenSub}`);
        const khData = resKH.data?.data || resKH.data;
        if (khData) {
          points = khData.diemHienTai ?? khData.soDiem ?? 0;
        }
      } catch {
        const resList = await api.get('/loyalty/khach-hang-tong-quan').catch(() => ({ data: [] }));
        const list = resList.data?.data || resList.data || [];
        const currentKH = list.find(
          (item: any) =>
            item.id == tokenSub ||
            item.maKH == tokenSub ||
            item.email === decodedUser?.email
        );
        if (currentKH) {
          points = currentKH.diemHienTai ?? currentKH.soDiem ?? 0;
        }
      }

      setDiemHienTai(points);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu CSDL:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const decoded = decodeJwt(token);
      setUserInfo(decoded);

      await fetchCatalogAndPoints(decoded);
      setLoading(false);
    };

    initData();
  }, [router]);

  const handleDoiQua = async (item: any) => {
    setMessage(null);

    const targetMaQua = Number(item.maQua || item.id || item.ma_qua);

    if (!targetMaQua || isNaN(targetMaQua)) {
      setMessage({
        type: 'error',
        text: 'Mã quà tặng không hợp lệ.',
      });
      return;
    }

    const diemCan = Number(item.diemDoi || item.soDiem || 0);
    if (diemHienTai < diemCan) {
      setMessage({
        type: 'error',
        text: `Bạn cần tích lũy thêm ${(diemCan - diemHienTai).toLocaleString('vi-VN')} điểm nữa để đổi phần quà này.`,
      });
      return;
    }

    setProcessingId(targetMaQua);

    // Payload gửi NestJS DTO (chỉ nhận thuộc tính maQua)
    const payload = {
      maQua: targetMaQua,
    };

    try {
      await api.post('/loyalty/doi-qua', payload);

      setMessage({
        type: 'success',
        text: `Đổi thành công "${item.tenQua}"! CSDL MySQL đã trừ điểm và cấp E-Voucher.`,
      });

      if (userInfo) {
        await fetchCatalogAndPoints(userInfo);
      }
    } catch (err: any) {
      console.error('Lỗi API NestJS /loyalty/doi-qua:', err.response?.data || err);

      const backendErr = err.response?.data?.message;
      let errorText = 'Không thể thực hiện giao dịch đổi quà.';

      if (Array.isArray(backendErr)) {
        errorText = backendErr.join(', ');
      } else if (typeof backendErr === 'string') {
        errorText = backendErr;
      }

      setMessage({
        type: 'error',
        text: `Backend báo lỗi: ${errorText}`,
      });
    } finally {
      setProcessingId(null);
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
        Đang đồng bộ dữ liệu CSDL...
      </div>
    );
  }

  const isAdmin =
    userInfo?.role === 'ADMIN' ||
    userInfo?.maVaiTro === 'ADMIN' ||
    userInfo?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-12">
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
            <button onClick={() => router.push('/rewards')} className="text-blue-600 font-semibold">
              Đổi quà
            </button>
            <button onClick={() => router.push('/history')} className="hover:text-slate-900 transition">
              Kho E-Voucher
            </button>
            <button onClick={() => router.push('/support')} className="hover:text-slate-900 transition">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-bold text-slate-900">Danh Mục Quà Tặng</h1>
            </div>
            <p className="text-xs text-slate-500 pl-7">
              Dùng điểm tích lũy đổi các E-Voucher từ CSDL MySQL.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 self-start sm:self-auto">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600 font-medium">Điểm hiện có:</span>
            <span className="text-sm font-extrabold text-blue-600 font-mono">
              {diemHienTai.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {danhMucQua.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <PackageX className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Chưa có quà trong CSDL</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {danhMucQua.map((item, idx) => {
              const itemId = Number(item.maQua || item.id || item.ma_qua);
              const diemCan = Number(item.diemDoi || item.soDiem || 0);

              return (
                <div
                  key={itemId || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.tenQua}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.moTa || 'Voucher đổi điểm ưu đãi từ CSDL.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Giá đổi</span>
                      <span className="text-sm font-extrabold text-blue-600 font-mono">
                        {diemCan.toLocaleString('vi-VN')} điểm
                      </span>
                    </div>

                    <button
                      onClick={() => handleDoiQua(item)}
                      disabled={processingId === itemId}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs active:scale-95"
                    >
                      {processingId === itemId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang cập nhật CSDL...</span>
                        </>
                      ) : (
                        <span>Đổi quà ngay</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}