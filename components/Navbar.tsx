import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/login/actions';
import { LogOut, User, Sparkles } from 'lucide-react';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-6">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <Sparkles className="w-6 h-6 text-purple-400" />
              StoryTeller <span className="text-purple-400 ml-1">AI</span>
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="hidden sm:inline text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <form action={logout}>
                  <button className="text-sm text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
