import React from "react";

export default function Layout({ title, children, right }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>CounterScam</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{title}</div>
          </div>
          <div>{right}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px" }}>
        {children}
      </div>
    </div>
  );
}