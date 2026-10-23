// RiderSaathi Admin Dashboard Client Logic
document.addEventListener("DOMContentLoaded", () => {
  // Tab Switching
  const navItems = document.querySelectorAll(".admin-nav-item[data-tab]");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      navItems.forEach((n) => n.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(tabId);
      if (target) target.classList.add("active");
    });
  });

  // Toast Helper
  const toast = document.getElementById("adminToast");
  function showToast(msg, type = "success") {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast-msg ${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // 1. General Settings Form
  const settingsForm = document.getElementById("generalSettingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(settingsForm);
      const data = Object.fromEntries(formData.entries());

      // handle boolean checkbox
      data.showBanner = settingsForm.showBanner ? settingsForm.showBanner.checked : false;

      try {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Settings updated successfully!");
        } else {
          showToast(result.message || "Failed to save settings", "error");
        }
      } catch (err) {
        showToast("Error updating settings", "error");
      }
    });
  }

  // 2. Plans Management Form (Add new plan)
  const addPlanForm = document.getElementById("addPlanForm");
  if (addPlanForm) {
    addPlanForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addPlanForm);
      const data = Object.fromEntries(formData.entries());
      data.price = Number(data.price);
      data.wasPrice = Number(data.wasPrice) || data.price;
      data.durationDays = Number(data.durationDays) || 1;
      data.active = true;

      try {
        const res = await fetch("/api/admin/plans/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("New Plan Added!");
          setTimeout(() => location.reload(), 800);
        } else {
          showToast(result.message || "Failed to add plan", "error");
        }
      } catch (err) {
        showToast("Error adding plan", "error");
      }
    });
  }

  // 3. Delete Plan
  window.deletePlan = async function (id) {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/delete/${id}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Plan deleted!");
        setTimeout(() => location.reload(), 800);
      }
    } catch (err) {
      showToast("Error deleting plan", "error");
    }
  };

  // 4. Update Order Status
  window.updateOrderStatus = async function (orderId, newStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Order marked as ${newStatus}!`);
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast("Error updating order", "error");
    }
  };

  // 5. Update Inquiry Status
  window.updateInquiryStatus = async function (inquiryId, newStatus) {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Inquiry marked as ${newStatus}!`);
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast("Error updating inquiry", "error");
    }
  };

  // 6. Change Password Form
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        showToast("Passwords do not match!", "error");
        return;
      }

      try {
        const res = await fetch("/api/admin/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Admin password updated!");
          passwordForm.reset();
        } else {
          showToast(result.message || "Error updating password", "error");
        }
      } catch (err) {
        showToast("Network error", "error");
      }
    });
  }

  // 7. Add FAQ Form
  const addFaqForm = document.getElementById("addFaqForm");
  if (addFaqForm) {
    addFaqForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = document.getElementById("faqQ").value;
      const a = document.getElementById("faqA").value;
      try {
        const res = await fetch("/api/admin/faq/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q, a }),
        });
        const result = await res.json();
        if (result.success) {
          showToast("FAQ added!");
          setTimeout(() => location.reload(), 700);
        }
      } catch (err) {
        showToast("Error adding FAQ", "error");
      }
    });
  }

  // 8. Delete FAQ
  window.deleteFaq = async function (id) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faq/delete/${id}`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        showToast("FAQ deleted");
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast("Error deleting FAQ", "error");
    }
  };

  // 9. Export Backup
  const exportBtn = document.getElementById("exportBackupBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.open("/api/admin/backup/export", "_blank");
    });
  }

  // 10. Grant Subscription Days to Driver
  window.grantSubscription = async function (driverId, days, planName = "") {
    try {
      const res = await fetch("/api/admin/drivers/grant-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, days, planName }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error granting subscription", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 11. Grant Free Trial Rides
  window.grantTrialRides = async function (driverId, extraRides = 10) {
    try {
      const res = await fetch("/api/admin/drivers/grant-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, extraRides }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error adding trial rides", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 12. Toggle Driver Ban / Active Status
  window.toggleDriverStatus = async function (driverId) {
    try {
      const res = await fetch("/api/admin/drivers/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
        setTimeout(() => location.reload(), 600);
      } else {
        showToast(result.message || "Error toggling driver status", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 13. Approve Order and Automatically Activate Driver Subscription
  window.approveAndActivateOrder = async function (orderId) {
    if (!confirm("Approve this order and immediately activate driver subscription?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
        setTimeout(() => location.reload(), 800);
      } else {
        showToast(result.message || "Error approving order", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  // 14. Payment Settings Form (UPI ID, Payee Name, QR)
  const paymentForm = document.getElementById("paymentSettingsForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(paymentForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Payment & UPI settings saved successfully!");
        } else {
          showToast(result.message || "Failed to save payment settings", "error");
        }
      } catch (err) {
        showToast("Error updating payment settings", "error");
      }
    });
  }

  // 15. App & APK Settings Form (Version, Download URL, Hashes)
  const appForm = document.getElementById("appSettingsForm");
  if (appForm) {
    appForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(appForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("App & APK settings saved successfully!");
        } else {
          showToast(result.message || "Failed to save app settings", "error");
        }
      } catch (err) {
        showToast("Error updating app settings", "error");
      }
    });
  }
});
