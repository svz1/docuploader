import { useState, useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import letterHtmlTemplate from './letter.html?raw';

const parseOfferLetterTemplate = (template: string) => {
  const styleMatch = template.match(/<style[^>]*>[\s\S]*?<\/style>/i);
  const bodyMatch = template.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const styleContent = styleMatch ? styleMatch[0] : "";
  const bodyContent = bodyMatch ? bodyMatch[1] : template;

  return {
    styleContent,
    bodyContent,
  };
};

const { styleContent: letterStyle, bodyContent: letterBody } = parseOfferLetterTemplate(letterHtmlTemplate);

function SignOffer() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("studentId");

  const [name, setName] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("");
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [otherPlanName, setOtherPlanName] = useState("");
  const [otherInitialPayment, setOtherInitialPayment] = useState("");
  const [otherSecondInstallment, setOtherSecondInstallment] = useState("");
  const [otherInstallmentCount, setOtherInstallmentCount] = useState("");

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) return;
      const ref = doc(db, "students", studentId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setName(snapshot.data().name);
      }
    };
    loadStudent();
  }, [studentId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgba(255,255,255,0)",
      penColor: "#000",
      minWidth: 1,
      maxWidth: 2.5,
    });

    // You can save the drawn signature on-demand using "Save Signature" button.

    signaturePadRef.current = signaturePad;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
      }
      signaturePad.clear();
      if (signatureDataUrl) {
        signaturePad.fromDataURL(signatureDataUrl);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      signaturePad.clear();
      signaturePadRef.current = null;
    };

  }, [signatureDataUrl]);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setSignatureDataUrl(null);
    setSignatureError(null);
  };

  const saveSignature = () => {
    const pad = signaturePadRef.current;
    if (!pad || pad.isEmpty()) {
      setSignatureError("Please sign in the box before accepting.");
      return;
    }
    setSignatureDataUrl(pad.toDataURL("image/png"));
    setSignatureError(null);
  };

  const generatePDF = async () => {
    const element = document.getElementById("offer-document-container");
    if (!element) return null;

    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflowY;
    element.style.maxHeight = 'none';
    element.style.overflowY = 'visible';

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const pageElements = Array.from(element.querySelectorAll('.page')) as HTMLElement[];
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      if (!pageElements.length) {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
        return pdf;
      }

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, { scale: 2, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      }

      return pdf;
    } catch (error) {
      console.error("Failed to generate PDF", error);
      return null;
    } finally {
      element.style.maxHeight = originalMaxHeight;
      element.style.overflowY = originalOverflow;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
if (!studentId) return;
      if (!paymentPlan) {
        alert("Please select a payment plan before accepting the offer.");
        return;
      }
      if (paymentPlan === "Other" && !otherPlanName.trim()) {
        alert("Please provide the other payment plan name.");
        return;
      }
      if (!signatureDataUrl) {
        alert("Please sign in the canvas area before accepting.");
        return;
      }

    setIsGenerating(true);
    setProgressText("Preparing offer letter...");

    try {
      setProgressText("Capturing preview...");
      const pdf = await generatePDF();
      if (pdf) {
        setProgressText("Generating PDF for download...");
        pdf.save(`${name.replace(/\s+/g, '_')}_Offer_Letter.pdf`);
      }

      setProgressText("Saving acceptance...");
      const ref = doc(db, "students", studentId);
      await updateDoc(ref, {
        offerSigned: true,
        signatureImage: signatureDataUrl
      });

      setProgressText("Done! Redirecting...");
      navigate('/thank-you');
    } catch (error) {
      console.error(error);
      alert("Something went wrong while accepting the offer.");
    } finally {
      setIsGenerating(false);
      setProgressText("");
    }
  };

  const checkMark = `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;font-weight:bold;color:#1a2a4a;">✔</span>`;
  
  const finalHtml = (letterStyle + letterBody)
    .replace(/\{\{NAME\}\}/g, name || "Jenson Thomas")
    .replace(/\{\{DATE\}\}/g, currentDate)
    .replace(/\{\{PAYMENT_PLAN\}\}/g, paymentPlan === "Other" ? (otherPlanName || "Other payment plan") : paymentPlan)
    .replace(/\{\{CHECK_PLAN_I\}\}/g, paymentPlan === "Plan I" ? checkMark : "")
    .replace(/\{\{CHECK_PLAN_II\}\}/g, paymentPlan === "Plan II" ? checkMark : "")
    .replace(/\{\{CHECK_PLAN_III\}\}/g, paymentPlan === "Plan III" ? checkMark : "")
    .replace(/\{\{OTHER_PLAN_NAME\}\}/g, paymentPlan === "Other" ? (otherPlanName || "Other payment plan") : "N/A")
    .replace(/\{\{OTHER_INITIAL\}\}/g, paymentPlan === "Other" ? (otherInitialPayment || "N/A") : "N/A")
    .replace(/\{\{OTHER_SECOND\}\}/g, paymentPlan === "Other" ? (otherSecondInstallment || "N/A") : "N/A")
    .replace(/\{\{OTHER_INSTALLMENTS\}\}/g, paymentPlan === "Other" ? (otherInstallmentCount || "N/A") : "N/A")
    .replace(/\{\{SIGNATURE\}\}/g, signatureDataUrl 
      ? `<img src="${signatureDataUrl}" alt="Candidate Signature" style="max-height: 50px; max-width: 100%; object-fit: contain;" />` 
      : `<span style="color: #aaa; font-style: italic; font-size: 0.875rem;">Signature Placed Here</span>`);

  return (
    <div style={{ position: 'relative' }}>
      {isGenerating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: 'min(480px, 94vw)', padding: '16px 20px', boxShadow: '0 12px 30px rgba(0,0,0,0.2)', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1d4ed8', animation: 'pulse 1s infinite' }} />
            <span>{progressText || 'Generating offer letter for download...'}</span>
          </div>
        </div>
      )}
      <div className="glass-card wide sign-offer-card">
      <div className="sign-offer-header">
        <h1 className="sign-offer-title">Review Offer Letter</h1>
        <p>Please review the terms of your offer letter below and sign to accept.</p>
        <div className="sign-offer-badges">
          <span className="badge badge-gray">1. Documents</span>
          <span className="badge badge-green">2. Offer Letter</span>
        </div>
      </div>
      
      <div 
        id="offer-document-container" 
        className="sign-offer-container"
        style={{ overflowY: 'auto', maxHeight: '500px', border: '1px solid #ccc', borderRadius: '4px' }}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />

      <form onSubmit={handleSubmit} className="sign-offer-form">
        {isGenerating && (
          <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.8rem', borderRadius: '6px', background: '#eef3ff', border: '1px solid #dbe4ff', color: '#1a3f8f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#1d4ed8', animation: 'pulse 1s infinite' }} />
            {progressText || 'Generating your offer letter...'}
          </div>
        )}
        <div className="form-group" style={{ width: '100%', maxWidth: '400px', textAlign: 'left' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', textAlign: 'center', fontSize: '1.125rem' }}>Select Payment Plan</label>
          {!paymentPlan && <div style={{ color: '#b91c1c', fontSize: '0.9rem', textAlign: 'center', marginBottom: '0.45rem' }}>Please choose a payment plan before you can accept and download.</div>}
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentPlan" 
                value="Plan I" 
                checked={paymentPlan === "Plan I"} 
                onChange={(e) => setPaymentPlan(e.target.value)} 
                style={{ margin: 0 }}
              /> Plan I – One-Time Payment (£1500)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentPlan" 
                value="Plan II" 
                checked={paymentPlan === "Plan II"} 
                onChange={(e) => setPaymentPlan(e.target.value)} 
                style={{ margin: 0 }}
              /> Plan II – 3 months (£500 * 3)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentPlan" 
                value="Plan III" 
                checked={paymentPlan === "Plan III"} 
                onChange={(e) => setPaymentPlan(e.target.value)} 
                style={{ margin: 0 }}
              /> Plan III – 5 months (£300 * 5)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentPlan"
                value="Other"
                checked={paymentPlan === "Other"}
                onChange={(e) => setPaymentPlan(e.target.value)}
                style={{ margin: 0 }}
              /> Other payment plan
            </label>
          </div>

          {paymentPlan === "Other" && (
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#f9fafb' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Other plan name</label>
                <input
                  type="text"
                  value={otherPlanName}
                  onChange={(e) => setOtherPlanName(e.target.value)}
                  placeholder="e.g. 6-month installment plan"
                  style={{ width: '100%', padding: '0.45rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Initial payment amount</label>
                  <input
                    type="text"
                    value={otherInitialPayment}
                    onChange={(e) => setOtherInitialPayment(e.target.value)}
                    placeholder="e.g. £300"
                    style={{ width: '100%', padding: '0.45rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Second installment amount</label>
                  <input
                    type="text"
                    value={otherSecondInstallment}
                    onChange={(e) => setOtherSecondInstallment(e.target.value)}
                    placeholder="e.g. £250"
                    style={{ width: '100%', padding: '0.45rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Total number of installments</label>
                <input
                  type="text"
                  value={otherInstallmentCount}
                  onChange={(e) => setOtherInstallmentCount(e.target.value)}
                  placeholder="e.g. 6"
                  style={{ width: '100%', padding: '0.45rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-group sign-offer-upload">
          <label className="sign-offer-label">Draw Your Signature</label>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.25rem', background: '#fff', maxWidth: '400px' }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '200px', touchAction: 'none', cursor: 'crosshair', borderRadius: '6px' }}
            />
          </div>
          {signatureError && <div style={{ color: '#b91c1c', marginTop: '0.35rem' }}>{signatureError}</div>}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button type="button" onClick={() => { saveSignature(); }} className="sign-offer-btn" style={{ minWidth: '120px' }}>
              Save Signature
            </button>
            <button type="button" onClick={clearSignature} className="sign-offer-btn" style={{ minWidth: '120px' }}>
              Clear
            </button>
            <span style={{ alignSelf: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
              {signatureDataUrl ? 'Signature captured ✓' : 'Sign above and click Save Signature'}
            </span>
          </div>
        </div>
        <button type="submit" disabled={isGenerating} className={`sign-offer-btn ${isGenerating ? 'sign-offer-btn-generating' : ''}`}>
          {isGenerating ? "Generating Document..." : "Accept & Download Offer"}
        </button>
        {isGenerating && (
          <div style={{ marginTop: '0.75rem', color: '#111', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="loading-dot" style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#2f6bff', animation: 'pulse 1s infinite' }}></span>
              {progressText || 'Generating your offer letter...'}
            </span>
          </div>
        )}
      </form>
    </div>
  </div>
  );
}

export default SignOffer;