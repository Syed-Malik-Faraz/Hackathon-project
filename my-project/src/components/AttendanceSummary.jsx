// src/components/AttendanceSummary.js
import React from "react";
import students from "../data/Studentslist";
 
const AttendanceSummary = ({ attendance }) => {
  return (
    <div className="mt-6 p-6 max-w-3xl mx-auto bg-gray-100 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id} className="mb-2">
            {student.name} ({student.rollNo}) -{" "}
            <span className="font-semibold">
              {attendance[student.id] || "Not Marked"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
 
export default AttendanceSummary;


