import React from "react";
import students from "./Students";
 
const Students = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student List</h1>
      <ul className="list-disc pl-6">
        {students.map((student) => (
          <li key={student.id} className="mb-2">
            {student.rollNo} - {student.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
 
export default Students;
 
 