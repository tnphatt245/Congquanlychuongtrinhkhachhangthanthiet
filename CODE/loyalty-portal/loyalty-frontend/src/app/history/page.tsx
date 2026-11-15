'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Ticket, Award, Loader2, Copy, Check, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/axios';

export default function HistoryPage() {
  const router = useRouter();
  const [lichSuDoiQua, setLichSuDoiQua] = useState<any[]>([]);
  const [lichSuDiem, setLichSuDiem] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'voucher' | 'diem'>('voucher');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Gọi API lấy lịch sử đổi quà & danh sách E-Voucher
      const resVoucher = await api.get('/loyalty/doi-qua/lich-su');
      const dataVoucher = resVoucher.data?.data || resVoucher.data;
      setLichSuDoiQua(Array.isArray(dataVoucher) ? dataVoucher : []);

      // 2. Gọi API lấy lịch sử giao dịch điểm
      const resDiem = await api.get('/loyalty/giao-dich-diem/lich-su');
      const dataDiem = resDiem.data?.data || resDiem.data;
      setLichSuDiem(Array.isArray(dataDiem) ? dataDiem : []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Hàm xử lý gạch nợ / đánh dấu đã sử dụng E-Voucher (HD07)
  const handleSuDungVoucher = async (maCode: string) => {
    try {
      await api.patch(`/loyalty/evoucher/${maCode}/su-dung`);
      alert('Ghi nhận sử dụng E-Voucher thành công!');
      setSelectedVoucher(null);
      fetchData(); // Tải lại danh sách sau khi dùng
    } catch (err: any) {
      console.error('Lỗi khi sử dụng voucher:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái voucher.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition flex items-center space-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Trang chủ</span>
          </button>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Lịch Sử & Kho E-Voucher</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center space-x-2 ${
              activeTab === 'voucher'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Kho E-Voucher đã đổi</span>
          </button>

          <button
            onClick={() => setActiveTab('diem')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center space-x-2 ${
              activeTab === 'diem'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Lịch sử biến động điểm</span>
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center py-12 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : activeTab === 'voucher' ? (
          /* TAB 1: KHO E-VOUCHER */
          <div className="space-y-4">
            {lichSuDoiQua.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500 border">
                Chưa có E-Voucher nào được lưu.
              </div>
            ) : (
              lichSuDoiQua.map((item, index) => {
                const maCode = item.maCode || item.maVoucher || item.code || 'EVOUCHER-100K';
                const tenQua = item.quaTang?.tenQua || item.tenQua || 'Voucher 100k';
                const ngayDoi = item.ngayDoi || item.ngayTao || item.createdAt;
                const isUsed = item.trangThai === 'DA_SU_DUNG';

                return (
                  <div
                    key={item.id || item.maDoiQua || index}
                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-800 text-base">{tenQua}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isUsed
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Ngày đổi: {ngayDoi ? new Date(ngayDoi).toLocaleString('vi-VN') : 'Mới đây'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                      {/* Thẻ hiển thị mã code và sao chép */}
                      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 p-2 rounded-lg">
                        <div className="font-mono text-left px-2">
                          <p className="text-[10px] text-blue-600 uppercase font-semibold">Mã E-Voucher</p>
                          <p className="text-sm font-bold text-blue-900">{maCode}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(maCode)}
                          className="p-2 hover:bg-blue-100 text-blue-700 rounded-md transition flex items-center space-x-1 text-xs"
                          title="Sao chép mã"
                        >
                          {copiedCode === maCode ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Nút Xem Mã QR */}
                      <button
                        onClick={() => setSelectedVoucher({ ...item, maCode, tenQua })}
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-3 rounded-lg transition shadow-sm"
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="hidden sm:inline">Mã QR</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* TAB 2: LỊCH SỬ ĐIỂM */
          <div className="space-y-3">
            {lichSuDiem.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500 border">
                Chưa có lịch sử biến động điểm.
              </div>
            ) : (
              lichSuDiem.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {item.moTa || item.loaiGiaoDich || 'Biến động điểm'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : ''}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-base ${
                      (item.soDiem || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(item.soDiem || 0) >= 0 ? `+${item.soDiem}` : item.soDiem} điểm
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* POPUP MODAL HIỂN THỊ MÃ QR CODE (HD07) */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thông tin quà */}
            <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedVoucher.tenQua}</h3>
            <p className="text-xs text-gray-500 mb-4">
              Mã: <span className="font-mono font-bold text-blue-600">{selectedVoucher.maCode}</span>
            </p>

            {/* Khung quét Mã QR */}
            <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center justify-center border border-gray-200 mb-5">
              <QRCodeSVG
                value={selectedVoucher.maCode}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
              <p className="mt-3 text-[11px] text-gray-500 font-medium">
                Quét mã này tại quầy thu ngân để áp dụng ưu đãi
              </p>
            </div>

            {/* Trạng thái / Nút Sử dụng */}
            {selectedVoucher.trangThai === 'DA_SU_DUNG' ? (
              <div className="bg-gray-100 text-gray-500 py-2.5 rounded-xl font-semibold text-sm">
                E-Voucher này đã được sử dụng
              </div>
            ) : (
              <button
                onClick={() => handleSuDungVoucher(selectedVoucher.maCode)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md hover:shadow-lg"
              >
                Xác nhận đã sử dụng tại quầy
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}