import React, { useState, useEffect } from "react";

// Example static data — replace with API calls if needed
const students = [
  { id: "s1", name: "Student 1" },
  { id: "s2", name: "Student 2" },
  { id: "s3", name: "Student 3" },
];
const courses = [
  { id: "c1", name: "Mathematics" },
  { id: "c2", name: "Physics" },
  { id: "c3", name: "Chemistry" },
];

// Attendance Form Component
function AttendanceForm({ students, courses }) {
  const [subject, setSubject] = useState(courses[0]?.name || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState(
    students.reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
  );
  const [history, setHistory] = useState([]);

  const toggleStudent = (id) => {
    setAttendanceMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAll = (val) => {
    const next = {};
    students.forEach((s) => (next[s.id] = val));
    setAttendanceMap(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = { id: Date.now(), subject, date, attendees: { ...attendanceMap } };
    setHistory((h) => [record, ...h]);
    setAll(false);
  };

  const progress = students.map((s) => {
    let total = 0;
    let present = 0;
    history.forEach((rec) => {
      total += 1;
      if (rec.attendees[s.id]) present += 1;
    });
    const percent = total === 0 ? 0 : Math.round((present / total) * 100);
    return { ...s, percent, present, total };
  });

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Subject</label>
            <select
              className="w-full border rounded p-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between mb-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => setAll(true)} className="px-2 py-1 bg-green-100 rounded">Select All</button>
              <button type="button" onClick={() => setAll(false)} className="px-2 py-1 bg-red-100 rounded">Clear All</button>
            </div>
            <div>{students.length} students</div>
          </div>
          <ul className="space-y-1">
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!attendanceMap[s.id]} onChange={() => toggleStudent(s.id)} />
                  {s.name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Submit Attendance</button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Student Progress</h3>
        <ul>
          {progress.map((p) => (
            <li key={p.id} className="flex justify-between items-center mb-1">
              <span>{p.name}</span>
              <span>{p.present}/{p.total} ({p.percent}%)</span>
              <div className="w-32 h-2 bg-gray-200 rounded">
                <div className="h-2 rounded bg-green-500" style={{ width: `${p.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

const Faculty = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(true);

  // Fetch timetable from backend
  const fetchTimetable = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/timetable"); // GET endpoint for faculty
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
      const data = await res.json();
      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTimetable([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "timetable":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">My Timetable</h2>
            {loadingTimetable ? (
              <p>Loading timetable...</p>
            ) : timetable.length === 0 ? (
              <p>No timetable found.</p>
            ) : (
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
                    {timetable.map((t, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-100">
                        <td className="p-3">{t.day}</td>
                        <td className="p-3">{t.time}</td>
                        <td className="p-3">{t.course}</td>
                        <td className="p-3">{t.classroom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "attendance":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Mark Attendance</h2>
            <AttendanceForm students={students} courses={courses} />
          </div>
        );

      case "reports":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-3xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Attendance Reports</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Course</th>
                    <th className="p-3 text-left">Present</th>
                    <th className="p-3 text-left">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-100">
                      <td className="p-3">{new Date().toISOString().slice(0,10)}</td>
                      <td className="p-3">{courses[idx % courses.length].name}</td>
                      <td className="p-3">{Math.floor(Math.random() * students.length)}</td>
                      <td className="p-3">{Math.floor(Math.random() * students.length)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "announcements":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Post Announcement</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Message"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Post Announcement
              </button>
            </form>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Welcome, Faculty!</h2>
            <p className="mt-3 text-base sm:text-lg">
              Use the sidebar to manage your timetable, attendance, and announcements.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "timetable", label: "🗓 View Timetable" },
    { key: "attendance", label: "✅ Mark Attendance" },
    { key: "reports", label: "📊 Attendance Reports" },
    { key: "announcements", label: "📢 Announcements" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 flex flex-col p-5 shadow-lg transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <h3 className="text-2xl font-bold mb-10 text-center text-white">Faculty Panel</h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
              ${activeSection === item.key ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"}`}
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

export default Faculty;
