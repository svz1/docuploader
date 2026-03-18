function ThankYou() {
  return (
    <div className="glass-card thank-you-card">
      <div className="thank-you-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 className="thank-you-title">Thank You!</h1>
      <p className="thank-you-text">Your offer letter has been successfully signed. Welcome aboard!</p>
    </div>
  );
}

export default ThankYou;
