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
      data.durationDays = Number(data.durationDays);
      data.active = true;

      try {
        const res = await fetch("/api/admin/plans/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Plan added successfully!");
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
  window.deletePlan = async function (planId) {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/delete/${planId}`, {
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
});
