import React, { useEffect, useState } from "react";

const StudentsDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");

  const [timetable, setTimetable] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [message, setMessage] = useState("");

  const studentId = "s1"; // Update dynamically in real app

  // --- FETCH DATA ---
  useEffect(() => {
    fetch("http://localhost:8000/student/timetable")
      .then(res => res.json())
      .then(data => setTimetable(data.timetable || data))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/student/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data || []))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/student/attendance")
      .then(res => res.json())
      .then(data => setAttendance(data || []))
      .catch(err => console.error(err));

    fetch("http://localhost:8000/student/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data || []))
      .catch(err => console.error(err));
  }, []);

  // --- ASSIGNMENT SUBMISSION ---
  const handleFileChange = (assignmentId, file) => {
    setSubmissionFiles(prev => ({ ...prev, [assignmentId]: file }));
  };

  const submitAssignment = async (assignmentId) => {
    const file = submissionFiles[assignmentId];
    if (!file) {
      setMessage("Please select a file to submit.");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Assignment submitted successfully!");
        // Update assignments state with new submission
        setAssignments(prev =>
          prev.map(a =>
            a.id === assignmentId ? { ...a, submissions: [...(a.submissions || []), data.submission] } : a
          )
        );
      } else {
        setMessage(data.error || "Error submitting assignment");
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
            <h2 className="text-xl font-bold mb-2">Announcements</h2>
            {announcements.map(a => (
              <div key={a.id} className="border p-2 mb-2 rounded">
                <strong>{a.title}</strong> by {a.postedBy}
                <p>{a.message}</p>
              </div>
            ))}
          </div>
        );

      case "attendance":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Attendance</h2>
            <ul>
              {attendance.map(a => (
                <li key={a.course}>
                  {a.course}: {a.present}/{a.total} ({a.percent}%)
                </li>
              ))}
            </ul>
          </div>
        );

      case "assignments":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2">Assignments</h2>
            {assignments.map(a => (
              <div key={a.id} className="mb-4 border p-3 rounded">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                {a.file && <a href={`http://localhost:8000/${a.file}`} target="_blank" rel="noreferrer">Download Assignment</a>}
                <p>Posted by: {a.postedBy}</p>
                <p>Date: {a.date}</p>

                {/* Submission */}
                <input type="file" onChange={e => handleFileChange(a.id, e.target.files[0])} className="mb-2" />
                <button onClick={() => submitAssignment(a.id)} className="px-3 py-1 bg-green-600 text-white rounded mb-2">Submit</button>

                {/* Progress */}
                <h5 className="font-semibold">Submissions:</h5>
                <ul>
                  {(a.submissions || []).map(s => (
                    <li key={s.studentId}>
                      {s.studentId} - <a href={`http://localhost:8000/${s.file}`} target="_blank" rel="noreferrer">View</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-2xl font-bold">Welcome, Student!</h2>
            <p>Use the sidebar to view timetable, announcements, attendance, and assignments.</p>
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
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
        <h2 className="text-center text-2xl font-bold mb-6">Student Panel</h2>
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

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderSection()}
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default StudentsDashboard;
