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


  // AI timetable inputs
const [classesList, setClassesList] = useState([{ name: "", subjects: [] }]);
const [aiTeachersList, setAITeachersList] = useState([{ name: "", subjects: [] }]);


  //announcements 
  const [announcementTitle, setAnnouncementTitle] = useState("");
const [announcementMessage, setAnnouncementMessage] = useState("");
const [targetAudience, setTargetAudience] = useState("both"); // options: 'faculty', 'student', 'both'
const [announcementResponse, setAnnouncementResponse] = useState("");


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

  const sendAnnouncement = async () => {
  if (!announcementTitle || !announcementMessage) {
    setAnnouncementResponse("Title and message are required");
    return;
  }
try {
  const res = await fetch("http://localhost:8000/announcements", {   // ✅ changed
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: announcementTitle,
      message: announcementMessage,
      postedBy: "Admin", // or admin name
      target: targetAudience
    })
  });

  const data = await res.json();
  if (res.ok) {
    setAnnouncementResponse("Announcement posted successfully!");
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setTargetAudience("both");
  } else {
    setAnnouncementResponse(data.error || "Error posting announcement");
  }
} catch (err) {
  console.error(err);
  setAnnouncementResponse("Server error");
}
  }
const handleGenerateAITimetable = async () => {
  const filteredClasses = classesList
    .filter(c => c.name.trim() !== "" && Array.isArray(c.subjects) && c.subjects.length > 0)
    .map(c => ({ ...c, subjects: c.subjects.filter(s => s.trim() !== "") }));

  const filteredTeachers = aiTeachersList
    .filter(t => t.name.trim() !== "" && Array.isArray(t.subjects) && t.subjects.length > 0)
    .map(t => ({ ...t, subjects: t.subjects.filter(s => s.trim() !== "") }));

  if (filteredClasses.length === 0) {
    setMessage("Please add at least one class with subjects.");
    return;
  }
  if (filteredTeachers.length === 0) {
    setMessage("Please add at least one teacher with subjects.");
    return;
  }

  const payload = {
    classes: filteredClasses,
    teachers: filteredTeachers,
    constraints: {
      periodsPerDay: 5,
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  };

  console.log("Sending payload:", payload); // <-- Add this for debugging

  try {
    const res = await fetch("http://localhost:8000/generate_timetable_ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      setTimetableData(data.timetable);
      setMessage("AI timetable generated successfully!");
    } else {
      setMessage(data.error || "Error generating AI timetable");
    }
  } catch (err) {
    console.error(err);
    setMessage("Server error while generating AI timetable");
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
  {/* <h2 className="text-2xl font-bold mb-4">Generate Timetable</h2> */}

  {/* --- Manual Timetable ---
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
  ))} */}
{/*   
  <button
    onClick={handleGenerateTimetable}
    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Generate Timetable
  </button>
  */}
  {/* --- AI Timetable --- */}
<div className="mt-8 p-4 border rounded">
  <h3 className="text-xl font-bold mb-3">AI Timetable Generator</h3>

  {/* Classes Input */}
  <h4 className="font-semibold">Classes</h4>
  {classesList.map((cls, idx) => (
    <div key={idx} className="mb-2 border p-2 rounded">
      <input
        type="text"
        placeholder={`Class ${idx + 1} Name`}
        value={cls.name}
        onChange={(e) => {
          const updated = [...classesList];
          updated[idx].name = e.target.value;
          setClassesList(updated);
        }}
        className="border p-2 m-1 rounded w-60"
      />
      <div className="ml-4">
        <h5 className="font-semibold">Subjects</h5>
        {cls.subjects.map((subj, sIdx) => (
          <input
            key={sIdx}
            type="text"
            placeholder={`Subject ${sIdx + 1}`}
            value={subj}
            onChange={(e) => {
              const updated = [...classesList];
              updated[idx].subjects[sIdx] = e.target.value;
              setClassesList(updated);
            }}
            className="border p-2 m-1 rounded w-52"
          />
        ))}
        <button
          onClick={() => {
            const updated = [...classesList];
            updated[idx].subjects.push("");
            setClassesList(updated);
          }}
          className="px-2 py-1 bg-green-600 text-white rounded mt-1"
        >
          Add Subject
        </button>
      </div>
    </div>
  ))}
  <button
    onClick={() => setClassesList([...classesList, { name: "", subjects: [] }])}
    className="px-2 py-1 bg-green-600 text-white rounded mt-1"
  >
    Add Class
  </button>

  {/* Teachers Input */}
  <h4 className="font-semibold mt-3">Teachers</h4>
  {aiTeachersList.map((t, idx) => (
    <div key={idx} className="mb-2 border p-2 rounded">
      <input
        type="text"
        placeholder={`Teacher ${idx + 1} Name`}
        value={t.name}
        onChange={(e) => {
          const updated = [...aiTeachersList];
          updated[idx].name = e.target.value;
          setAITeachersList(updated);
        }}
        className="border p-2 m-1 rounded w-60"
      />
      <div className="ml-4">
        <h5 className="font-semibold">Subjects</h5>
        {t.subjects.map((subj, sIdx) => (
          <input
            key={sIdx}
            type="text"
            placeholder={`Subject ${sIdx + 1}`}
            value={subj}
            onChange={(e) => {
              const updated = [...aiTeachersList];
              updated[idx].subjects[sIdx] = e.target.value;
              setAITeachersList(updated);
            }}
            className="border p-2 m-1 rounded w-52"
          />
        ))}
        <button
          onClick={() => {
            const updated = [...aiTeachersList];
            updated[idx].subjects.push("");
            setAITeachersList(updated);
          }}
          className="px-2 py-1 bg-green-600 text-white rounded mt-1"
        >
          Add Subject
        </button>
      </div>
    </div>
  ))}
  <button
    onClick={() => setAITeachersList([...aiTeachersList, { name: "", subjects: [] }])}
    className="px-2 py-1 bg-green-600 text-white rounded mt-1"
  >
    Add Teacher
  </button>

  <button
    onClick={handleGenerateAITimetable}
    className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
  >
    Generate AI Timetable
  </button>
</div>


  {/* --- Display AI Generated Timetable --- */}
  {Object.keys(timetableData).length > 0 && (
    <div className="mt-6 p-4 border rounded">
      <h3 className="font-bold mb-2">Generated Timetable</h3>
      {Object.entries(timetableData).map(([day, periods]) => (
        <div key={day} className="mb-2">
          <h4 className="font-semibold">{day}</h4>
          {Object.entries(periods).map(([period, value]) => (
            <p key={period}>{period}: {value}</p>
          ))}
        </div>
      ))}
    </div>
  )}

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
case "Announcements":
  return(
        <div className="mb-4 border p-3 rounded">
  <input
    type="text"
    placeholder="Announcement Title"
    value={announcementTitle}
    onChange={(e) => setAnnouncementTitle(e.target.value)}
    className="mb-2 w-full p-2 border rounded"
  />
  <textarea
    placeholder="Message"
    value={announcementMessage}
    onChange={(e) => setAnnouncementMessage(e.target.value)}
    className="mb-2 w-full p-2 border rounded"
  />
  <select
    value={targetAudience}
    onChange={(e) => setTargetAudience(e.target.value)}
    className="mb-2 w-full p-2 border rounded"
  >
    <option value="faculty">Faculty</option>
    <option value="student">Student</option>
    <option value="both">Both</option>
  </select>
  <button
    onClick={sendAnnouncement}
    className="px-3 py-1 bg-blue-600 text-white rounded"
  >
    Post Announcement
  </button>
  {announcementResponse && <p className="text-green-600 mt-2">{announcementResponse}</p>}
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

      // case "add-classroom":
      //   return (
      //     <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      //       <h2 className="text-2xl font-bold mb-4">Add Classroom</h2>
      //       <input
      //         type="text"
      //         placeholder="Classroom Name"
      //         value={classroom.name}
      //         onChange={e => setClassroom({ ...classroom, name: e.target.value })}
      //         className="border p-2 w-full mb-2 rounded"
      //       />
      //       <input
      //         type="number"
      //         placeholder="Capacity"
      //         value={classroom.capacity}
      //         onChange={e => setClassroom({ ...classroom, capacity: e.target.value })}
      //         className="border p-2 w-full mb-2 rounded"
      //       />
      //       <button
      //         onClick={() => handleAdd("classroom", classroom)}
      //         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      //       >
      //         Add Classroom
      //       </button>
      //       {message && <p className="mt-2 text-green-600">{message}</p>}
      //     </div>
      //   );

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
    { key: "home", label: " Home" },
    { key: "add-student", label: " Add Student" },
    { key: "add-teacher", label: " Add Teacher" },
    // { key: "add-classroom", label: " Add Classroom" },
    { key: "view-students", label: " View Students" },
    { key: "view-teachers", label: " View Teachers" },
    
    { key: "generate", label: " Generate Timetable" },
    { key: "Announcements", label: "Announcements" },
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
