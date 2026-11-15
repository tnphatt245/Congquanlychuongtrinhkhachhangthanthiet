'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ApprovalPage() {
  const router = useRouter();
  const [danhSachPhieu, setDanhSachPhieu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form tạo yêu cầu (HD15)
  const [maKH, setMaKH] = useState('');
  const [soDiem, setSoDiem] = useState<number>(100);
  const [lyDo, setLyDo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDanhSachYeuCau();
  }, []);

  const fetchDanhSachYeuCau = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loyalty/dieu-chinh-diem/danh-sach');
      const data = res.data?.data || res.data;
      setDanhSachPhieu(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách yêu cầu:', err);
    } finally {
      setLoading(false);
    }
  };

  // HD15: Gửi Yêu cầu
  const handleTaoYeuCau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maKH || !lyDo) {
      alert('Vui lòng điền đầy đủ Mã KH và Lý do điều chỉnh');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/loyalty/dieu-chinh-diem/yeu-cau', {
        maKH: Number(maKH),
        soDiem: Number(soDiem),
        lyDo,
      });
      alert('Đã gửi yêu cầu phê duyệt thành công!');
      setMaKH('');
      setLyDo('');
      fetchDanhSachYeuCau();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi tạo yêu cầu điều chỉnh');
    } finally {
      setIsSubmitting(false);
    }
  };

  // HD16: Phê duyệt hoặc Từ chối (dùng maYC)
  const handlePheDuyet = async (maYC: number, trangThai: 'DA_DUYET' | 'TU_CHOI') => {
    const actionName = trangThai === 'DA_DUYET' ? 'Phê duyệt' : 'Từ chối';
    if (!confirm(`Bạn có chắc chắn muốn ${actionName} yêu cầu #${maYC}?`)) return;

    try {
      await api.patch(`/loyalty/dieu-chinh-diem/${maYC}/phe-duyet`, {
        trangThai,
        lyDoTuChoi: trangThai === 'TU_CHOI' ? 'Admin từ chối yêu cầu' : null,
      });
      alert(`Đã ${actionName} thành công!`);
      fetchDanhSachYeuCau();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xử lý phê duyệt');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">
            Quản Lý Phê Duyệt Điều Chỉnh Điểm (HD15 - HD16)
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KHỐI HD15: TẠO YÊU CẦU */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            HD15: Tạo phiếu yêu cầu điều chỉnh
          </h2>

          <form onSubmit={handleTaoYeuCau} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Mã Khách Hàng</label>
              <input
                type="number"
                value={maKH}
                onChange={(e) => setMaKH(e.target.value)}
                placeholder="VD: 1"
                className="w-full mt-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Số điểm điều chỉnh (+ cộng / - trừ)
              </label>
              <input
                type="number"
                value={soDiem}
                onChange={(e) => setSoDiem(Number(e.target.value))}
                placeholder="VD: 500 hoặc -200"
                className="w-full mt-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Lý do điều chỉnh</label>
              <textarea
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                rows={3}
                className="w-full mt-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu phê duyệt'}
            </button>
          </form>
        </div>

        {/* KHỐI HD16: DANH SÁCH YÊU CẦU */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            HD16: Danh sách yêu cầu điều chỉnh
          </h2>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-8">Đang tải danh sách yêu cầu...</p>
          ) : danhSachPhieu.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8 border rounded-xl bg-slate-50">
              Hiện tại không có yêu cầu nào đang chờ phê duyệt.
            </p>
          ) : (
            <div className="space-y-3">
              {danhSachPhieu.map((phieu) => {
                const maYC = phieu.maYC || phieu.id;
                const diem = phieu.soDiem ?? phieu.soDiemDieuChinh ?? 0;

                return (
                  <div
                    key={maYC}
                    className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">
                          Yêu cầu #{maYC} - Mã KH: {phieu.maKH}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            diem >= 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {diem >= 0 ? `+${diem}` : diem} điểm
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Lý do: {phieu.lyDo}</p>
                      <p className="text-[10px] text-slate-400">
                        NV Tạo #{phieu.maNV_Tao || 1} -{' '}
                        {phieu.ngayTao ? new Date(phieu.ngayTao).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </p>
                    </div>

                    {phieu.trangThai === 'CHO_DUYET' ? (
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <button
                          onClick={() => handlePheDuyet(maYC, 'DA_DUYET')}
                          className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => handlePheDuyet(maYC, 'TU_CHOI')}
                          className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          phieu.trangThai === 'DA_DUYET'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {phieu.trangThai === 'DA_DUYET' ? 'Đã duyệt' : 'Đã từ chối'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}