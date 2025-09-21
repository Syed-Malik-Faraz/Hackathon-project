import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);

      localStorage.setItem("user", JSON.stringify(data));
      if (data.role === "admin") navigate("/admin");
      if (data.role === "teacher") navigate("/faculty");
      if (data.role === "student") navigate("/student");
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-2 w-64">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="border p-2 rounded" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-2">Login</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
