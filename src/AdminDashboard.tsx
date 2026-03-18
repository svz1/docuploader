import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

function AdminDashboard() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [students, setStudents] = useState<any[]>([]);

  const addStudent = async () => {

    if (!name || !email) return;

    await addDoc(collection(db, "students"), {
      name,
      email,
      documents: {
        photo: false,
        resume: false,
        idProof: false
      },
      offerSigned: false
    });

    setName("");
    setEmail("");

  };

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "students"), (snapshot) => {

      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStudents(list);

    });

    return () => unsub();

  }, []);

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage student registrations and verify document statuses.</p>
      </div>

      <div className="glass-card wide">
        <h2 className="admin-section-title">Add New Student</h2>

        <div className="admin-form-row">
          <div className="form-group admin-input-group">
            <label>Student Name</label>
            <input
              placeholder="e.g. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group admin-input-group">
            <label>Email Address</label>
            <input
              placeholder="jane.smith@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button onClick={addStudent} className="admin-add-button">
            Add Student
          </button>
        </div>
      </div>

      <div className="glass-card wide admin-table-card">
        <h2 className="admin-section-title-sm">Registered Students</h2>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Photo</th>
                <th>Resume</th>
                <th>ID Proof</th>
                <th>Offer Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="student-name">{student.name}</div>
                    <div className="student-email">{student.email}</div>
                  </td>

                  <td>
                    {student.documents?.photo
                      ? <div className="status-cell">
                        <span className="badge badge-green">Submitted</span>
                        <button className="admin-download-btn">Download</button>
                      </div>
                      : <span className="badge badge-gray">Pending</span>}
                  </td>

                  <td>
                    {student.documents?.resume
                      ? <div className="status-cell">
                        <span className="badge badge-green">Submitted</span>
                        <button className="admin-download-btn">Download</button>
                      </div>
                      : <span className="badge badge-gray">Pending</span>}
                  </td>

                  <td>
                    {student.documents?.idProof
                      ? <div className="status-cell">
                        <span className="badge badge-green">Submitted</span>
                        <button className="admin-download-btn">Download</button>
                      </div>
                      : <span className="badge badge-gray">Pending</span>}
                  </td>

                  <td>
                    {student.offerSigned
                      ? <span className="badge badge-green">Signed</span>
                      : <span className="badge badge-yellow">Pending</span>}
                  </td>

                  <td className="admin-actions-cell">
                    <a
                      href={`/form?studentId=${student.id}`}
                      target="_blank"
                      className="admin-view-profile-btn"
                    >
                      View Profile
                    </a>

                    <button className="admin-download-all-btn">
                      Download All Docs
                    </button>
                  </td>

                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty-state">
                    No students have been registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;