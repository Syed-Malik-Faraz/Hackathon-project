import React from "react";
import AdminDashboard from "./components/AdminDashboard";
import Faculty from "./components/FacultyDashboard";
import StudentDashboard from "./components/StudentsDashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        {/* <Route path="/Students" element={<Students />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
