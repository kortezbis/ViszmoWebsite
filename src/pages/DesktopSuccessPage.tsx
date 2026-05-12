import React, { useEffect } from 'react';
import { useAuth } from '../lib/auth';

export const DesktopSuccessPage: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;

  useEffect(() => {
    const triggerRedirect = () => {
      const url = window.location.href;
      // Handle both hash and query param styles of Supabase redirects
      const deepLink = url.replace(window.location.origin + window.location.pathname, 'viszmo://auth/callback');
      console.log('Redirecting to:', deepLink);
      window.location.href = deepLink;
    };

    // Initial attempt
    triggerRedirect();

    // Fallback attempt after 1.5 seconds if the browser blocked the first one
    const timer = setTimeout(triggerRedirect, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleManualReturn = () => {
    const url = window.location.href;
    const deepLink = url.replace(window.location.origin + window.location.pathname, 'viszmo://auth/callback');
    window.location.href = deepLink;
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-[#111111] relative overflow-hidden">
      {/* Top Header - User Info Centered */}
      <div className="absolute top-0 left-0 w-full p-10 flex flex-col items-center">
        {user ? (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="User profile" 
                  className="w-14 h-14 rounded-full border-2 border-gray-50 shadow-sm object-cover" 
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold shadow-sm">
                  {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-gray-900 leading-tight">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {user.email}
              </span>
              {signOut && (
                <button 
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-black underline underline-offset-4 mt-2 transition-colors font-semibold"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24">
        <h1 className="text-[2.75rem] font-black text-gray-900 mb-4 tracking-tighter">
          Opening Viszmo
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          If the app has not opened, <button onClick={handleManualReturn} className="text-black font-bold underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all">click here</button>.
        </p>
      </div>

      {/* Bottom Section */}
      <div className="pb-16 flex flex-col items-center gap-5">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Don't have Viszmo yet?</p>
        <a 
          href="/"
          className="px-10 py-3 border-2 border-gray-100 rounded-2xl text-sm font-black hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
        >
          Download Viszmo
        </a>
      </div>
    </div>
  );
};
