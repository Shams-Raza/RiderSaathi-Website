// RiderSaathi Complete Professional Admin Dashboard Client Logic

document.addEventListener("DOMContentLoaded", () => {
  // 1. Toast Notification Helper
  const toast = document.getElementById("adminToast");
  function showToast(msg, type = "success") {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast-msg ${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }
  window.showToast = showToast;

  // 2. Tab Navigation
  const navItems = document.querySelectorAll(".admin-nav-item[data-tab]");
  const tabPanes = document.querySelectorAll(".tab-pane");

  window.switchTab = function (tabId) {
    navItems.forEach((n) => n.classList.remove("active"));
    tabPanes.forEach((p) => p.classList.remove("active"));

    const activeNav = document.querySelector(`.admin-nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add("active");

    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add("active");

    // Close mobile menu if open
    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) sidebar.classList.remove("open");
  };

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      window.switchTab(tabId);
    });
  });

  // 3. Bilingual Sub-Tab Switcher (Requirement 2 & 4)
  window.switchBilingualTab = function(lang) {
    const paneHi = document.getElementById("paneLangHi");
    const paneEn = document.getElementById("paneLangEn");
    const btnHi = document.getElementById("btnLangTabHi");
    const btnEn = document.getElementById("btnLangTabEn");

    if (lang === 'en') {
      if (paneHi) paneHi.style.display = "none";
      if (paneEn) paneEn.style.display = "block";
      if (btnHi) btnHi.className = "btn-outline btn-sm";
      if (btnEn) btnEn.className = "btn-primary btn-sm";
    } else {
      if (paneHi) paneHi.style.display = "block";
      if (paneEn) paneEn.style.display = "none";
      if (btnHi) btnHi.className = "btn-primary btn-sm";
      if (btnEn) btnEn.className = "btn-outline btn-sm";
    }
  };

  // 4. Mobile Sidebar Toggle
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.getElementById("adminSidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // 5. Dark / Light Theme Toggle
  const themeToggle = document.getElementById("themeToggleBtn");
  const savedTheme = localStorage.getItem("admin_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const nextTheme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("admin_theme", nextTheme);
    });
  }

  // 6. Modal Helpers
  window.openModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("active");
  };

  window.closeModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("active");
  };

  // Close modal when clicking on overlay background
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Helper to parse complex nested form names like "numbers[freeTrialRides]" or "socialLinks[whatsapp][url]"
  function serializeFormToNestedObject(form) {
    const formData = new FormData(form);
    const obj = {};

    for (let [key, value] of formData.entries()) {
      // Check for array/nested notation: e.g. parent[child] or parent[child][grandchild]
      const matches = key.match(/([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\](?:\[([a-zA-Z0-9_-]+)\])?/);
      if (matches) {
        const p1 = matches[1];
        const p2 = matches[2];
        const p3 = matches[3];

        if (!obj[p1]) obj[p1] = {};
        if (p3) {
          if (!obj[p1][p2]) obj[p1][p2] = {};
          obj[p1][p2][p3] = value;
        } else {
          obj[p1][p2] = value;
        }
      } else {
        obj[key] = value;
      }
    }

    // Also collect checkboxes that might not be in formData if unchecked
    form.querySelectorAll("input[type='checkbox']").forEach(cb => {
      const name = cb.getAttribute("name");
      if (!name) return;
      const matches = name.match(/([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\](?:\[([a-zA-Z0-9_-]+)\])?/);
      if (matches) {
        const p1 = matches[1];
        const p2 = matches[2];
        const p3 = matches[3];
        if (!obj[p1]) obj[p1] = {};
        if (p3) {
          if (!obj[p1][p2]) obj[p1][p2] = {};
          obj[p1][p2][p3] = cb.checked;
        } else {
          obj[p1][p2] = cb.checked;
        }
      } else {
        obj[name] = cb.checked;
      }
    });

    return obj;
  }

  // 7. Generic Settings Form Submitter
  async function submitSettings(data, successMsg = "Settings saved successfully!") {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        showToast(successMsg, "success");
      } else {
        showToast(result.message || "Failed to save settings", "error");
      }
      return result;
    } catch (err) {
      showToast("Network error while saving settings", "error");
      return { success: false };
    }
  }

  // 8. Website Numbers Form (Requirement 3)
  const numbersForm = document.getElementById("numbersSettingsForm");
  if (numbersForm) {
    numbersForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = serializeFormToNestedObject(numbersForm);
      await submitSettings(data, "Website Numbers & Business Config saved!");
    });
  }

  // 9. Bilingual Content Form (Requirement 2 & 4)
  const bilingualForm = document.getElementById("bilingualCmsForm");
  if (bilingualForm) {
    bilingualForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = serializeFormToNestedObject(bilingualForm);
      await submitSettings(data, "Bilingual Hindi & English content saved!");
    });
  }

  // 10. How It Works Video Form (Requirement 14)
  const hiwForm = document.getElementById("howItWorksForm");
  if (hiwForm) {
    hiwForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = serializeFormToNestedObject(hiwForm);

      // Auto-extract YouTube embed URL if standard URL was provided
      if (data.howItWorks && data.howItWorks.youtubeVideoUrl && !data.howItWorks.youtubeEmbedUrl) {
        try {
          const u = new URL(data.howItWorks.youtubeVideoUrl);
          if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
            data.howItWorks.youtubeEmbedUrl = `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
          } else if (u.hostname.includes("youtu.be")) {
            data.howItWorks.youtubeEmbedUrl = `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
          }
        } catch(err) {}
      }

      await submitSettings(data, "How It Works & Video settings saved!");
    });
  }

  // 11. Social Media & Floating Dock Form (Requirement 11 & 13)
  const socialForm = document.getElementById("socialSettingsForm");
  if (socialForm) {
    socialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = serializeFormToNestedObject(socialForm);
      await submitSettings(data, "Social Media & Floating Dock settings saved!");
    });
  }

  // 12. Office & Location Form (Requirement 8 & 9)
  const locationForm = document.getElementById("locationSettingsForm");
  if (locationForm) {
    locationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = serializeFormToNestedObject(locationForm);
      await submitSettings(data, "Office Location & Google Maps details saved!");
    });
  }

  // 13. Contact & Helpline Settings Form (Requirement 10)
  const contactForm = document.getElementById("contactSettingsForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      await submitSettings(Object.fromEntries(formData.entries()), "WhatsApp & Contact details saved!");
    });
  }

  // 14. Footer & Legal Settings Form (Requirement 8)
  const footerForm = document.getElementById("footerSettingsForm");
  if (footerForm) {
    footerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(footerForm);
      await submitSettings(Object.fromEntries(formData.entries()), "Company details & Legal footer saved!");
    });
  }

  // 15. SEO Settings Form
  const seoForm = document.getElementById("seoSettingsForm");
  if (seoForm) {
    seoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(seoForm);
      await submitSettings(Object.fromEntries(formData.entries()), "SEO metadata saved!");
    });
  }

  // 16. Payment Settings Form
  const paymentForm = document.getElementById("paymentSettingsForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(paymentForm);
      await submitSettings(Object.fromEntries(formData.entries()), "UPI & Payment gateway saved!");
    });
  }

  // 17. App & APK Settings Form (Requirement 6 & 7)
  const appForm = document.getElementById("appSettingsForm");
  if (appForm) {
    appForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(appForm);
      await submitSettings(Object.fromEntries(formData.entries()), "APK version & Download links saved!");
    });
  }

  // 18. Pricing Plans CRUD (Requirement 5 with Features List Builder)
  window.openPlanModal = function () {
    const f = document.getElementById("planForm");
    if (f) f.reset();
    document.getElementById("planId").value = "";
    document.getElementById("planNameHi").value = "";
    document.getElementById("planDurationTextHi").value = "";
    document.getElementById("planBadgeHi").value = "";
    document.getElementById("planDescriptionHi").value = "";
    document.getElementById("planFeatures").value = "Rapido, Uber & Porter Support\nGo-To (Towards Home) Route Filter\nPickup & Fare Rules\nVoice & Sound Alerts";
    document.getElementById("planFeaturesHi").value = "Rapido, Uber और Porter सपोर्ट\nघर की तरफ (Go-To) रूट फ़िल्टर\nपिकअप और किराया रूल्स\nआवाज और साउंड अलर्ट्स";
    document.getElementById("planModalTitle").textContent = "Add New Pricing Plan";
    document.getElementById("planActive").checked = true;
    window.openModal("planModal");
  };

  window.editPlan = function (p) {
    document.getElementById("planId").value = p.id || "";
    document.getElementById("planName").value = p.name || "";
    document.getElementById("planNameHi").value = p.name_hi || "";
    document.getElementById("planPrice").value = p.price || "";
    document.getElementById("planWasPrice").value = p.wasPrice || "";
    document.getElementById("planDurationDays").value = p.durationDays || "";
    document.getElementById("planDurationText").value = p.durationText || "";
    document.getElementById("planDurationTextHi").value = p.durationText_hi || "";
    document.getElementById("planBadge").value = p.badge || "";
    document.getElementById("planBadgeHi").value = p.badge_hi || "";
    document.getElementById("planDescription").value = p.description || "";
    document.getElementById("planDescriptionHi").value = p.description_hi || "";

    // Load features arrays as newline strings
    const featEn = Array.isArray(p.features) ? p.features.join("\n") : (p.features || "");
    const featHi = Array.isArray(p.features_hi) ? p.features_hi.join("\n") : (p.features_hi || "");
    document.getElementById("planFeatures").value = featEn;
    document.getElementById("planFeaturesHi").value = featHi;

    document.getElementById("planActive").checked = p.active !== false;
    document.getElementById("planModalTitle").textContent = `Edit Plan: ${p.name}`;
    window.openModal("planModal");
  };

  const planForm = document.getElementById("planForm");
  if (planForm) {
    planForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(planForm);
      const data = Object.fromEntries(formData.entries());
      data.active = planForm.active ? planForm.active.checked : true;

      try {
        const res = await fetch("/api/admin/plans/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast(result.message, "success");
          window.closeModal("planModal");
          setTimeout(() => location.reload(), 700);
        } else {
          showToast(result.message || "Failed to save plan", "error");
        }
      } catch (err) {
        showToast("Error saving plan", "error");
      }
    });
  }

  window.deletePlan = async function (id) {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/delete/${id}`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        showToast("Plan deleted!", "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error deleting plan", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 19. Guides & Tutorials CRUD
  window.openGuideModal = function () {
    const f = document.getElementById("guideForm");
    if (f) f.reset();
    document.getElementById("guideOriginalSlug").value = "";
    document.getElementById("guideModalTitle").textContent = "Add Driver Guide";
    window.openModal("guideModal");
  };

  window.editGuide = function (g) {
    document.getElementById("guideOriginalSlug").value = g.slug || "";
    document.getElementById("guideTitle").value = g.title || "";
    document.getElementById("guideSlug").value = g.slug || "";
    document.getElementById("guideCategory").value = g.category || "";
    document.getElementById("guideSummary").value = g.summary || "";
    document.getElementById("guideContent").value = g.content || "";

    document.getElementById("guideModalTitle").textContent = `Edit Guide: ${g.title}`;
    window.openModal("guideModal");
  };

  const guideForm = document.getElementById("guideForm");
  if (guideForm) {
    guideForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(guideForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/admin/guides/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast(result.message, "success");
          window.closeModal("guideModal");
          setTimeout(() => location.reload(), 700);
        } else {
          showToast(result.message || "Failed to save guide", "error");
        }
      } catch (err) {
        showToast("Error saving guide", "error");
      }
    });
  }

  window.deleteGuide = async function (slug) {
    if (!confirm(`Are you sure you want to delete guide "${slug}"?`)) return;
    try {
      const res = await fetch(`/api/admin/guides/delete/${slug}`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        showToast("Guide deleted!", "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error deleting guide", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 20. FAQ Management CRUD
  window.openFaqModal = function () {
    const f = document.getElementById("faqForm");
    if (f) f.reset();
    document.getElementById("faqId").value = "";
    document.getElementById("faqModalTitle").textContent = "Add FAQ";
    window.openModal("faqModal");
  };

  window.editFaq = function (f) {
    document.getElementById("faqId").value = f.id || "";
    document.getElementById("faqQ").value = f.q || "";
    document.getElementById("faqA").value = f.a || "";

    document.getElementById("faqModalTitle").textContent = "Edit FAQ";
    window.openModal("faqModal");
  };

  const faqForm = document.getElementById("faqForm");
  if (faqForm) {
    faqForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(faqForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/admin/faq/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("FAQ saved!", "success");
          window.closeModal("faqModal");
          setTimeout(() => location.reload(), 600);
        } else {
          showToast(result.message || "Failed to save FAQ", "error");
        }
      } catch (err) {
        showToast("Error saving FAQ", "error");
      }
    });
  }

  window.deleteFaq = async function (id) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faq/delete/${id}`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        showToast("FAQ deleted", "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error deleting FAQ", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 21. Security & Credentials Update Form
  const credentialsForm = document.getElementById("credentialsForm");
  if (credentialsForm) {
    credentialsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("currentPassword").value;
      const newEmail = credentialsForm.newEmail.value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword && newPassword !== confirmPassword) {
        showToast("New Passwords do not match!", "error");
        return;
      }

      try {
        const res = await fetch("/api/admin/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newEmail, newPassword }),
        });
        const result = await res.json();
        if (result.success) {
          showToast(result.message, "success");
          credentialsForm.reset();
          if (newEmail) {
            credentialsForm.newEmail.value = newEmail;
          }
        } else {
          showToast(result.message || "Failed to update credentials", "error");
        }
      } catch (err) {
        showToast("Network error while updating credentials", "error");
      }
    });
  }

  // 22. Driver Actions (Subscription, Trials, Ban)
  window.grantSubscription = async function (driverId, days, planName = "") {
    try {
      const res = await fetch("/api/admin/drivers/grant-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, days, planName }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error granting subscription", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  window.grantTrialRides = async function (driverId, extraRides = 10) {
    try {
      const res = await fetch("/api/admin/drivers/grant-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, extraRides }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error adding trial rides", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  window.toggleDriverStatus = async function (driverId) {
    try {
      const res = await fetch("/api/admin/drivers/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error toggling driver status", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 23. Orders Actions
  window.approveAndActivateOrder = async function (orderId) {
    if (!confirm("Approve this order and immediately activate driver subscription?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => location.reload(), 800);
      } else {
        showToast(result.message || "Error approving order", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  window.updateOrderStatus = async function (orderId, newStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Order marked as ${newStatus}!`, "success");
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast("Error updating order", "error");
    }
  };

  // 24. Inquiry Status
  window.updateInquiryStatus = async function (inquiryId, newStatus) {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Inquiry marked as ${newStatus}!`, "success");
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast("Error updating inquiry", "error");
    }
  };

  // 25. Live Search for Drivers & Orders
  const driverSearch = document.getElementById("driverSearchInput");
  if (driverSearch) {
    driverSearch.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".driver-row").forEach((row) => {
        const text = (row.getAttribute("data-search") || "").toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  }

  const orderSearch = document.getElementById("orderSearchInput");
  if (orderSearch) {
    orderSearch.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".order-row").forEach((row) => {
        const text = (row.getAttribute("data-search") || "").toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  }
});
