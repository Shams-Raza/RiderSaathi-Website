'use client';

import React, { useState } from 'react';

export default function FaqAccordion({ items = [] }) {
  // Store open states as a map of indices
  const [openItems, setOpenItems] = useState({ 0: true });

  const toggleItem = (idx) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {items.map((item, index) => {
        const isOpen = !!openItems[index];
        return (
          <div key={item.id || index} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <div
              className="faq-question"
              onClick={() => toggleItem(index)}
              style={{ cursor: 'pointer' }}
            >
              <span>{item.q}</span>
              <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </div>
            <div className="faq-answer">{item.a}</div>
          </div>
        );
      })}
    </div>
  );
}
