import React, { useEffect, useState } from "react";
import Login from "./Login";
import DreamCheck from "./DreamCheck";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css"; // Ensure you import your CSS

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#222] text-white">Loading...</div>;

  return user ? <DreamCheck /> : <Login />;
}

export default App;
