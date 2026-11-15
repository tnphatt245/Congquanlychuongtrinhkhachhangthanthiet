'use client';

import { useEffect, useState } from 'react';
import { History, Sliders, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form điều chỉnh điểm
  const [maKH, setMaKH] = useState('');
  const [soDiem, setSoDiem] = useState<number>(100);
  const [lyDo, setLyDo] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/loyalty/audit-logs');
      const data = res.data?.data || res.data;
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải Audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg(null);

    try {
      await api.post('/loyalty/dieu-chinh-diem', {
        maKH: Number(maKH),
        soDiem: Number(soDiem),
        lyDo,
      });

      setAlertMsg({ type: 'success', text: `Điều chỉnh ${soDiem} điểm cho KH-${maKH} thành công!` });
      setMaKH('');
      setLyDo('');
      fetchAuditLogs();
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Điều chỉnh điểm thất bại. Vui lòng kiểm tra Mã KH!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Điều chỉnh điểm & Nhật ký Audit</h1>
        <p className="text-xs text-slate-500 mt-0.5">Thực hiện cộng/trừ điểm thủ công và truy xuất lịch sử thao tác hệ thống</p>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Form Điều Chỉnh Điểm */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Tạo yêu cầu điều chỉnh điểm</span>
        </h2>

        <form onSubmit={handleAdjustPoints} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã KH (ID)</label>
            <input
              type="number"
              required
              value={maKH}
              onChange={(e) => setMaKH(e.target.value)}
              placeholder="VD: 1"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điểm (Cộng + / Trừ -)
            </label>
            <input
              type="number"
              required
              value={soDiem}
              onChange={(e) => setSoDiem(Number(e.target.value))}
              placeholder="VD: 500 hoặc -200"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do điều chỉnh</label>
            <input
              type="text"
              required
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              placeholder="VD: Bù điểm sự cố hệ thống"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50 flex items-center justify-center space-x-1"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Thực hiện điều chỉnh</span>
          </button>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lịch sử Nhật ký Audit (Audit Logs)
          </h2>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center text-blue-600">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Chưa có ghi nhận Audit Log nào.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã Log</th>
                <th className="py-3.5 px-5">Thao Tác</th>
                <th className="py-3.5 px-5">Chi Tiết / Lý Do</th>
                <th className="py-3.5 px-5">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((item, index) => {
                const logId = item.id || item.maLog || index;
                return (
                  <tr key={logId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-700">LOG-00{logId}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{item.hanhDong || item.hanhDongThaoTac || 'Điều chỉnh điểm'}</td>
                    <td className="py-3.5 px-5 text-slate-600">{item.moTa || item.lyDo || '---'}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">
                      {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : 'Vừa xong'}
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