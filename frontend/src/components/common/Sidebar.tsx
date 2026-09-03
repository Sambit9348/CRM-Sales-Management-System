import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  CalendarCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const user = useSelector((state: RootState) => state.auth.user);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Customers', path: '/customers', icon: Building2 },
    { name: 'Deals & Pipeline', path: '/deals', icon: TrendingUp },
    { name: 'Activities', path: '/activities', icon: CalendarCheck },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'User Management', path: '/users', icon: UserCheck });
  }

  const handleNavClick = () => {
    if (window.innerWidth < 768 && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out glass-panel border-r border-slate-800 flex flex-col justify-between ${
          sidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80">
            {sidebarOpen ? (
              <>
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-extrabold text-base tracking-tight text-white">Sales CRM</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                      Sales Management
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center w-full">
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform group"
                  title="Expand sidebar"
                >
                  <Briefcase className="w-5 h-5 group-hover:hidden" />
                  <ChevronRight className="w-5 h-5 hidden group-hover:block" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={!sidebarOpen ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      sidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'
                    } py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      sidebarOpen ? 'mr-3' : 'mx-auto'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Badge / Role Card */}
        {user &&
          (sidebarOpen ? (
            <div className="p-3 m-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-indigo-500/50 shrink-0 uppercase">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-indigo-400 shrink-0" />
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 mb-3 flex items-center justify-center" title={`${user.name} (${user.role})`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-indigo-500/50 hover:scale-105 transition-transform uppercase">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
              </div>
            </div>
          ))}
      </aside>
    </>
  );
};
