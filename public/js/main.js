// RiderSaathi Public Client Script
document.addEventListener("DOMContentLoaded", () => {
  // 1. Theme Toggle (Light / Dark)
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
    updateThemeIcon(storedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML =
      theme === "dark"
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // 2. Language Switcher (Requirement 2: English | हिंदी)
  const langButtons = document.querySelectorAll(".lang-btn");
  langButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedLang = btn.getAttribute("data-lang");
      if (selectedLang) {
        // Set cookie for 1 year
        document.cookie = `lang=${selectedLang};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
        localStorage.setItem("ridersaathi_lang", selectedLang);
      }
    });
  });

  // 3. Floating Social Media Dock Toggle (Requirement 13)
  const floatingDock = document.getElementById("floatingSocialDock");
  const floatingToggle = document.getElementById("floatingDockToggle");
  if (floatingDock && floatingToggle) {
    const iconShow = floatingToggle.querySelector(".toggle-icon-show");
    const iconHide = floatingToggle.querySelector(".toggle-icon-hide");

    // Check user preference in localStorage. Default state is EXPANDED (open)
    const storedDockState = localStorage.getItem("ridersaathi_floating_social");
    if (storedDockState === "collapsed") {
      floatingDock.classList.add("collapsed");
      if (iconShow && iconHide) {
        iconShow.style.display = "block";
        iconHide.style.display = "none";
      }
    } else {
      floatingDock.classList.remove("collapsed");
      if (iconShow && iconHide) {
        iconShow.style.display = "none";
        iconHide.style.display = "block";
      }
    }

    floatingToggle.addEventListener("click", () => {
      const isCollapsed = floatingDock.classList.toggle("collapsed");
      localStorage.setItem("ridersaathi_floating_social", isCollapsed ? "collapsed" : "expanded");
      if (iconShow && iconHide) {
        iconShow.style.display = isCollapsed ? "block" : "none";
        iconHide.style.display = isCollapsed ? "none" : "block";
      }
    });
  }

  // 4. Mobile Nav Toggle
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // 5. Copy UPI Button
  const copyUpiBtn = document.getElementById("copyUpiBtn");
  if (copyUpiBtn) {
    copyUpiBtn.addEventListener("click", () => {
      const upiId = copyUpiBtn.getAttribute("data-upi");
      if (upiId) {
        navigator.clipboard.writeText(upiId).then(() => {
          const original = copyUpiBtn.innerHTML;
          copyUpiBtn.innerHTML = "✓ Copied!";
          copyUpiBtn.style.borderColor = "var(--success)";
          copyUpiBtn.style.color = "var(--success)";
          setTimeout(() => {
            copyUpiBtn.innerHTML = original;
            copyUpiBtn.style.borderColor = "";
            copyUpiBtn.style.color = "";
          }, 2500);
        });
      }
    });
  }

  // 6. Interactive FAQ Accordion
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      item.classList.toggle("open");
    });
  });

  // 7. Contact Form Handler (AJAX)
  const contactForm = document.getElementById("contactForm");
  const contactAlert = document.getElementById("contactAlert");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending message...";

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          contactForm.reset();
          if (contactAlert) {
            contactAlert.className = "notice-box success";
            contactAlert.style.display = "block";
            contactAlert.innerHTML =
              "<strong>Message Received!</strong> Aapka sandesh mil gaya hai. Hamari support team aapse WhatsApp ya call par jald revert karegi.";
          }
        } else {
          alert("Error: " + (result.message || "Could not send message."));
        }
      } catch (err) {
        alert("Network error. Please try again or WhatsApp directly.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Message";
      }
    });
  }

  // 8. Subtle Scroll Reveal Observer
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    const candidateCards = document.querySelectorAll(
      ".card, .legal, .form-card, .upibox, .video-showcase-card, .step-card"
    );
    candidateCards.forEach((card) => {
      if (!card.querySelector(".problems-grid, .features-grid, .pricing-grid, .reviews-grid, .steps-grid")) {
        card.classList.add("reveal");
        revealObserver.observe(card);
      }
    });

    const revealElements = document.querySelectorAll(
      ".card-section .section-head, .problem-card, .feature-box, .plancard, .review-card, .step-card, .partner-chip, .faq-item, .notice-box"
    );
    revealElements.forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }
});
