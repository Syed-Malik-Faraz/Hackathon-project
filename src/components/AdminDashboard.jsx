import React, { useState } from "react";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [timetableData, setTimetableData] = useState({});
  const [message, setMessage] = useState("");

  const handleGenerateTimetable = async () => {
    try {
      const response = await fetch("http://localhost:8000/generate_timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableData }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Timetable generated successfully!");
      } else {
        setMessage(data.error || "Error generating timetable");
      }
    } catch (err) {
      console.error("Backend error:", err);
      setMessage("Server error");
    }
  };

  const handleChange = (day, period, value) => {
    setTimetableData((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [period]: value,
      },
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case "generate":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Generate Timetable</h2>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <div key={day} className="mb-4">
                <h3 className="font-semibold">{day}</h3>
                {[1, 2, 3, 4, 5].map((p) => (
                  <input
                    key={p}
                    type="text"
                    placeholder={`Period ${p} (Course - Room)`}
                    className="border p-2 m-1 rounded w-60"
                    onChange={(e) => handleChange(day, `Period ${p}`, e.target.value)}
                  />
                ))}
              </div>
            ))}
            <button
              onClick={handleGenerateTimetable}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Timetable
            </button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
          </div>
        );

      default:
        return (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold">Welcome, Admin!</h2>
            <p className="mt-2">Use the sidebar to generate timetables.</p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "generate", label: "📅 Generate Timetable" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
        <h3 className="text-2xl font-bold mb-10 text-center">Admin Panel</h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`p-3 rounded text-left hover:bg-gray-700 ${
                activeSection === item.key ? "bg-blue-600 shadow" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">{renderSection()}</div>
    </div>
  );
};

export default AdminDashboard;
