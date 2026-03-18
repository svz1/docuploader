import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function StudentLogin() {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {

    const q = query(
      collection(db, "students"),
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Student not found");
      return;
    }

    const studentDoc = snapshot.docs[0];

    navigate("/upload?studentId=" + studentDoc.id);

  };

  return (
    <div className="student-login-container">

      <h1>Student Login</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Continue
      </button>

    </div>
  );
}

export default StudentLogin;