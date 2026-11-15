'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Gift,
  History,
  MessageSquare,
  ChevronRight,
  Loader2,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Award,
  Clock,
  AlertTriangle,
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

// Hàm tính toán Hạng thành viên và Tiến trình tự động theo số điểm
function calculateTierInfo(points: number, dbTierName?: string) {
  if (dbTierName) {
    return {
      tierName: dbTierName,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      nextTierName: 'Hạng cao hơn',
      targetPoints: points + 500,
      percentage: 100,
    };
  }

  if (points >= 5000) {
    return {
      tierName: 'Hạng Bạch Kim',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      nextTierName: 'Tối đa',
      targetPoints: 5000,
      percentage: 100,
    };
  }
  if (points >= 2000) {
    return {
      tierName: 'Hạng Vàng',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      nextTierName: 'Hạng Bạch Kim',
      targetPoints: 5000,
      percentage: Math.min(Math.round((points / 5000) * 100), 100),
    };
  }
  if (points >= 500) {
    return {
      tierName: 'Hạng Bạc',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      nextTierName: 'Hạng Vàng',
      targetPoints: 2000,
      percentage: Math.min(Math.round((points / 2000) * 100), 100),
    };
  }
  return {
    tierName: 'Hạng Đồng',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    nextTierName: 'Hạng Bạc',
    targetPoints: 500,
    percentage: Math.min(Math.round((points / 500) * 100), 100),
  };
}

export default function HomePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [danhMucQua, setDanhMucQua] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Điểm & Hạng từ CSDL
  const [diemHienTai, setDiemHienTai] = useState<number>(0);
  const [hangFromDb, setHangFromDb] = useState<string | undefined>(undefined);
  const [diemSapHetHan, setDiemSapHetHan] = useState<number>(0);

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
        // 1. Tải danh mục quà
        const resQua = await api.get('/loyalty/danh-muc-qua').catch(() => ({ data: [] }));
        const dataQua = resQua.data?.data || resQua.data;
        if (Array.isArray(dataQua)) {
          setDanhMucQua(dataQua);
        }

        // 2. Tải thông tin Khách hàng (Điểm + Hạng)
        let userPoints = 0;
        let dbHang: string | undefined = undefined;
        let expPoints = 0;

        if (maKH) {
          try {
            const resKH = await api.get(`/loyalty/khach-hang/${maKH}`);
            const khData = resKH.data?.data || resKH.data;
            userPoints = khData?.diemHienTai ?? khData?.soDiem ?? 0;
            dbHang = khData?.hangThanhVien || khData?.tenHang;
            expPoints = khData?.diemSapHetHan ?? (userPoints > 0 ? Math.min(200, userPoints) : 0);
          } catch {
            // Fallback nếu API cá nhân bị 404
            const resList = await api.get('/loyalty/khach-hang-tong-quan').catch(() => ({ data: [] }));
            const listKH = resList.data?.data || resList.data || [];
            const currentKH = listKH.find(
              (item: any) => item.id == maKH || item.maKH == maKH || item.email === decoded?.email
            );

            if (currentKH) {
              userPoints = currentKH.diemHienTai ?? currentKH.soDiem ?? 0;
              dbHang = currentKH.hangThanhVien || currentKH.tenHang;
              expPoints = currentKH.diemSapHetHan ?? (userPoints > 0 ? Math.min(200, userPoints) : 0);
            }
          }
        }

        setDiemHienTai(userPoints);
        setHangFromDb(dbHang);
        setDiemSapHetHan(expPoints);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu từ MySQL:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        Đang tải thông tin điểm và hạng thành viên...
      </div>
    );
  }

  const isAdmin =
    userInfo?.role === 'ADMIN' ||
    userInfo?.maVaiTro === 'ADMIN' ||
    userInfo?.role === 'admin';

  // Tính toán thông tin hạng hiện tại
  const tierInfo = calculateTierInfo(diemHienTai, hangFromDb);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-12">
      {/* Navbar Header */}
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
            <button onClick={() => router.push('/')} className="text-blue-600 font-semibold">
              Tổng quan
            </button>
            <button onClick={() => router.push('/rewards')} className="hover:text-slate-900 transition">
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

      {/* Main Area */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Khối Điểm & Hạng Thành Viên Tự Động */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                Số điểm tích lũy khả dụng
              </span>

              {/* Dynamic Hạng Badge */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tierInfo.badgeColor}`}>
                <Award className="w-3 h-3" />
                {tierInfo.tierName}
              </span>
            </div>

            {/* Điểm số nhảy thực tế */}
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {diemHienTai.toLocaleString('vi-VN')}
              </span>
              <span className="text-sm font-bold text-blue-600">điểm</span>
            </div>

            {/* Tiến trình nâng hạng động */}
            {tierInfo.percentage < 100 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Tiến trình nâng {tierInfo.nextTierName}</span>
                  <span>
                    {diemHienTai.toLocaleString('vi-VN')} / {tierInfo.targetPoints.toLocaleString('vi-VN')} điểm
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tierInfo.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Cần thêm <span className="font-bold text-slate-700">{(tierInfo.targetPoints - diemHienTai).toLocaleString('vi-VN')} điểm</span> để thăng hạng tiếp theo.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 font-medium">
                🎉 Bạn đang sở hữu mức hạng thành viên cao nhất!
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Kho quà hiện có</p>
              <p className="text-[11px] text-slate-500">
                Có <span className="font-bold text-slate-800">{danhMucQua.length} món quà</span> sẵn sàng đổi ngay.
              </p>
            </div>

            <button
              onClick={() => router.push('/rewards')}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Đổi quà ngay</span>
            </button>
          </div>
        </div>

        {/* WIDGET CẢNH BÁO ĐIỂM SẮP HẾT HẠN (HD04) */}
        {diemSapHetHan > 0 && (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition hover:bg-amber-50">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-amber-100/80 text-amber-700 rounded-xl flex-shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Thông báo thời hạn điểm</span>
                </p>
                <p className="text-xs text-amber-950 font-medium">
                  Bạn có <span className="font-extrabold text-amber-700">{diemSapHetHan.toLocaleString('vi-VN')} điểm</span> dự kiến sẽ hết hạn vào ngày <span className="font-bold">31/12/2026</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/rewards')}
              className="w-full sm:w-auto text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap text-center"
            >
              Đổi quà ngay
            </button>
          </div>
        )}

        {/* Dynamic Shortcut Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => router.push('/rewards')}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Đổi quà tặng</p>
                <p className="text-[11px] text-slate-400">{danhMucQua.length} món quà</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => router.push('/history')}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Kho E-Voucher</p>
                <p className="text-[11px] text-slate-400">Lịch sử đổi quà</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => router.push('/support')}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Hỗ trợ</p>
                <p className="text-[11px] text-slate-400">Trung tâm khiếu nại</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Danh Mục Quà Tặng Nổi Bật */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Quà tặng ưu đãi dành cho bạn</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sử dụng điểm tích lũy đổi quà ngay lập tức</p>
            </div>
            <button
              onClick={() => router.push('/rewards')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {danhMucQua.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Đang tải danh mục quà tặng...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {danhMucQua.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id || item.maQua || idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      Q{idx + 1}
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{item.tenQua}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.moTa || 'Voucher ưu đãi hấp dẫn.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-bold text-blue-600">
                      {item.diemDoi || item.soDiem || 0} điểm
                    </span>
                    <button
                      onClick={() => router.push('/rewards')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-blue-500 text-slate-700 rounded-lg transition"
                    >
                      Đổi ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}