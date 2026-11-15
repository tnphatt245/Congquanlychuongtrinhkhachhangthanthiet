'use client';

import { useEffect, useState } from 'react';
import { Gift, Plus, Trash2, Loader2, Award, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

interface QuaTang {
  id?: number;
  maQua?: number;
  tenQua: string;
  moTa?: string;
  diemDoi?: number;
  soDiem?: number;
  soLuongTon?: number;
}

export default function AdminGiftsPage() {
  const [danhSachQua, setDanhSachQua] = useState<QuaTang[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Thêm Quà Mới
  const [formData, setFormData] = useState({
    tenQua: '',
    moTa: '',
    diemDoi: 100,
    soLuongTon: 50,
  });

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await api.get('/loyalty/danh-muc-qua');
      const data = res.data?.data || res.data;
      setDanhSachQua(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải quà tặng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/loyalty/danh-muc-qua', {
        tenQua: formData.tenQua,
        moTa: formData.moTa,
        diemDoi: Number(formData.diemDoi),
        soLuongTon: Number(formData.soLuongTon),
      });

      setShowModal(false);
      setFormData({ tenQua: '', moTa: '', diemDoi: 100, soLuongTon: 50 });
      fetchGifts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thêm quà tặng thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGift = async (id: number) => {
    if (!confirm('Bạn có chắc muốn ngưng áp dụng món quà này?')) return;
    try {
      await api.delete(`/loyalty/danh-muc-qua/${id}`);
      fetchGifts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa món quà!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản lý kho quà tặng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Thêm mới, điều chỉnh số điểm đổi quà và số lượng tồn kho</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition flex items-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món quà mới</span>
        </button>
      </div>

      {/* Gift Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-blue-600">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        ) : danhSachQua.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Kho quà hiện tại đang trống.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã Quà</th>
                <th className="py-3.5 px-5">Tên Món Quà</th>
                <th className="py-3.5 px-5">Mô Tả</th>
                <th className="py-3.5 px-5">Điểm Đổi</th>
                <th className="py-3.5 px-5">Số Lượng Tồn</th>
                <th className="py-3.5 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {danhSachQua.map((item, index) => {
                const quaId = item.id || item.maQua || index;
                return (
                  <tr key={quaId} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-5 font-mono font-bold text-slate-700">Q-00{quaId}</td>
                    <td className="py-4 px-5 font-semibold text-slate-800">{item.tenQua}</td>
                    <td className="py-4 px-5 text-slate-500 max-w-xs truncate">{item.moTa || '---'}</td>
                    <td className="py-4 px-5 font-bold text-blue-600">
                      {item.diemDoi || item.soDiem || 0} điểm
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-700">{item.soLuongTon ?? 'Không giới hạn'}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDeleteGift(Number(quaId))}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Ngưng áp dụng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm Quà Mới */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Thêm quà tặng vào danh mục</h2>
            <form onSubmit={handleAddGift} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên món quà</label>
                <input
                  type="text"
                  required
                  value={formData.tenQua}
                  onChange={(e) => setFormData({ ...formData, tenQua: e.target.value })}
                  placeholder="VD: Voucher Giảm 50k"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  placeholder="Nhập mô tả món quà..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điểm cần đổi</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.diemDoi}
                    onChange={(e) => setFormData({ ...formData, diemDoi: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng tồn</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.soLuongTon}
                    onChange={(e) => setFormData({ ...formData, soLuongTon: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu món quà'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}