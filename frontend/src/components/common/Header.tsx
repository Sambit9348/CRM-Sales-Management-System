import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { NotificationDropdown } from './NotificationDropdown';
import { LogOut, Search, ShieldCheck, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setGlobalSearch } from '../../store/slices/uiSlice';

export const Header: React.FC<{ title?: string }> = ({ title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const globalSearch = useSelector((state: RootState) => state.ui.globalSearch);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 glass-panel sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Mobile Hamburger & Page Title / Search Input */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl min-w-0">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors md:hidden shrink-0"
          title="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight hidden lg:block shrink-0">
          {title || 'CRM Sales Portal'}
        </h1>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
            placeholder="Search leads, deals..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions & Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 hidden sm:block" />

        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{user.name}</span>
              <span className="text-[10px] text-indigo-400 font-medium flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" />
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-indigo-500/40 shrink-0 uppercase">
              {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
