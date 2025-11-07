import { useState } from "react";

import { AuthDialog } from "./components/auth/AuthDialog";
import { ThreadBoard } from "./components/threads/ThreadBoard";
import { Button } from "./components/ui/Button";
import { useAuth } from "./state/AuthProvider";

export const App = () => {
  const { user, logout, isReady } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showAuth, setShowAuth] = useState(false);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <header className="border-b border-slate-200 bg-white/60 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-xl font-bold text-white shadow-lg">
              NT
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">NumberTalk</h1>
              <p className="text-sm text-slate-500">Where numbers become conversations.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-slate-600">
                  Signed in as <span className="font-semibold text-slate-900">{user.username}</span>
                </span>
                <Button variant="ghost" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              isReady && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openAuth("login")}>Sign in</Button>
                  <Button onClick={() => openAuth("register")}>Create account</Button>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <ThreadBoard />
      </main>

      {showAuth && (
        <AuthDialog
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
};
