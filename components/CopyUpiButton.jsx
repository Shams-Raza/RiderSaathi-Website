'use client';

import React, { useState } from 'react';

export default function CopyUpiButton({ upiId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!upiId) return;
    let copiedSuccess = false;

    // 1. Try modern async Clipboard API if available and in secure context
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(upiId);
        copiedSuccess = true;
      } catch (_) {
        // Fallback to execCommand below
      }
    }

    // 2. Reliable cross-browser fallback using temporary input element
    if (!copiedSuccess && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = upiId;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copiedSuccess = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (_) {
        copiedSuccess = false;
      }
    }

    if (copiedSuccess) {
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
