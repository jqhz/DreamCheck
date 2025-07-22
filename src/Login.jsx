import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
      if (onLogin) onLogin();
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Height of navbar (py-4 + text + border): estimate 72px
  const NAVBAR_HEIGHT = 72;

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-20 w-full flex items-center justify-between px-8 py-4 bg-[#242424] bg-opacity-80 backdrop-blur border-b border-gray-300" style={{height: NAVBAR_HEIGHT}}>
        <div className="flex items-center gap-3">
          {/* Placeholder logo (SVG) */}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-2xl mr-2">🌙</span>
          <span className="text-2xl font-extrabold text-indigo-700 tracking-tight select-none">DreamCheck</span>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-base disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </nav>
      {/* Content area with background gif and overlay */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center min-h-0" style={{minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`}}>
        {/* Background GIF */}
        <img
          src={`${import.meta.env.BASE_URL}dream-bg.gif`}
          alt="Dream background"
          className="absolute top-0 left-0 w-full h-full object-cover object-top z-0 select-none pointer-events-none"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />  
        {/* Overlay for readability */}
        <div className="absolute top-0 left-0 w-full h-full bg-blue-900 bg-opacity-40 z-10" />
        {/* Main login card */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full min-h-[calc(100vh-80px)]">
          <div className="bg-rose-100 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center mt-12">
            <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">DreamCheck</h2>
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-lg disabled:opacity-60 mx-auto"
              style={{ minWidth: 220 }}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-2" />
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;