import React, { useState } from "react";
 
const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  // Render different pages
  const renderSection = () => {
    switch (activeSection) {
      case "timetable":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              My Timetable
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Day</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Course</th>
                    <th className="p-3 text-left">Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-100">
                    <td className="p-3">Monday</td>
                    <td className="p-3">9:00 AM - 10:00 AM</td>
                    <td className="p-3">Mathematics</td>
                    <td className="p-3">Room 201</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-100">
                    <td className="p-3">Monday</td>
                    <td className="p-3">10:15 AM - 11:15 AM</td>
                    <td className="p-3">Physics</td>
                    <td className="p-3">Room 105</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
 
      case "attendance":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              My Attendance
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Mathematics</span>
                <span className="font-bold text-green-600">90%</span>
              </div>
              <div className="flex justify-between">
                <span>Physics</span>
                <span className="font-bold text-yellow-600">75%</span>
              </div>
              <div className="flex justify-between">
                <span>Chemistry</span>
                <span className="font-bold text-red-600">60%</span>
              </div>
            </div>
          </div>
        );
 
      case "announcements":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              Announcements
            </h2>
            <ul className="space-y-4">
              <li className="p-4 bg-gray-50 border rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg">Exam Schedule Released</h3>
                <p className="text-gray-600">
                  Mid-semester exams will start from 10th October.
                </p>
              </li>
              <li className="p-4 bg-gray-50 border rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg">Holiday Notice</h3>
                <p className="text-gray-600">
                  College will remain closed on 2nd October for Gandhi Jayanti.
                </p>
              </li>
            </ul>
          </div>
        );
 
      case "profile":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              My Profile
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                defaultValue="John Doe"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                defaultValue="john.doe@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Update Profile
              </button>
            </form>
          </div>
        );
 
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Welcome, Student!
            </h2>
            <p className="mt-3 text-base sm:text-lg">
              Use the sidebar to view your timetable, attendance, and announcements.
            </p>
          </div>
        );
    }
  };
 
  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "timetable", label: "📅 View Timetable" },
    { key: "attendance", label: "📊 My Attendance" },
    { key: "announcements", label: "📢 Announcements" },
    { key: "profile", label: "👤 Profile" },
  ];
 
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 flex flex-col p-5 shadow-lg transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <h3 className="text-2xl font-bold mb-10 text-center text-white">
          Student Panel
        </h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${
                activeSection === item.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
 
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-lg shadow-md z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? "✖" : "☰"}
      </button>
 
      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50">
        {renderSection()}
      </div>
    </div>
  );
};
 
export default StudentDashboard;
 