import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Trash2, Key, Mail, Eye, EyeOff, 
  AlertTriangle, UserCheck, UserPlus, Users, Sparkles, AlertCircle 
} from 'lucide-react';
import { Account } from '../types/bot';

interface AccountManagerProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id' | 'status'>) => void;
  onRemoveAccount: (id: string) => void;
  onUpdateAccount: (account: Account) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onRemoveAccount,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(accounts.length === 0);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور المسجلين في Webook');
      return;
    }

    onAddAccount({
      email: newEmail.trim(),
      password: newPassword,
      name: newName.trim() || `حساب ${accounts.length + 1}`,
    });

    setNewEmail('');
    setNewPassword('');
    setNewName('');
    setErrorMsg('');
    setShowAddForm(false);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>مدير حسابات Webook (إضافة وإدارة الحسابات)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            أضف حساباتك الخاصة في Webook. تُحفظ الحسابات محلياً في متصفحك فقط وتُستخدم لتسجيل الدخول الفعلي وتثبيت سلتك الرسمية.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حساب Webook</span>
        </button>
      </div>

      {/* Empty State Banner if no accounts exist */}
      {accounts.length === 0 && !showAddForm && (
        <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-white">لا توجد أي حسابات مضافة حالياً</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              الحسابات فارغة تماماً بناءً على طلبك. أضف بريدك وكلمة مرورك في Webook لتتمكن من تشغيل البوت وحجز المقاعد مباشرة في سلتك.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>أضف حسابك الآن</span>
          </button>
        </div>
      )}

      {/* Add Account Modal / Panel */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">إضافة حساب Webook جديد</h4>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
              تشفير محلي في جهازك
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">اسم الحساب (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: حسابي الشخصي أو VIP 1"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">البريد الإلكتروني في Webook</label>
              <input
                type="email"
                required
                placeholder="your.email@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">كلمة المرور في Webook</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {accounts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              حفظ الحساب
            </button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc, index) => {
            const isPassVisible = showPasswords[acc.id];
            return (
              <div
                key={acc.id}
                className="bg-[#0b0e14] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {acc.name || `حساب Webook ${index + 1}`}
                        </h4>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                          <UserCheck className="w-3 h-3" /> مفعّل وجاهز للحجز
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveAccount(acc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                      title="حذف هذا الحساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        <span>البريد:</span>
                      </span>
                      <span className="font-mono text-slate-200 font-medium">{acc.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        <span>كلمة المرور:</span>
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-300">
                          {isPassVisible ? acc.password : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(acc.id)}
                          className="text-slate-500 hover:text-slate-300 cursor-pointer"
                          title={isPassVisible ? 'إخفاء' : 'إظهار'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>يتم استخدامه تلقائياً في <code className="text-purple-300 font-mono">main.py</code></span>
                  <span className="text-purple-400 font-medium font-mono">الحساب النشط</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
