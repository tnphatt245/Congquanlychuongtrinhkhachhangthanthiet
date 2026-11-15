'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Gift,
  ShoppingBag,
  Loader2,
  ShieldAlert,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import api from '@/lib/axios';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    tongKhachHang: 0,
    tongQua: 0,
    tongLuotDoiQua: 0,
    yeuCauChoDuyet: 0,
  });
  const [lichSuDoiQua, setLichSuDoiQua] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [resKH, resQua, resThongKe, resYeuCau] = await Promise.all([
        api.get('/loyalty/khach-hang-tong-quan').catch(() => ({ data: [] })),
        api.get('/loyalty/danh-muc-qua').catch(() => ({ data: [] })),
        api.get('/loyalty/thong-ke-doi-qua').catch(() => ({ data: [] })),
        api.get('/loyalty/dieu-chinh-diem/danh-sach').catch(() => ({ data: [] })),
      ]);

      const dataKH = resKH.data?.data || resKH.data || [];
      const dataQua = resQua.data?.data || resQua.data || [];
      const dataThongKe = resThongKe.data?.data || resThongKe.data || [];
      const dataYeuCau = resYeuCau.data?.data || resYeuCau.data || [];

      const choDuyetCount = Array.isArray(dataYeuCau)
        ? dataYeuCau.filter((item: any) => item.trangThai === 'CHO_DUYET').length
        : 0;

      setStats({
        tongKhachHang: Array.isArray(dataKH) ? dataKH.length : 0,
        tongQua: Array.isArray(dataQua) ? dataQua.length : 0,
        tongLuotDoiQua: Array.isArray(dataThongKe) ? dataThongKe.length : 0,
        yeuCauChoDuyet: choDuyetCount,
      });

      setLichSuDoiQua(Array.isArray(dataThongKe) ? dataThongKe.slice(0, 5) : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chương trình chăm sóc khách hàng & điểm thưởng Cardify
          </p>
        </div>

        {stats.yeuCauChoDuyet > 0 && (
          <button
            onClick={() => router.push('/admin/approval')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{stats.yeuCauChoDuyet} phiếu chờ duyệt điểm</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng hội viên</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.tongKhachHang.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Món quà khả dụng</span>
            <Gift className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.tongQua}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Lượt đổi quà</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.tongLuotDoiQua.toLocaleString('vi-VN')}
          </p>
        </div>

        <div
          onClick={() => router.push('/admin/approval')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Chờ phê duyệt</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.yeuCauChoDuyet}
          </p>
        </div>
      </div>

      {/* Navigational Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => router.push('/admin/approval')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                HD15 - HD16
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
              Phê duyệt điều chỉnh điểm
            </h3>
            <p className="text-xs text-slate-500">
              Xử lý phiếu yêu cầu cộng/trừ điểm hội viên từ nhân viên
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
        </div>

        <div
          onClick={() => router.push('/admin/reports')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                HD17
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
              Audit Log & Báo cáo
            </h3>
            <p className="text-xs text-slate-500">
              Tra cứu nhật ký thao tác hệ thống và xuất dữ liệu Excel
            </p>
          </div>
          <FileSpreadsheet className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Giao dịch đổi quà gần đây
          </h2>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : lichSuDoiQua.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            Chưa ghi nhận giao dịch đổi quà nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-2.5">Tên quà tặng</th>
                  <th className="px-4 py-2.5">Hội viên</th>
                  <th className="px-4 py-2.5">Mã E-Voucher</th>
                  <th className="px-4 py-2.5 text-right">Ngày đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lichSuDoiQua.map((item, index) => {
                  const itemId = item.id || item.maDoiQua || index;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.quaTang?.tenQua || item.tenQua || 'Đổi quà tặng'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.khachHang?.email || item.khachHang?.hoTen || `Mã KH #${item.maKH}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {item.maCode || item.maVoucher || 'EVOUCHER'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {item.ngayDoi
                          ? new Date(item.ngayDoi).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}