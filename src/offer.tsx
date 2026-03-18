import { useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function Form() {

  const navigate = useNavigate();
  const auth = getAuth();

  const [photo, setPhoto] = useState(false);
  const [resume, setResume] = useState(false);
  const [idProof, setIdProof] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    try {

      const q = query(
        collection(db, "students"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Student record not found");
        return;
      }

      const studentDoc = snapshot.docs[0];

      await updateDoc(studentDoc.ref, {

        documents: {
          photo,
          resume,
          idProof
        },

        status: "documents_uploaded"

      });

      console.log("Documents updated");

      navigate("/sign-offer");

    } catch (error) {

      console.error(error);
      alert("Submission failed");

    }

  };

  return (
    <div className="glass-card offer-confirm-card">
      <div className="offer-confirm-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 className="offer-confirm-title">Confirm Document Submission</h1>
      <p className="offer-confirm-text">Please confirm that you have uploaded all required files to proceed.</p>

      <form onSubmit={handleSubmit}>
        <div className="offer-confirm-list">
          <div className="offer-confirm-item">
            <div className="offer-confirm-item-title">Photo</div>
            <input
              type="file"
              onChange={(e) => setPhoto(!!e.target.files?.[0])}
            />
          </div>

          <div className="offer-confirm-item">
            <div className="offer-confirm-item-title">Resume</div>
            <input
              type="file"
              onChange={(e) => setResume(!!e.target.files?.[0])}
            />
          </div>

          <div className="offer-confirm-item">
            <div className="offer-confirm-item-title">ID Proof</div>
            <input
              type="file"
              onChange={(e) => setIdProof(!!e.target.files?.[0])}
            />
          </div>
        </div>

        <button type="submit">
          Proceed to Offer
        </button>
      </form>
    </div>
  );
}

export default Form;