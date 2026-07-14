import React from "react";
import "./GlassSubmit.css";

export default function GlassSubmit({ label = "Envoyer", type = "submit", disabled = false, onClick }) {
  return (
    <div className="glass-submit-component">
      <div className="button-wrap">
        <button type={type} disabled={disabled} onClick={onClick}>
          <span>{label}</span>
        </button>
        <div className="button-shadow"></div>
      </div>
    </div>
  );
}