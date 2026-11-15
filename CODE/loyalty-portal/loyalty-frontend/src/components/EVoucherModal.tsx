"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface EVoucherModalProps {
  voucher: {
    maCode: string;
    tenQua: string;
    hanSuDung: string;
    trangThai: string;
  } | null;
  onClose: () => void;
  onUseVoucher: (maCode: string) => void;
}

export default function EVoucherModal({
  voucher,
  onClose,
  onUseVoucher,
}: EVoucherModalProps) {
  if (!voucher) return null;

  const isExpired = voucher.trangThai === "DA_SU_DUNG" || voucher.trangThai === "HET_HAN";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center shadow-xl relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-1">{voucher.tenQua}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Hạn sử dụng: {new Date(voucher.hanSuDung).toLocaleDateString("vi-VN")}
        </p>

        {/* Mã QR Code */}
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center border border-gray-200 mb-4">
          <QRCodeSVG
            value={voucher.maCode}
            size={180}
            bgColor={"#FFFFFF"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={true}
          />
          <span className="mt-3 font-mono font-bold text-lg text-blue-600 tracking-wider">
            {voucher.maCode}
          </span>
        </div>

        {/* Trạng thái & Hành động */}
        {isExpired ? (
          <div className="bg-gray-100 text-gray-500 py-2 rounded-lg font-semibold text-sm">
            {voucher.trangThai === "DA_SU_DUNG" ? "Đã sử dụng" : "Đã hết hạn"}
          </div>
        ) : (
          <button
            onClick={() => onUseVoucher(voucher.maCode)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Đánh dấu đã sử dụng
          </button>
        )}
      </div>
    </div>
  );
}