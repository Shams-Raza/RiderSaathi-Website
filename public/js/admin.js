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

  // 3. Mobile Sidebar Toggle
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.getElementById("adminSidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // 4. Dark / Light Theme Toggle
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

  // 5. Modal Helpers
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

  // 6. Generic Settings Form Submitter
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

  // 7. Home Page CMS Form
  const homeCmsForm = document.getElementById("homeCmsForm");
  if (homeCmsForm) {
    homeCmsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(homeCmsForm);
      const data = Object.fromEntries(formData.entries());

      // Parse homeSections
      data.homeSections = {
        heroSimulator: homeCmsForm.homeSections_heroSimulator ? homeCmsForm.homeSections_heroSimulator.checked : false,
        supportedApps: homeCmsForm.homeSections_supportedApps ? homeCmsForm.homeSections_supportedApps.checked : false,
        driverProblems: homeCmsForm.homeSections_driverProblems ? homeCmsForm.homeSections_driverProblems.checked : false,
        ruleFeatures: homeCmsForm.homeSections_ruleFeatures ? homeCmsForm.homeSections_ruleFeatures.checked : false,
        pricingPreview: homeCmsForm.homeSections_pricingPreview ? homeCmsForm.homeSections_pricingPreview.checked : false,
        driverReviews: homeCmsForm.homeSections_driverReviews ? homeCmsForm.homeSections_driverReviews.checked : false,
        communityCard: homeCmsForm.homeSections_communityCard ? homeCmsForm.homeSections_communityCard.checked : false,
      };

      data.showBanner = homeCmsForm.showBanner ? homeCmsForm.showBanner.checked : false;

      // Clean up prefixed keys
      delete data.homeSections_heroSimulator;
      delete data.homeSections_supportedApps;
      delete data.homeSections_driverProblems;
      delete data.homeSections_ruleFeatures;
      delete data.homeSections_pricingPreview;
      delete data.homeSections_driverReviews;
      delete data.homeSections_communityCard;

      await submitSettings(data, "Home Page CMS updated!");
    });
  }

  // 8. Contact Settings Form
  const contactForm = document.getElementById("contactSettingsForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      await submitSettings(Object.fromEntries(formData.entries()), "Contact & Support info updated!");
    });
  }

  // 9. Footer Settings Form
  const footerForm = document.getElementById("footerSettingsForm");
  if (footerForm) {
    footerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(footerForm);
      await submitSettings(Object.fromEntries(formData.entries()), "Footer & Legal details updated!");
    });
  }

  // 10. SEO Settings Form
  const seoForm = document.getElementById("seoSettingsForm");
  if (seoForm) {
    seoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(seoForm);
      await submitSettings(Object.fromEntries(formData.entries()), "SEO metadata updated!");
    });
  }

  // 11. Payment Settings Form
  const paymentForm = document.getElementById("paymentSettingsForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(paymentForm);
      await submitSettings(Object.fromEntries(formData.entries()), "UPI & Payment settings updated!");
    });
  }

  // 12. App & APK Settings Form
  const appForm = document.getElementById("appSettingsForm");
  if (appForm) {
    appForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(appForm);
      await submitSettings(Object.fromEntries(formData.entries()), "APK version & Download details saved!");
    });
  }

  // 13. Pricing Plans CRUD
  window.openPlanModal = function () {
    const f = document.getElementById("planForm");
    if (f) f.reset();
    document.getElementById("planId").value = "";
    document.getElementById("planModalTitle").textContent = "Add New Pricing Plan";
    document.getElementById("planActive").checked = true;
    window.openModal("planModal");
  };

  window.editPlan = function (p) {
    document.getElementById("planId").value = p.id || "";
    document.getElementById("planName").value = p.name || "";
    document.getElementById("planPrice").value = p.price || "";
    document.getElementById("planWasPrice").value = p.wasPrice || "";
    document.getElementById("planDurationDays").value = p.durationDays || "";
    document.getElementById("planDurationText").value = p.durationText || "";
    document.getElementById("planBadge").value = p.badge || "";
    document.getElementById("planDescription").value = p.description || "";
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

  // 14. Guides & Tutorials CRUD
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

  // 15. FAQ Management CRUD
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

  // 16. Security & Credentials Update Form
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

  // 17. Driver Actions (Subscription, Trials, Ban)
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

  // 18. Orders Actions
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

  // 19. Inquiry Status
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

  // 20. Live Search for Drivers & Orders
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
