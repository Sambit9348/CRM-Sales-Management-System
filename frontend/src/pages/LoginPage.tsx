import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Briefcase, Lock, Mail, ShieldAlert, Sparkles, Eye, EyeOff, Shield, UserCheck, KeyRound, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Invalid email or password');
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Aesthetic ambient gradient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-float-glow" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative z-10 space-y-6 backdrop-blur-xl animate-pop-in">
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/40 ring-1 ring-white/20 transform hover:scale-105 transition-transform duration-300">
              <Briefcase className="w-8 h-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
              ✓
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CRM Sales Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Enterprise MERN Sales Management System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-semibold flex items-center justify-center gap-2 animate-pop-in">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Email Address</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-xs"
                placeholder="admin@crm.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-xs"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none z-20 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 font-bold text-white text-xs tracking-wide transition-all duration-200 shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 mt-3 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Quick Buttons */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Evaluator Demo Logins:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('admin@crm.com', 'Admin@123')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/60 text-[11px] font-bold text-indigo-400 hover:text-white transition-all text-center flex items-center justify-center gap-1 group shadow-sm"
            >
              <Shield className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleQuickDemo('manager@crm.com', 'Manager@123')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/60 text-[11px] font-bold text-amber-400 hover:text-white transition-all text-center flex items-center justify-center gap-1 group shadow-sm"
            >
              <UserCheck className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Manager</span>
            </button>
            <button
              onClick={() => handleQuickDemo('executive1@crm.com', 'Executive@123')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/60 text-[11px] font-bold text-emerald-400 hover:text-white transition-all text-center flex items-center justify-center gap-1 group shadow-sm"
            >
              <KeyRound className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Executive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
