import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";

function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();
  const navigate = useNavigate();

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in:", user);

      const q = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Student record not found.");
        return;
      }

      const studentDoc = snapshot.docs[0];
      const student = studentDoc.data();
      console.log("Student record:", student);

      navigate("/form");
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="glass-card login-card">
      <div className="login-header">
        <h1>Student Login</h1>
        <p>Welcome back! Please enter your details.</p>
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={login} className="login-button">
        Sign In
      </button>

      <div className="login-footer">
        <p className="login-footer-text">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;