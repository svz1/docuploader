import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function Form() {

  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("studentId");

  const [name, setName] = useState("");

  const [photo, setPhoto] = useState(false);
  const [resume, setResume] = useState(false);
  const [idProof, setIdProof] = useState(false);

  useEffect(() => {

    const loadStudent = async () => {

      if (!studentId) return;

      const ref = doc(db, "students", studentId);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {

        const data = snapshot.data();

        setName(data.name);

        if (data.documents) {
          setPhoto(data.documents.photo || false);
          setResume(data.documents.resume || false);
          setIdProof(data.documents.idProof || false);
        }

      }

    };

    loadStudent();

  }, []);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!studentId) return;

    const ref = doc(db, "students", studentId);

    await updateDoc(ref, {
      documents: {
        photo,
        resume,
        idProof
      }
    });

    navigate(`/sign-offer?studentId=${studentId}`);

  };

  return (
    <div className="glass-card wide form-container">
      <div className="form-header">
        <h1>Welcome, {name}</h1>
        <p>Please complete the onboarding steps below.</p>
        <div className="form-badges">
          <span className="badge badge-green">1. Documents</span>
          <span className="badge badge-gray">2. Offer Letter</span>
        </div>
      </div>

      <div className="form-section-bg">
        <h2 className="form-section-title">Your Details</h2>
        <div className="form-group form-group-no-margin">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className="form-section-title">Submit Required Documents</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-docs-grid">
            <div className="form-doc-card">
              <div className="form-doc-title">Photo</div>
              <input
                type="file"
                onChange={(e) => setPhoto(!!e.target.files?.[0])}
              />
            </div>

            <div className="form-doc-card">
              <div className="form-doc-title">Resume</div>
              <input
                type="file"
                onChange={(e) => setResume(!!e.target.files?.[0])}
              />
            </div>

            <div className="form-doc-card">
              <div className="form-doc-title">ID Proof</div>
              <input
                type="file"
                onChange={(e) => setIdProof(!!e.target.files?.[0])}
              />
            </div>
          </div>

          <button type="submit">
            Continue to Offer Letter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Form;