'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  X, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle, 
  LogOut, 
  User, 
  Loader2 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChange: (user: any) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}: AuthModalProps) {
  const [mode, setMode] = useState<'magic_link' | 'password'>('magic_link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `En inloggningslänk har skickats till ${email}. Kontrollera din inkorg!`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Kunde inte skicka inloggningslänk.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Try sign up if user not found
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        onUserChange(signUpData.user);
        setMessage({
          type: 'success',
          text: 'Konto skapat och inloggad!',
        });
      } else {
        onUserChange(data.user);
        setMessage({
          type: 'success',
          text: 'Inloggad!',
        });
      }
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Ett fel uppstod vid inloggning.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      onUserChange(null);
      setMessage({
        type: 'success',
        text: 'Du har loggats ut.',
      });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Supabase Säker Inloggning</h3>
              <p className="text-xs text-zinc-400">PostgreSQL med Row Level Security (RLS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          /* User Profile & Logout View */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-zinc-200">Inloggad användare:</span>
              </div>
              <div className="font-mono text-white text-sm">{currentUser.email}</div>
              <div className="text-[11px] text-zinc-500">
                Användar-ID: {currentUser.id}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium transition"
              >
                Stäng
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Logga ut</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form */
          <div className="space-y-4 text-xs">
            {/* Mode toggle */}
            <div className="flex rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => setMode('magic_link')}
                className={`flex-1 py-1.5 rounded-md font-medium transition text-center ${
                  mode === 'magic_link'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Magic Link (E-postlänk)
              </button>
              <button
                type="button"
                onClick={() => setMode('password')}
                className={`flex-1 py-1.5 rounded-md font-medium transition text-center ${
                  mode === 'password'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Lösenord
              </button>
            </div>

            <form onSubmit={mode === 'magic_link' ? handleMagicLink : handlePasswordSignIn} className="space-y-3">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">E-postadress</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din.epost@foretag.se"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {mode === 'password' && (
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Lösenord</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minst 6 tecken"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium transition"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Bearbetar...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{mode === 'magic_link' ? 'Skicka Magic Link' : 'Logga in'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
