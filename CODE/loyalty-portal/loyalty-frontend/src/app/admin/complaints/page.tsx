'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import api from '@/lib/axios';

interface KhieuNai {
  id?: number;
  maKhieuNai?: number | string;
  noiDung: string;
  trangThai: string; // 'CHO_XU_LY', 'DA_XU_LY', 'TU_CHOI', 'APPROVED', 'REJECTED', 'PENDING'
  ngayTao?: string;
  createdAt?: string;
  khachHang?: {
    hoTen?: string;
    email?: string;
  };
}

export default function AdminComplaintsPage() {
  const [danhSachKhieuNai, setDanhSachKhieuNai] = useState<KhieuNai[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/loyalty/khieu-nai');
      const data = res.data?.data || res.data;
      setDanhSachKhieuNai(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách khiếu nại:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleXuLyKhieuNai = async (id: number | string, trangThaiMoi: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await api.patch(`/loyalty/khieu-nai/${id}/xu-ly`, {
        trangThai: trangThaiMoi,
      });
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác không thành công');
    } finally {
      setProcessingId(null);
    }
  };

  // Thống kê chỉ số
  const pendingCount = danhSachKhieuNai.filter(
    (item) => item.trangThai === 'CHO_XU_LY' || item.trangThai === 'PENDING'
  ).length;

  const approvedCount = danhSachKhieuNai.filter(
    (item) => item.trangThai === 'APPROVED' || item.trangThai === 'DA_XU_LY'
  ).length;

  const rejectedCount = danhSachKhieuNai.filter(
    (item) => item.trangThai === 'REJECTED' || item.trangThai === 'TU_CHOI'
  ).length;

  // Lọc danh sách theo Tab & Từ khóa
  const filteredList = danhSachKhieuNai.filter((item) => {
    const isPending = item.trangThai === 'CHO_XU_LY' || item.trangThai === 'PENDING';
    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'DONE' && isPending) return false;

    if (searchQuery) {
      const name = item.khachHang?.hoTen || item.khachHang?.email || '';
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.noiDung.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Xử lý khiếu nại hội viên</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tiếp nhận phản hồi và thẩm định yêu cầu cộng/trừ điểm lại từ khách hàng
        </p>
      </div>

      {/* 3 Thẻ Chỉ Số Hiện Đại */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Yêu cầu chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã chấp thuận</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã từ chối</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Thanh Điều Khiển & Bộ Lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({danhSachKhieuNai.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Chờ duyệt</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DONE')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'DONE'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã hoàn tất
          </button>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Lọc theo tên hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Bảng Dữ Liệu Tối Giản */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center text-blue-600">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Không tìm thấy yêu cầu khiếu nại nào.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã Yêu Cầu</th>
                <th className="py-3.5 px-5">Khách Hàng</th>
                <th className="py-3.5 px-5">Nội Dung Phản Hồi</th>
                <th className="py-3.5 px-5">Ngày Gửi</th>
                <th className="py-3.5 px-5">Trạng Thái</th>
                <th className="py-3.5 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredList.map((item, index) => {
                const itemId = item.id || item.maKhieuNai || index;
                const ngayTaoFormatted = item.ngayTao || item.createdAt;
                const isPending = item.trangThai === 'CHO_XU_LY' || item.trangThai === 'PENDING';
                const isApproved = item.trangThai === 'APPROVED' || item.trangThai === 'DA_XU_LY';

                return (
                  <tr key={itemId} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-5 font-mono font-bold text-blue-600">
                      KN-#{itemId}
                    </td>

                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-800">
                        {item.khachHang?.hoTen || 'Nguyễn Văn A'}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.khachHang?.email || 'khachhang@gmail.com'}</p>
                    </td>

                    <td className="py-4 px-5 text-slate-600 max-w-xs truncate" title={item.noiDung}>
                      {item.noiDung}
                    </td>

                    <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                      {ngayTaoFormatted ? new Date(ngayTaoFormatted).toLocaleDateString('vi-VN') : '16/10/2026'}
                    </td>

                    <td className="py-4 px-5">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Chờ xử lý
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Đã chấp thuận
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Đã từ chối
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleXuLyKhieuNai(itemId, 'APPROVED')}
                            disabled={processingId === itemId}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center space-x-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => handleXuLyKhieuNai(itemId, 'REJECTED')}
                            disabled={processingId === itemId}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}