import React, { useEffect, useState } from "react";

const FacultyDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [timetable, setTimetable] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "" });
  const [message, setMessage] = useState("");
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Fetch timetable
  useEffect(() => {
    fetch("http://localhost:8000/timetable")
      .then((res) => res.json())
      .then((data) => setTimetable(data.timetable || {}))
      .catch((err) => console.error("Error fetching timetable:", err))
      .finally(() => setLoadingTimetable(false));
  }, []);

  // Fetch announcements
  useEffect(() => {
    fetch("http://localhost:8000/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data || []))
      .catch((err) => console.error("Error fetching announcements:", err))
      .finally(() => setLoadingAnnouncements(false));
  }, []);

  const handleAnnouncementChange = (e) => {
    setAnnouncementForm({ ...announcementForm, [e.target.name]: e.target.value });
  };

const [noteForm, setNoteForm] = useState({
  title: "",
  description: "",
  file: null,
});


  
  


  const postAnnouncement = async () => {
    try {
      const response = await fetch("http://localhost:8000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...announcementForm,
          postedBy: "Faculty Member", // You can make this dynamic
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setAnnouncementForm({ title: "", message: "" });
        setMessage("Announcement posted successfully!");
      } else {
        setMessage(data.error || "Error posting announcement");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleAttendanceChange = (course, studentId, present) => {
    setAttendance((prev) => ({
      ...prev,
      [course]: { ...(prev[course] || {}), [studentId]: present },
    }));
  };

  const submitAttendance = async (course) => {
    const presentStudents = Object.entries(attendance[course] || {})
      .filter(([_, present]) => present)
      .map(([id]) => id);

    try {
      const response = await fetch("http://localhost:8000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, date: new Date().toISOString(), presentStudents }),
      });
      const data = await response.json();
      if (response.ok) setMessage(`Attendance recorded for ${course}`);
      else setMessage(data.error || "Error recording attendance");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "timetable":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Timetable</h2>
            {loadingTimetable ? (
              <p>Loading timetable...</p>
            ) : timetable && Object.keys(timetable).length > 0 ? (
              Object.keys(timetable).map((day) => (
                <div key={day} className="mb-4">
                  <h3 className="font-semibold">{day}</h3>
                  <ul className="list-disc list-inside">
                    {timetable[day] &&
                      Object.entries(timetable[day]).map(([period, course]) => (
                        <li key={period}>
                          {period}: {course || "Free"}
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No timetable available.</p>
            )}
          </div>
        );

case "notes":
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Share Notes</h2>
      <input
        type="text"
        name="title"
        placeholder="Note Title"
        className="border p-2 w-full mb-2 rounded"
        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        className="border p-2 w-full mb-2 rounded"
        onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
      ></textarea>
      <input
        type="file"
        onChange={(e) => setNoteForm({ ...noteForm, file: e.target.files[0] })}
        className="mb-2"
      />
      <button
        onClick={async () => {
          const formData = new FormData();
          formData.append("title", noteForm.title);
          formData.append("description", noteForm.description);
          formData.append("postedBy", "Faculty Member");
          if (noteForm.file) formData.append("file", noteForm.file);

          const res = await fetch("http://localhost:8000/notes", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok) setMessage("Note shared successfully");
          else setMessage(data.error || "Error sharing note");
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Share Note
      </button>
    </div>
  );



      case "announcements":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Post Announcement</h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="border p-2 w-full mb-2 rounded"
              value={announcementForm.title}
              onChange={handleAnnouncementChange}
            />
            <textarea
              name="message"
              placeholder="Message"
              className="border p-2 w-full mb-2 rounded"
              value={announcementForm.message}
              onChange={handleAnnouncementChange}
            ></textarea>
            <button
              onClick={postAnnouncement}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Post
            </button>

            <h3 className="text-xl mt-6 mb-2 font-semibold">Previous Announcements</h3>
            {loadingAnnouncements ? (
              <p>Loading announcements...</p>
            ) : announcements.length > 0 ? (
              announcements.map((a) => (
                <div key={a.id} className="p-3 border rounded mb-2 bg-gray-50">
                  <strong>{a.title}</strong> by {a.postedBy} <br />
                  <span>{a.message}</span>
                </div>
              ))
            ) : (
              <p>No announcements yet.</p>
            )}
          </div>
        );

      case "attendance":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
            {["Mathematics", "Physics", "Chemistry"].map((course) => (
              <div key={course} className="mb-4">
                <h3 className="font-semibold">{course}</h3>
                {["s1", "s2", "s3"].map((studentId) => (
                  <div key={studentId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={attendance[course]?.[studentId] || false}
                      onChange={(e) => handleAttendanceChange(course, studentId, e.target.checked)}
                    />
                    <span>{studentId}</span>
                  </div>
                ))}
                <button
                  onClick={() => submitAttendance(course)}
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit Attendance
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold">Welcome, Faculty!</h2>
            <p className="mt-2">
              Use the sidebar to manage timetable, announcements, and attendance.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "timetable", label: "📅 Timetable" },
    { key: "announcements", label: "📢 Announcements" },
    { key: "attendance", label: "📝 Attendance" },
    // Add to your menuItems
{ key: "notes", label: "📄 Share Notes" },

  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
        <h3 className="text-2xl font-bold mb-10 text-center">Faculty Panel</h3>
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
      <div className="flex-1 p-6 overflow-y-auto">
        {renderSection()}
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default FacultyDashboard;
