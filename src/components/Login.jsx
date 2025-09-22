import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="h-screen bg-gradient-to-r from-blue-500 to-purple-500">

        <div className="flex items-center justify-center ">
      <div className="bg-white shadow-lg rounded-lg p-10 mt-6 w-96">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 p-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-14 transform -translate-y-1/2 text-gray-500 text-sm hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition duration-200"
          >
            Login
          </button>
          {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        </form>
        <div className="mt-6 text-center text-gray-400 text-sm">
          ©
           {/* {new Date().getFullYear()} */}
           SmartClass LMS. All rights reserved.
        </div>
      </div>
</div>

<div>
   <div className="bg-white/10 backdrop-blur-md shadow-xl  rounded-2xl  w-1/2 mt-7 h-60 mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Access Levels</h2>
      
      <div className=" flex  items-center justify-center gap-6 ">
        {/* Student */}
        <div className="bg-white/20 w-40 h-40 p-5 rounded-xl flex items-center gap-4">
         <div> <span className="text-3xl"></span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Student</h3>
            <p className="text-sm text-white/70">View personal timetables</p>
          </div>
        </div>

        {/* Faculty */}
        <div className="bg-white/20 p-5 w-40 h-40 rounded-xl flex items-center gap-4">
          <span className="text-3xl"></span>
          <div>
            <h3 className="text-lg font-semibold text-white">Faculty</h3>
            <p className="text-sm text-white/70">Manage courses and timetables</p>
          </div>
        </div>

        {/* Admin */}
        <div className="bg-white/20 p-5 w-40 h-40 rounded-xl flex items-center gap-4">
          <span className="text-3xl"></span>
          <div>
            <h3 className="text-lg font-semibold text-white">Admin</h3>
            <p className="text-sm text-white/70">Manage users and system settings</p>
          </div>
        </div>
      </div>
    </div>
</div>

    </div>
  );
}
