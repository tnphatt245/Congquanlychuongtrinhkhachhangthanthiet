'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface KhachHang {
  maKH: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diemHienTai: number;
  maHang?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/loyalty/khach-hang-tong-quan');
      const data = res.data?.data || res.data;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách khách hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý khách hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Danh sách tổng quan tất cả hội viên và điểm hiện tại</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-64">
        <p className="text-xs font-semibold text-slate-400 uppercase">Tổng thành viên</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{customers.length}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4 pl-6">Mã KH</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4 pr-6 text-right">Điểm hiện tại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {customers.map((item) => (
                <tr key={item.maKH} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 pl-6 font-bold text-slate-700">KH-00{item.maKH}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.hoTen || 'Chưa cập nhật'}</td>
                  <td className="p-4 text-slate-600">{item.email}</td>
                  <td className="p-4 text-slate-600">{item.soDienThoai}</td>
                  <td className="p-4 pr-6 text-right font-bold text-blue-600">
                    {item.diemHienTai !== undefined ? item.diemHienTai.toLocaleString('vi-VN') : 0} điểm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}