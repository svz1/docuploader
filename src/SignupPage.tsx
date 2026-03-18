import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  query,
  where,
  getDocs,
  collection,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();

  const signup = async () => {
    try {
      const q = query(
        collection(db, "students"),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("You are not registered by the admin.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User created:", user);

      const studentDoc = snapshot.docs[0];

      await updateDoc(studentDoc.ref, {
        uid: user.uid
      });

      alert("Account created successfully!");
    } catch (error) {
      console.error(error);
      alert("Signup failed.");
    }
  };

  return (
    <div className="glass-card signup-card">
      <div className="signup-header">
        <h1>Create Account</h1>
        <p>Register to upload your documents.</p>
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
          placeholder="Create a secure password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={signup} className="signup-button">
        Create Account
      </button>

      <div className="signup-footer">
        <p className="signup-footer-text">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;