'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const candidateCards = document.querySelectorAll(
      '.card, .legal, .form-card, .upibox, .video-showcase-card, .step-card'
    );
    candidateCards.forEach((card) => {
      if (!card.querySelector('.problems-grid, .features-grid, .pricing-grid, .reviews-grid, .steps-grid')) {
        card.classList.add('reveal');
        revealObserver.observe(card);
      }
    });

    const revealElements = document.querySelectorAll(
      '.card-section .section-head, .problem-card, .feature-box, .plancard, .review-card, .step-card, .partner-chip, .faq-item, .notice-box'
    );
    revealElements.forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    return () => {
      revealObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
