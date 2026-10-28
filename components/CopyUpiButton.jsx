'use client';

import React, { useState } from 'react';

export default function CopyUpiButton({ upiId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!upiId) return;
    try {
      navigator.clipboard.writeText(upiId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      className="btn ghost btn-sm"
      id="copyUpiBtn"
      onClick={handleCopy}
      data-upi={upiId}
      style={{
        padding: '9px 20px',
        borderColor: copied ? 'var(--success)' : '',
        color: copied ? 'var(--success)' : '',
      }}
    >
      {copied ? '✓ Copied!' : '📋 Copy UPI ID'}
    </button>
  );
}
