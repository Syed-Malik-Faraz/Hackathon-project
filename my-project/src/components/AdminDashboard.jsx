import React, { useState } from "react";
import { Link } from "react-router-dom";
import studentsData from "../data/Students"; // existing students data
 
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
const [faculties, setFaculties] = useState([]);
 
const [classrooms, setClassrooms] = useState([]);
 
 
  const [students, setStudents] = useState(studentsData);
  const [courses, setCourses] = useState([]); // start empty, dynamic
 
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
 const [fetchError, setFetchError] = useState(null);

  const handleGenerateTimetable = async () => {
  setLoading(true);
  setFetchError(null);   // reset previous errors
  setTimetableData(null); // reset previous timetable

  const payload = {
    faculties: [
      { name: "John", subjects: ["Math", "Physics"] },
      { name: "Sarah", subjects: ["English", "History"] },
      { name: "Mike", subjects: ["Chemistry", "Biology"] },
    ],
    classes: [
      { name: "Class A", subjects: ["Math", "English", "Chemistry"] },
      { name: "Class B", subjects: ["Physics", "History", "Biology"] },
    ],
    constraints: {
      periods_per_day: 6,
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      sessions_per_subject_per_week: 5,
    },
  };

  try {
    const response = await fetch("http://localhost:8000/generate_timetable", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


    if (!response.ok) {
      const text = await response.text();
      setFetchError(`Failed to generate timetable. HTTP ${response.status}`);
      console.error("Backend error:", text);
      return;
    }

    const data = await response.json();
    setTimetableData(data);
    console.log("Generated Timetable:", data);

  } catch (err) {
    console.error("Request failed:", err);
    setFetchError(`Request failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const renderSection = () => {
    switch (activeSection) {
 
 
        case "faculty":
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Add Faculty
      </h2>
 
      {/* Add Faculty Form */}
      <form
        className="space-y-4 mb-6"
        onSubmit={(e) => {
          e.preventDefault();
 
          const name = e.target.name.value.trim();
          const email = e.target.email.value.trim();
          const password = e.target.password.value.trim();
          const role = e.target.role.value;
 
          if (!name || !email || !password || !role) {
            alert("Please fill in all fields!");
            return;
          }
 
          // Add faculty dynamically
          setFaculties((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              name,
              email,
              role,
            },
          ]);
 
          // Reset form
          e.target.reset();
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Faculty Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="role"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Role</option>
          <option value="faculty">Faculty</option>
        </select>
 
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Add Faculty
        </button>
      </form>
 
      {/* Display Dynamic Faculty List */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">Faculty List</h3>
      {faculties.length === 0 ? (
        <p className="text-gray-500">No faculty added yet.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {faculties.map((f) => (
            <li key={f.id} className="text-lg">
              {f.name} - {f.email} - Role: {f.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
 
       
      case "courses":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Add Course</h2>
            <form
              className="space-y-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.name.value.trim();
                const code = e.target.code.value.trim();
                const hours = e.target.hours.value.trim();
                if (!name || !code || !hours) return;
                setCourses((prev) => [
                  ...prev,
                  { id: prev.length + 1, name, code, hours: Number(hours) },
                ]);
                e.target.reset();
              }}
            >
              <input type="text" name="name" placeholder="Course Name" className="w-full p-3 border border-gray-300 rounded-lg" required />
              <input type="text" name="code" placeholder="Course Code" className="w-full p-3 border border-gray-300 rounded-lg" required />
              <input type="number" name="hours" placeholder="Hours per Week" className="w-full p-3 border border-gray-300 rounded-lg" required />
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">Add Course</button>
            </form>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Course List</h3>
            <ul className="list-disc pl-6 space-y-2">
              {courses.map((course) => (
                <li key={course.id} className="text-lg">
                  {course.code} - {course.name} ({course.hours} hrs/week)
                </li>
              ))}
            </ul>
          </div>
        );
 
 
 
case "classrooms":
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Add Classroom
      </h2>
 
      {/* Add Classroom Form */}
      <form
        className="space-y-4 mb-6"
        onSubmit={(e) => {
          e.preventDefault();
 
          // Get form values
          const name = e.target.name.value.trim();
          const capacity = e.target.capacity.value.trim();
          const equipment = e.target.equipment.value.trim();
 
          if (!name || !capacity) {
            alert("Room name and capacity are required!");
            return;
          }
 
          // Add classroom to state dynamically
          setClassrooms((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              name,
              capacity: Number(capacity),
              equipment: equipment || "None",
            },
          ]);
 
          // Clear form
          e.target.reset();
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Room Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="equipment"
          placeholder="Equipment (comma separated)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Add Classroom
        </button>
      </form>
 
      {/* Display Dynamic Classroom List */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">Classroom List</h3>
      {classrooms.length === 0 ? (
        <p className="text-gray-500">No classrooms added yet.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {classrooms.map((room) => (
            <li key={room.id} className="text-lg">
              <strong>{room.name}</strong> - Capacity: {room.capacity} - Equipment: {room.equipment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
 
      case "students":
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Add Student</h2>
            <form
              className="space-y-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.name.value.trim();
                const rollNo = e.target.rollNo.value.trim();
                if (!name || !rollNo) return;
                setStudents((prev) => [
                  ...prev,
                  { id: prev.length + 1, name, rollNo },
                ]);
                e.target.reset();
              }}
            >
              <input type="text" name="name" placeholder="Student Name" className="w-full p-3 border border-gray-300 rounded-lg" required />
              <input type="text" name="rollNo" placeholder="Roll Number" className="w-full p-3 border border-gray-300 rounded-lg" required />
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">Add Student</button>
            </form>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Student List</h3>
            <ul className="list-disc pl-6 space-y-2">
              {students.map((student) => (
                <li key={student.id} className="text-lg">{student.rollNo} - {student.name}</li>
              ))}
            </ul>
          </div>
        );
 

     case "timetable":
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Generate Timetable</h2>

      <button
        onClick={handleGenerateTimetable}
        className={`bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
        }`}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Display errors if fetch failed */}
      {fetchError && (
        <p className="text-red-600 mt-4 font-semibold">{fetchError}</p>
      )}

      {/* Display timetable if available */}
      {timetableData?.timetable ? (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Generated Timetable</h3>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Day / Period</th>
                {Object.keys(timetableData.timetable["Monday"] || {}).map((_, i) => (
                  <th key={i} className="border border-gray-300 px-4 py-2">Period {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(timetableData.timetable).map(([day, periods]) => (
                <tr key={day}>
                  <td className="border border-gray-300 px-4 py-2 font-bold">{day}</td>
                  {Object.entries(periods).map(([period, info]) => (
                    <td key={period} className="border border-gray-300 px-4 py-2">
                      <div><strong>Class:</strong> {info.class}</div>
                      <div><strong>Subject:</strong> {info.subject}</div>
                      <div><strong>Teacher:</strong> {info.teacher}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <p className="text-gray-500 mt-4">No timetable generated yet.</p>
      ) : null}
    </div>
  );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Welcome to the Admin Dashboard</h2>
            <p className="mt-3 text-base sm:text-lg">
              Use the sidebar to manage faculties, courses, classrooms, students, and timetables.
            </p>
          </div>
        );
    }
  };
 
  const menuItems = [
    { key: "home", label: "🏠 Home" },
    { key: "faculty", label: "👨‍🏫 Add Faculty" },
    { key: "courses", label: "📚 Add Courses" },
    { key: "classrooms", label: "🏫 Add Classrooms" },
    { key: "students", label: "👩‍🎓 Add Students" },
    { key: "timetable", label: "🗓 Generate Timetable" },
  ];
 
  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 flex flex-col p-5 shadow-lg transform transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <h3 className="text-2xl font-bold mb-10 text-center text-white">Admin Panel</h3>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveSection(item.key); setIsSidebarOpen(false); }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${activeSection === item.key ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"}`}
            >
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
 
      <button className="lg:hidden absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-lg shadow-md z-50" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✖" : "☰"}
      </button>
 
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50">{renderSection()}</div>
    </div>
  );
};
 
export default AdminDashboard;
 
 