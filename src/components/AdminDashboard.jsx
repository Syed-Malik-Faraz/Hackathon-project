import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [timetableData, setTimetableData] = useState({});
  const [manualTimetable, setManualTimetable] = useState({});
  const [message, setMessage] = useState("");

  // Form states
  const [student, setStudent] = useState({ name: "", email: "", username: "", password: "" });
  const [teacher, setTeacher] = useState({ name: "", email: "", username: "", password: "" });
  const [classroom, setClassroom] = useState({ name: "", capacity: "" });

  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  // Fetch lists for view sections
  useEffect(() => {
    if (activeSection === "view-students") {
      fetch("http://localhost:8000/students")
        .then(res => res.json())
        .then(data => setStudentsList(data))
        .catch(err => console.error(err));
    } else if (activeSection === "view-teachers") {
      fetch("http://localhost:8000/teachers")
        .then(res => res.json())
        .then(data => setTeachersList(data))
        .catch(err => console.error(err));
    }
  }, [activeSection]);

  // Fetch existing timetable
  useEffect(() => {
    fetch("http://localhost:8000/timetable")
      .then(res => res.json())
      .then(data => setManualTimetable(data))
      .catch(err => console.error(err));
  }, []);

  // --- Timetable Handlers ---
  const handleGenerateTimetable = async () => {
    try {
      const res = await fetch("http://localhost:8000/generate_timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableData }),
      });
      const data = await res.json();
      setMessage(res.ok ? "Timetable generated successfully!" : data.error);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleChange = (day, period, value) => {
    setTimetableData(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [period]: value },
    }));
  };

  const handleManualChange = (day, period, value) => {
    setManualTimetable(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [period]: value },
    }));
  };

  const saveManualTimetable = async () => {
    try {
      const res = await fetch("http://localhost:8000/generate_timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableData: manualTimetable }),
      });
      const data = await res.json();
      setMessage(data.message || "Manual timetable saved!");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  // --- Add Student / Teacher / Classroom ---
  const handleAdd = async (type, data) => {
    try {
      const res = await fetch(`http://localhost:8000/add-${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      setMessage(res.ok ? `${type} added successfully!` : resData.error);

      if (type === "student") setStudent({ name: "", email: "", username: "", password: "" });
      if (type === "teacher") setTeacher({ name: "", email: "", username: "", password: "" });
      if (type === "classroom") setClassroom({ name: "", capacity: "" });
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  // --- Render Sections ---
  const renderSection = () => {
    switch (activeSection) {
      case "generate":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Generate Timetable</h2>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
              <div key={day} className="mb-4">
                <h3 className="font-semibold">{day}</h3>
                {[1, 2, 3, 4, 5].map(p => (
                  <input
                    key={p}
                    type="text"
                    placeholder={`Period ${p} (Course - Room)`}
                    className="border p-2 m-1 rounded w-60"
                    onChange={e => handleChange(day, `Period ${p}`, e.target.value)}
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

            <div className="mt-6 p-4 border rounded">
              <h3 className="font-bold mb-2">Manual Timetable Editor</h3>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                <div key={day} className="mb-2">
                  <h4 className="font-semibold">{day}</h4>
                  {[1, 2, 3, 4, 5].map(p => (
                    <input
                      key={p}
                      type="text"
                      placeholder={`Period ${p}`}
                      className="border p-2 m-1 rounded w-60"
                      value={manualTimetable[day]?.[`Period ${p}`] || ""}
                      onChange={e => handleManualChange(day, `Period ${p}`, e.target.value)}
                    />
                  ))}
                </div>
              ))}
              <button
                onClick={saveManualTimetable}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Manual Timetable
              </button>
            </div>
            {message && <p className="mt-2 text-green-600">{message}</p>}
          </div>
        );

      case "add-student":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add Student</h2>
            {["name", "email", "username", "password"].map(field => (
              <input
                key={field}
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={student[field] || ""}
                onChange={e => setStudent({ ...student, [field]: e.target.value })}
                className="border p-2 w-full mb-2 rounded"
              />
            ))}
            <button
              onClick={() => handleAdd("student", student)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Student
            </button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
          </div>
        );

      case "add-teacher":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add Teacher</h2>
            {["name", "email", "username", "password"].map(field => (
              <input
                key={field}
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={teacher[field] || ""}
                onChange={e => setTeacher({ ...teacher, [field]: e.target.value })}
                className="border p-2 w-full mb-2 rounded"
              />
            ))}
            <button
              onClick={() => handleAdd("teacher", teacher)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Teacher
            </button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
          </div>
        );

      case "add-classroom":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add Classroom</h2>
            <input
              type="text"
              placeholder="Classroom Name"
              value={classroom.name}
              onChange={e => setClassroom({ ...classroom, name: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="number"
              placeholder="Capacity"
              value={classroom.capacity}
              onChange={e => setClassroom({ ...classroom, capacity: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <button
              onClick={() => handleAdd("classroom", classroom)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Classroom
            </button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
          </div>
        );

      case "view-students":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Students List</h2>
            <ul>
              {studentsList.map(s => (
                <li key={s.username}>
                  {s.name} ({s.username}) - {s.email}
                </li>
              ))}
            </ul>
          </div>
        );

      case "view-teachers":
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Teachers List</h2>
            <ul>
              {teachersList.map(t => (
                <li key={t.username}>
                  {t.name} ({t.username}) - {t.email}
                </li>
              ))}
            </ul>
          </div>
        );

      default:
        return (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold">Welcome, Admin!</h2>
            <p className="mt-2">
              Use the sidebar to manage students, teachers, classrooms, and generate timetables.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "generate", label: "📅 Generate Timetable" },
    { key: "add-student", label: "👨‍🎓 Add Student" },
    { key: "add-teacher", label: "👩‍🏫 Add Teacher" },
    { key: "add-classroom", label: "🏫 Add Classroom" },
    { key: "view-students", label: "👨‍🎓 View Students" },
    { key: "view-teachers", label: "👩‍🏫 View Teachers" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
        <h3 className="text-2xl font-bold mb-10 text-center">Admin Panel</h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map(item => (
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
      <div className="flex-1 p-6 overflow-y-auto">{renderSection()}</div>
    </div>
  );
};

export default AdminDashboard;
