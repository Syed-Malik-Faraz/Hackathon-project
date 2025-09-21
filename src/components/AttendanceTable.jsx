// src/components/AttendanceTable.js
import React, { useState } from "react";
import students from "../data/Studentslist";
 
const AttendanceTable = ({ onSubmit }) => {
  const [attendance, setAttendance] = useState({});
 
  // Toggle present/absent
  const handleAttendanceChange = (id, status) => {
    setAttendance({
      ...attendance,
      [id]: status,
    });
  };
 
  const handleSubmit = () => {
    onSubmit(attendance);
  };
 
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Roll No</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Present</th>
            <th className="border px-4 py-2">Absent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="border px-4 py-2">{student.rollNo}</td>
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  onChange={() => handleAttendanceChange(student.id, "Present")}
                />
              </td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  onChange={() => handleAttendanceChange(student.id, "Absent")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
 
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Submit Attendance
      </button>
    </div>
  );
};
 
export default AttendanceTable;
 
 