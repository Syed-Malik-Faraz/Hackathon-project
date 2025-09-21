import React, { useEffect, useState } from "react";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [timetable, setTimetable] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch timetable
  useEffect(() => {
    fetch("http://localhost:8000/student/timetable")
      .then((res) => res.json())
      .then((data) => setTimetable(data.timetable))
      .catch((err) => console.error("Error fetching timetable:", err));
  }, []);

  // Fetch announcements
  useEffect(() => {
    fetch("http://localhost:8000/student/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch((err) => console.error("Error fetching announcements:", err));
  }, []);



  const [notes, setNotes] = useState([]);
useEffect(() => {
  fetch("http://localhost:8000/student/notes")
    .then((res) => res.json())
    .then((data) => setNotes(data));
}, []);






  // Fetch attendance
  useEffect(() => {
    fetch("http://localhost:8000/student/attendance")
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.error("Error fetching attendance:", err));
  }, []);

  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "timetable", label: "📅 Timetable" },
    { key: "announcements", label: "📢 Announcements" },
    { key: "attendance", label: "📝 Attendance" },
  // Add to your menuItems
{ key: "notes", label: "📄 Notes" },

  ];

  const renderSection = () => {
    switch (activeSection) {
      case "timetable":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Timetable</h2>
            {Object.keys(timetable).length === 0 && <p>No timetable available.</p>}
            {Object.entries(timetable).map(([day, periods]) => (
              <div key={day} className="mb-4">
                <h3 className="font-semibold">{day}</h3>
                <ul>
                  {Object.entries(periods).map(([period, course]) => (
                    <li key={period}>
                      {period}: {course}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case "announcements":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Announcements</h2>
            {announcements.length === 0 && <p>No announcements yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} className="p-3 border rounded mb-2 bg-gray-50">
                <strong>{a.title}</strong> by {a.postedBy} <br />
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        );

      case "attendance":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Attendance</h2>
            {attendance.length === 0 && <p>No attendance data yet.</p>}
            {attendance.map((record) => (
              <div key={record.course} className="flex justify-between mb-2">
                <span>{record.course}</span>
                <span className={`font-bold ${record.percent >= 75 ? "text-green-600" : "text-red-600"}`}>
                  {record.percent}%
                </span>
              </div>
            ))}
          </div>
        );

case "notes":
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl w-full mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Notes
      </h2>
      <ul className="space-y-4">
        {notes.map((n) => (
          <li key={n.id} className="p-4 bg-gray-50 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">{n.title}</h3>
            <p className="text-gray-600">{n.description}</p>
            {n.fileUrl && (
              <a
                href={n.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download File
              </a>
            )}
            <p className="text-xs text-gray-400">
              Shared by {n.postedBy} on{" "}
              {new Date(n.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );


      default:
        return (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold">Welcome, Student!</h2>
            <p className="mt-2">Use the sidebar to view your timetable, announcements, and attendance.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 flex flex-col p-5 shadow-lg transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <h3 className="text-2xl font-bold mb-10 text-center text-white">Student Panel</h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                activeSection === item.key ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar Toggle */}
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
