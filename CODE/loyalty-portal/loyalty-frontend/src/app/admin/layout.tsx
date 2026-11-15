'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Gift,
  MessageSquare,
  History,
  LogOut,
  Search,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users },
    { name: 'Quà tặng', href: '/admin/gifts', icon: Gift },
    { name: 'Quản lý khiếu nại', href: '/admin/complaints', icon: MessageSquare },
    { name: 'Điều chỉnh & Audit', href: '/admin/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex antialiased">
      {/* Sidebar cố định bên trái */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between fixed inset-y-0 z-20">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              L
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                Loyalty Admin
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">Management Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Quản Trị
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">Quản trị viên</p>
              <p className="text-[10px] text-slate-400 truncate">admin@system.io</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition border border-slate-200/60 hover:border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            {/* Nút Về Trang Khách Hàng */}
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition border border-slate-200/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về trang Khách hàng</span>
            </Link>

            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng, mã khiếu nại..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hệ thống hoạt động</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">{children}</main>
      </div>
    </div>
  );
}