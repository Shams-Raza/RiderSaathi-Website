// RiderSaathi Public Client Script
document.addEventListener("DOMContentLoaded", () => {
  // 1. Theme Toggle
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

  // 2. Mobile Nav Toggle
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // 3. Copy UPI Button
  const copyUpiBtn = document.getElementById("copyUpiBtn");
  if (copyUpiBtn) {
    copyUpiBtn.addEventListener("click", () => {
      const upiId = copyUpiBtn.getAttribute("data-upi");
      if (upiId) {
        navigator.clipboard.writeText(upiId).then(() => {
          const original = copyUpiBtn.textContent;
          copyUpiBtn.textContent = "UPI ID Copied!";
          copyUpiBtn.style.background = "var(--ok)";
          copyUpiBtn.style.color = "#fff";
          setTimeout(() => {
            copyUpiBtn.textContent = original;
            copyUpiBtn.style.background = "";
            copyUpiBtn.style.color = "";
          }, 2500);
        });
      }
    });
  }

  // 4. Contact Form Handler (AJAX)
  const contactForm = document.getElementById("contactForm");
  const contactAlert = document.getElementById("contactAlert");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

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
            contactAlert.className = "notice";
            contactAlert.style.display = "block";
            contactAlert.innerHTML =
              "<strong>Message Sent!</strong> Hamari support team aapko 2 working days ke andar WhatsApp ya phone par contact karegi.";
          }
        } else {
          alert("Error: " + (result.message || "Could not send message."));
        }
      } catch (err) {
        alert("Network error. Please try again or WhatsApp directly.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });
  }
});
