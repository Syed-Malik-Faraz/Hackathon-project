import React, { useEffect, useState } from "react";

const FacultyDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");

  // Timetable
  const [timetable, setTimetable] = useState({});

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "" });

  // Attendance
  const [attendance, setAttendance] = useState({});
  const [studentsList, setStudentsList] = useState([]);

  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", file: null });

  const [message, setMessage] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    fetch("http://localhost:8000/student/timetable")
      .then(res => res.json())
      .then(data => setTimetable(data || {}))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data || []))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/teacher/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data || []))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/students")
      .then(res => res.json())
      .then(data => setStudentsList(data || []))
      .catch(err => console.error(err));
  }, []);

  // --- ANNOUNCEMENTS ---
  const handleAnnouncementChange = e => {
    setAnnouncementForm({ ...announcementForm, [e.target.name]: e.target.value });
  };

  const postAnnouncement = async () => {
    try {
      const res = await fetch("http://localhost:8000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...announcementForm, postedBy: "Faculty Member" }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(prev => [data.announcement, ...prev]);
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

  // --- ATTENDANCE ---
  const handleAttendanceChange = (studentId, present) => {
    setAttendance(prev => ({ ...prev, [studentId]: present }));
  };

  const submitAttendance = async course => {
    const presentStudents = Object.entries(attendance)
      .filter(([_, present]) => present)
      .map(([id]) => id);

    try {
      const res = await fetch("http://localhost:8000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, date: new Date().toISOString(), presentStudents }),
      });
      const data = await res.json();
      setMessage(res.ok ? `Attendance recorded for ${course}` : data.error || "Error");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  // --- ASSIGNMENTS ---
  const handleAssignmentChange = e => {
    setAssignmentForm({ ...assignmentForm, [e.target.name]: e.target.value });
  };

  const handleAssignmentFile = e => {
    setAssignmentForm({ ...assignmentForm, file: e.target.files[0] });
  };

  const postAssignment = async () => {
    const formData = new FormData();
    formData.append("title", assignmentForm.title);
    formData.append("description", assignmentForm.description);
    formData.append("postedBy", "Faculty Member");
    if (assignmentForm.file) formData.append("file", assignmentForm.file);

    try {
      const res = await fetch("http://localhost:8000/assignments", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAssignments(prev => [data.assignment, ...prev]);
        setAssignmentForm({ title: "", description: "", file: null });
        setMessage("Assignment posted successfully!");
      } else {
        setMessage(data.error || "Error posting assignment");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  // --- RENDER SECTIONS ---
  const renderSection = () => {
    switch (activeSection) {
      case "timetable":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Timetable</h2>
            {timetable && Object.keys(timetable).length > 0 ? (
              Object.keys(timetable).map(day => (
                <div key={day} className="mb-2">
                  <h3 className="font-semibold">{day}</h3>
                  <ul>
                    {Object.entries(timetable[day]).map(([period, course]) => (
                      <li key={period}>{period}: {course}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No timetable available.</p>
            )}
          </div>
        );

      case "announcements":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Post Announcement</h2>
            <input
              name="title"
              placeholder="Title"
              value={announcementForm.title}
              onChange={handleAnnouncementChange}
              className="border p-2 mb-2 w-full"
            />
            <textarea
              name="message"
              placeholder="Message"
              value={announcementForm.message}
              onChange={handleAnnouncementChange}
              className="border p-2 mb-2 w-full"
            />
            <button onClick={postAnnouncement} className="px-4 py-2 bg-green-600 text-white rounded">
              Post
            </button>
            <h3 className="mt-4 font-semibold">Previous Announcements</h3>
            {announcements.map(a => (
              <div key={a.id} className="border p-2 my-1 rounded">
                <strong>{a.title}</strong> by {a.postedBy}
                <p>{a.message}</p>
              </div>
            ))}
          </div>
        );

      case "attendance":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Mark Attendance</h2>
            {studentsList.length === 0 ? <p>No students available.</p> : (
              <div>
                {studentsList.map(s => (
                  <div key={s.username}>
                    <input
                      type="checkbox"
                      checked={attendance[s.username] || false}
                      onChange={e => handleAttendanceChange(s.username, e.target.checked)}
                    />
                    <span className="ml-2">{s.name} ({s.username})</span>
                  </div>
                ))}
                <button onClick={() => submitAttendance("General Course")} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
                  Submit Attendance
                </button>
              </div>
            )}
          </div>
        );

      case "assignments":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Assignments</h2>
            <div className="mb-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={assignmentForm.title}
                onChange={handleAssignmentChange}
                className="border p-2 mb-2 w-full"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={assignmentForm.description}
                onChange={handleAssignmentChange}
                className="border p-2 mb-2 w-full"
              />
              <input type="file" onChange={handleAssignmentFile} className="mb-2" />
              <button onClick={postAssignment} className="px-4 py-2 bg-green-600 text-white rounded">
                Post Assignment
              </button>
            </div>
            <h3 className="font-semibold">Existing Assignments</h3>
            {assignments.map(a => (
              <div key={a.id} className="border p-2 my-1 rounded">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                {a.file && <a href={`http://localhost:8000/${a.file}`} target="_blank" rel="noreferrer">Download File</a>}
                <p>Posted by: {a.postedBy}</p>
                <p>Date: {a.date}</p>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-2xl font-bold">Welcome, Faculty!</h2>
            <p>Use the sidebar to manage timetable, announcements, attendance, and assignments.</p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "home", label: "Home" },
    { key: "timetable", label: "Timetable" },
    { key: "announcements", label: "Announcements" },
    { key: "attendance", label: "Attendance" },
    { key: "assignments", label: "Assignments" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
        <h2 className="text-center text-2xl font-bold mb-6">Faculty Panel</h2>
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`block w-full text-left p-2 my-1 rounded hover:bg-gray-700 ${
              activeSection === item.key ? "bg-blue-600" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto">{renderSection()} {message && <p className="mt-2 text-green-600">{message}</p>}</div>
    </div>
  );
};

export default FacultyDashboard;
