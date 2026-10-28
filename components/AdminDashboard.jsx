'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard({
  initialSettings,
  initialPlans,
  initialFaqs,
  initialGuides,
  initialUpdates,
  initialInquiries,
  initialOrders,
  initialStats,
  initialDrivers,
  initialRides,
  adminEmail,
}) {
  const [activeTab, setActiveTab] = useState('tabOverview');
  const [bilingualLang, setBilingualLang] = useState('hi');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Data state
  const [settings, setSettings] = useState(initialSettings || {});
  const [plans, setPlans] = useState(initialPlans || []);
  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [guides, setGuides] = useState(initialGuides || []);
  const [updates, setUpdates] = useState(initialUpdates || []);
  const [inquiries, setInquiries] = useState(initialInquiries || []);
  const [orders, setOrders] = useState(initialOrders || []);
  const [stats, setStats] = useState(initialStats || {});
  const [drivers, setDrivers] = useState(initialDrivers || []);
  const [rides, setRides] = useState(initialRides || []);
  const [currentAdminEmail, setCurrentAdminEmail] = useState(adminEmail || 'admin@ridersaathi.in');

  // Search filters
  const [driverSearch, setDriverSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    id: '',
    name: '',
    name_hi: '',
    price: '',
    wasPrice: '',
    durationDays: 7,
    durationText: '7 days',
    durationText_hi: '7 दिन',
    badge: '',
    badge_hi: '',
    active: true,
    description: '',
    description_hi: '',
    features: 'Rapido, Uber & Porter Support\nGo-To (Towards Home) Route Filter\nPickup & Fare Rules\nVoice & Sound Alerts',
    features_hi: 'Rapido, Uber और Porter सपोर्ट\nघर की तरफ (Go-To) रूट फ़िल्टर\nपिकअप और किराया रूल्स\nआवाज और साउंड अलर्ट्स',
  });

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideForm, setGuideForm] = useState({
    originalSlug: '',
    title: '',
    category: 'General',
    slug: '',
    summary: '',
    content: '',
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    id: '',
    q: '',
    a: '',
  });

  // Init theme
  useEffect(() => {
    const saved = localStorage.getItem('admin_theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('admin_theme', next);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  // Helper to parse nested forms
  function serializeFormToNestedObject(form) {
    const formData = new FormData(form);
    const obj = {};

    for (let [key, value] of formData.entries()) {
      const matches = key.match(/([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\](?:\[([a-zA-Z0-9_-]+)\])?/);
      if (matches) {
        const [, p1, p2, p3] = matches;
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

    form.querySelectorAll("input[type='checkbox']").forEach(cb => {
      const name = cb.getAttribute('name');
      if (!name) return;
      const matches = name.match(/([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\](?:\[([a-zA-Z0-9_-]+)\])?/);
      if (matches) {
        const [, p1, p2, p3] = matches;
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

  // Generic Settings Submitter
  const handleSettingsSubmit = async (e, successMsg = 'Settings saved successfully!') => {
    e.preventDefault();
    const data = serializeFormToNestedObject(e.target);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        if (result.settings) setSettings(result.settings);
        showToast(successMsg, 'success');
      } else {
        showToast(result.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Network error while saving settings', 'error');
    }
  };

  // Driver Actions
  const grantSubscription = async (driverId, days, planName = '') => {
    try {
      const res = await fetch('/api/admin/drivers/grant-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, days, planName }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setDrivers(prev => prev.map(d => d.id === driverId || d.phone === driverId ? result.driver : d));
      } else {
        showToast(result.message || 'Error granting subscription', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const grantTrialRides = async (driverId, extraRides = 10) => {
    try {
      const res = await fetch('/api/admin/drivers/grant-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, extraRides }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setDrivers(prev => prev.map(d => d.id === driverId || d.phone === driverId ? result.driver : d));
      } else {
        showToast(result.message || 'Error adding trial rides', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const toggleDriverStatus = async (driverId) => {
    try {
      const res = await fetch('/api/admin/drivers/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setDrivers(prev => prev.map(d => d.id === driverId || d.phone === driverId ? result.driver : d));
      } else {
        showToast(result.message || 'Error toggling driver status', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Order Actions
  const approveAndActivateOrder = async (orderId) => {
    if (!confirm('Approve this order and immediately activate driver subscription?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? result.order : o));
        if (result.driver) {
          setDrivers(prev => {
            const idx = prev.findIndex(d => d.id === result.driver.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = result.driver;
              return copy;
            }
            return [result.driver, ...prev];
          });
        }
      } else {
        showToast(result.message || 'Error approving order', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Order marked as ${newStatus}!`, 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch {
      showToast('Error updating order', 'error');
    }
  };

  // Inquiry Actions
  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Inquiry marked as ${newStatus}!`, 'success');
        setInquiries(prev => prev.map(i => String(i.id) === String(inquiryId) ? { ...i, status: newStatus } : i));
      }
    } catch {
      showToast('Error updating inquiry', 'error');
    }
  };

  // Plan Actions
  const openPlanModalNew = () => {
    setPlanForm({
      id: '',
      name: '',
      name_hi: '',
      price: '',
      wasPrice: '',
      durationDays: 7,
      durationText: '7 days',
      durationText_hi: '7 दिन',
      badge: '',
      badge_hi: '',
      active: true,
      description: '',
      description_hi: '',
      features: 'Rapido, Uber & Porter Support\nGo-To (Towards Home) Route Filter\nPickup & Fare Rules\nVoice & Sound Alerts',
      features_hi: 'Rapido, Uber और Porter सपोर्ट\nघर की तरफ (Go-To) रूट फ़िल्टर\nपिकअप और किराया रूल्स\nआवाज और साउंड अलर्ट्स',
    });
    setPlanModalOpen(true);
  };

  const openPlanModalEdit = (p) => {
    const featEn = Array.isArray(p.features) ? p.features.join('\n') : (p.features || '');
    const featHi = Array.isArray(p.features_hi) ? p.features_hi.join('\n') : (p.features_hi || '');
    setPlanForm({
      id: p.id || '',
      name: p.name || '',
      name_hi: p.name_hi || '',
      price: p.price || '',
      wasPrice: p.wasPrice || '',
      durationDays: p.durationDays || 7,
      durationText: p.durationText || '',
      durationText_hi: p.durationText_hi || '',
      badge: p.badge || '',
      badge_hi: p.badge_hi || '',
      active: p.active !== false,
      description: p.description || '',
      description_hi: p.description_hi || '',
      features: featEn,
      features_hi: featHi,
    });
    setPlanModalOpen(true);
  };

  const handlePlanFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setPlanModalOpen(false);
        setPlans(prev => {
          const idx = prev.findIndex(p => p.id === result.plan.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = result.plan;
            return copy;
          }
          return [...prev, result.plan];
        });
      } else {
        showToast(result.message || 'Failed to save plan', 'error');
      }
    } catch {
      showToast('Error saving plan', 'error');
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    try {
      const res = await fetch(`/api/admin/plans/delete/${id}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('Plan deleted!', 'success');
        setPlans(prev => prev.filter(p => p.id !== id));
      } else {
        showToast(result.message || 'Error deleting plan', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Guide Actions
  const openGuideModalNew = () => {
    setGuideForm({
      originalSlug: '',
      title: '',
      category: 'General',
      slug: '',
      summary: '',
      content: '',
    });
    setGuideModalOpen(true);
  };

  const openGuideModalEdit = (g) => {
    setGuideForm({
      originalSlug: g.slug || '',
      title: g.title || '',
      category: g.category || '',
      slug: g.slug || '',
      summary: g.summary || '',
      content: g.content || '',
    });
    setGuideModalOpen(true);
  };

  const handleGuideFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/guides/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guideForm),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        setGuideModalOpen(false);
        setGuides(prev => {
          const lookup = guideForm.originalSlug || result.guide.slug;
          const idx = prev.findIndex(g => g.slug === lookup);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = result.guide;
            return copy;
          }
          return [...prev, result.guide];
        });
      } else {
        showToast(result.message || 'Failed to save guide', 'error');
      }
    } catch {
      showToast('Error saving guide', 'error');
    }
  };

  const deleteGuide = async (slug) => {
    if (!confirm(`Are you sure you want to delete guide "${slug}"?`)) return;
    try {
      const res = await fetch(`/api/admin/guides/delete/${slug}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('Guide deleted!', 'success');
        setGuides(prev => prev.filter(g => g.slug !== slug));
      } else {
        showToast(result.message || 'Error deleting guide', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // FAQ Actions
  const openFaqModalNew = () => {
    setFaqForm({ id: '', q: '', a: '' });
    setFaqModalOpen(true);
  };

  const openFaqModalEdit = (f) => {
    setFaqForm({ id: f.id || '', q: f.q || '', a: f.a || '' });
    setFaqModalOpen(true);
  };

  const handleFaqFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/faq/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm),
      });
      const result = await res.json();
      if (result.success) {
        showToast('FAQ saved!', 'success');
        setFaqModalOpen(false);
        setFaqs(prev => {
          const idx = prev.findIndex(f => Number(f.id) === Number(result.faq.id));
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = result.faq;
            return copy;
          }
          return [...prev, result.faq];
        });
      } else {
        showToast(result.message || 'Failed to save FAQ', 'error');
      }
    } catch {
      showToast('Error saving FAQ', 'error');
    }
  };

  const deleteFaq = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faq/delete/${id}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('FAQ deleted', 'success');
        setFaqs(prev => prev.filter(f => String(f.id) !== String(id)));
      } else {
        showToast(result.message || 'Error deleting FAQ', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Credentials Action
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newEmail = e.target.newEmail.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New Passwords do not match!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail, newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        e.target.reset();
        if (result.email) setCurrentAdminEmail(result.email);
      } else {
        showToast(result.message || 'Failed to update credentials', 'error');
      }
    } catch {
      showToast('Network error while updating credentials', 'error');
    }
  };

  // Filtered drivers & orders
  const filteredDrivers = drivers.filter(drv => {
    const text = `${drv.name || ''} ${drv.phone || ''} ${drv.deviceModel || ''}`.toLowerCase();
    return text.includes(driverSearch.toLowerCase());
  });

  const filteredOrders = orders.filter(ord => {
    const text = `${ord.phone || ''} ${ord.utr || ''} ${ord.planName || ''} ${ord.id || ''}`.toLowerCase();
    return text.includes(orderSearch.toLowerCase());
  });

  const nums = settings.numbers || {};
  const cEn = settings.content_en || {};
  const cHi = settings.content_hi || {};
  const hiw = settings.howItWorks || {};

  return (
    <div>
      {/* Mobile Header Bar */}
      <div className="mobile-admin-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="brand-icon-wrap" style={{ width: '28px', height: '28px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M14 2 5 13h6l-1 9 9-11h-6z"/></svg>
          </div>
          <strong style={{ fontSize: '15px' }}>{settings.siteName || 'RiderSaathi'} Admin</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="mobile-menu-btn"
            id="mobileMenuToggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`} id="adminSidebar">
          <Link className="admin-brand" href="/admin">
            <div className="brand-icon-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M14 2 5 13h6l-1 9 9-11h-6z"/></svg>
            </div>
            <span>{settings.siteName || 'RiderSaathi'}</span>
            <span className="badge">CMS</span>
          </Link>

          <div className="admin-nav-section-title">Operations</div>
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === 'tabOverview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabOverview'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Overview &amp; Stats
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabDrivers' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabDrivers'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Drivers ({drivers.length})
              <span className="nav-counter">{drivers.length}</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabOrders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabOrders'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Orders ({orders.length})
              <span className="nav-counter">{orders.length}</span>
            </button>
          </nav>

          <div className="admin-nav-section-title">Website Content &amp; Numbers</div>
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === 'tabNumbers' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabNumbers'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
              Website Numbers &amp; Config
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabBilingual' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabBilingual'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              Bilingual Content (HI / EN)
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabPlans' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabPlans'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Pricing Plans ({plans.length})
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabHowItWorks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabHowItWorks'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              How It Works (Video CMS)
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabApp' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabApp'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              APK &amp; Download Links
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabGuides' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabGuides'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              Guides &amp; Tutorials ({guides.length})
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabFaq' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabFaq'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              FAQs ({faqs.length})
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabInquiries' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabInquiries'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Messages ({inquiries.length})
            </button>
          </nav>

          <div className="admin-nav-section-title">Business &amp; Social</div>
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === 'tabSocial' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabSocial'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Social Media &amp; Floating Dock
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabCompany' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabCompany'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Office &amp; Google Maps
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabContact' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabContact'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              WhatsApp &amp; Helpline
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabFooter' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabFooter'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Footer &amp; Legal CMS
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabSeo' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabSeo'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              SEO &amp; Meta Tags
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabPayment' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabPayment'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              UPI &amp; Payments
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'tabSecurity' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tabSecurity'); setMobileSidebarOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Security &amp; Backup
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <Link href="/api-docs" target="_blank" className="btn-outline" style={{ textDecoration: 'none', fontSize: '12.5px' }}>
              ⚡ REST API Docs
            </Link>
            <Link href="/" target="_blank" className="btn-outline" style={{ textDecoration: 'none', fontSize: '12.5px' }}>
              🌐 View Live Site
            </Link>
            <Link href="/admin/logout" className="btn-outline" style={{ textDecoration: 'none', color: 'var(--admin-danger)', fontSize: '12.5px' }}>
              🚪 Log Out
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {/* Top Navbar Header */}
          <div className="admin-header">
            <div>
              <h1>Dashboard &amp; Content Management System</h1>
              <div style={{ fontSize: '13.5px', color: 'var(--admin-muted)', marginTop: '3px' }}>
                Full administrative control for {settings.siteName || 'RiderSaathi'} website, numbers, bilingual content &amp; driver APIs.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="admin-user-pill" title="Active Admin Session">
                <span className="status-dot"></span>
                <span>{currentAdminEmail}</span>
              </div>
              <button id="themeToggleBtn" className="btn-outline" title="Toggle Light/Dark Theme" onClick={toggleTheme}>
                🌓 Theme ({theme})
              </button>
              <a href="/api/admin/backup/export" className="btn-outline" style={{ textDecoration: 'none' }}>
                📥 Backup JSON
              </a>
            </div>
          </div>

          {/* Toast Notification Message */}
          {toast.visible && (
            <div id="adminToast" className={`toast-msg ${toast.type}`} style={{ display: 'block' }}>
              {toast.message}
            </div>
          )}

          {/* ================= 1. TAB: OVERVIEW ================= */}
          <div className={`tab-pane ${activeTab === 'tabOverview' ? 'active' : ''}`} id="tabOverview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="stat-label">Active Drivers</div>
                <div className="stat-value">{drivers.length}</div>
                <div className="stat-desc">Registered Captains</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </div>
                <div className="stat-label">Subscription Orders</div>
                <div className="stat-value">{orders.length}</div>
                <div className="stat-desc">Total UPI Leads</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <div className="stat-label">APK Downloads</div>
                <div className="stat-value">{(stats && stats.downloads) || 0}</div>
                <div className="stat-desc">Direct APK Clicks</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>
                <div className="stat-label">Page Views</div>
                <div className="stat-value">{(stats && stats.visitors) || 0}</div>
                <div className="stat-desc">Website Visits</div>
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
              <div className="admin-card-header">
                <h2>Recent Drivers ({drivers.slice(0, 5).length} of {drivers.length})</h2>
                <button className="btn-outline btn-sm" onClick={() => setActiveTab('tabDrivers')}>View All Drivers &rarr;</button>
              </div>
              {drivers.length === 0 ? (
                <p style={{ color: 'var(--admin-muted)' }}>No drivers registered yet.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>Phone</th>
                        <th>Version</th>
                        <th>Trial Left</th>
                        <th>Status</th>
                        <th>Quick Pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.slice(0, 5).map(drv => {
                        const trialLeft = Math.max(0, (drv.trialRidesTotal || 10) - (drv.trialRidesUsed || 0));
                        return (
                          <tr key={drv.id || drv.phone}>
                            <td><strong>{drv.name || 'Captain'}</strong></td>
                            <td><code>{drv.phone}</code></td>
                            <td>v{drv.appVersion || '5.28.1'}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: trialLeft > 0 ? '#10b981' : '#ef4444' }}>
                                {trialLeft} rides
                              </span>
                            </td>
                            <td>
                              <span className={`badge-tag ${drv.status === 'banned' ? 'badge-danger' : 'badge-success'}`}>
                                {drv.status || 'active'}
                              </span>
                            </td>
                            <td>
                              <button className="btn-primary btn-sm" onClick={() => grantSubscription(drv.id, 7, '7 Days Pass')}>+7 Days</button>{' '}
                              <button className="btn-outline btn-sm" onClick={() => grantTrialRides(drv.id, 10)}>+10 Free</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= 2. TAB: WEBSITE NUMBERS & CONFIG ================= */}
          <div className={`tab-pane ${activeTab === 'tabNumbers' ? 'active' : ''}`} id="tabNumbers">
            <div className="admin-card">
              <h2>Website Numbers &amp; Business Configuration</h2>
              <div className="admin-card-desc">
                Website par dikhne wale saare numbers, counters, limits, stats aur pricing metrics ko yahan se edit karein:
              </div>

              <form id="numbersSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'Website Numbers & Business Config saved!')}>
                <div className="admin-table-wrap" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Field Name &amp; Key</th>
                        <th style={{ width: '20%' }}>Page / Section</th>
                        <th style={{ width: '35%' }}>Purpose / What it controls</th>
                        <th style={{ width: '20%' }}>Current Value (Editable)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Free Trial Rides</strong><br/><code>numbers.freeTrialRides</code></td>
                        <td>Hero, Pricing, Badges, Sticky Bar</td>
                        <td>Har naye account ko milne wali free trial rides ki sankhya</td>
                        <td><input type="number" name="numbers[freeTrialRides]" defaultValue={nums.freeTrialRides !== undefined ? nums.freeTrialRides : 10} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Starting Plan Price</strong><br/><code>numbers.starterPrice</code></td>
                        <td>Hero CTA Button, Pricing Link</td>
                        <td>Hero button me "Plans (₹12 se shuru)" me dikhne wala minimum price</td>
                        <td><input type="number" name="numbers[starterPrice]" defaultValue={nums.starterPrice !== undefined ? nums.starterPrice : 12} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Daily Savings Estimate</strong><br/><code>numbers.dailySavingsEst</code></td>
                        <td>Testimonials &amp; Reviews</td>
                        <td>Driver review me bachat ka counter (e.g. 800+)</td>
                        <td><input type="text" name="numbers[dailySavingsEst]" defaultValue={nums.dailySavingsEst || '800+'} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Active Captains Count</strong><br/><code>numbers.activeCaptainsCount</code></td>
                        <td>Social Proof &amp; Stats</td>
                        <td>Website par active drivers ka display number (e.g. 10,000+)</td>
                        <td><input type="text" name="numbers[activeCaptainsCount]" defaultValue={nums.activeCaptainsCount || '10,000+'} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Driver Rating</strong><br/><code>numbers.satisfactionRating</code></td>
                        <td>Trust &amp; Review Cards</td>
                        <td>Captain satisfaction star rating (e.g. 4.9)</td>
                        <td><input type="text" name="numbers[satisfactionRating]" defaultValue={nums.satisfactionRating || '4.9'} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Default Min Fare Rule</strong><br/><code>numbers.minFareDefault</code></td>
                        <td>Rules Section &amp; Drivers App</td>
                        <td>Minimum kiraya rule card me default threshold (₹)</td>
                        <td><input type="number" name="numbers[minFareDefault]" defaultValue={nums.minFareDefault !== undefined ? nums.minFareDefault : 50} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Min Fare Per KM</strong><br/><code>numbers.minFarePerKm</code></td>
                        <td>Rules Section &amp; Simulator</td>
                        <td>Kam se kam per-km kiraya rule (₹/km)</td>
                        <td><input type="number" name="numbers[minFarePerKm]" defaultValue={nums.minFarePerKm !== undefined ? nums.minFarePerKm : 12} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Max Pickup Distance (KM)</strong><br/><code>numbers.maxPickupDistanceKm</code></td>
                        <td>Rules Section &amp; Simulator</td>
                        <td>Passenger pickup doori limit (KM)</td>
                        <td><input type="number" step="0.1" name="numbers[maxPickupDistanceKm]" defaultValue={nums.maxPickupDistanceKm !== undefined ? nums.maxPickupDistanceKm : 2.5} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Short Ride Min Fare (₹)</strong><br/><code>numbers.shortRideFareMin</code></td>
                        <td>Problem 2 Section</td>
                        <td>Chhoti ghaate wali rides ki minimum range (₹)</td>
                        <td><input type="number" name="numbers[shortRideFareMin]" defaultValue={nums.shortRideFareMin !== undefined ? nums.shortRideFareMin : 20} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Short Ride Max Fare (₹)</strong><br/><code>numbers.shortRideFareMax</code></td>
                        <td>Problem 2 Section</td>
                        <td>Chhoti ghaate wali rides ki maximum range (₹)</td>
                        <td><input type="number" name="numbers[shortRideFareMax]" defaultValue={nums.shortRideFareMax !== undefined ? nums.shortRideFareMax : 30} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Long Ride Min KM</strong><br/><code>numbers.longRideDistanceMin</code></td>
                        <td>Problem 2 Section</td>
                        <td>Lambi kamai wali ride ki minimum doori (KM)</td>
                        <td><input type="number" name="numbers[longRideDistanceMin]" defaultValue={nums.longRideDistanceMin !== undefined ? nums.longRideDistanceMin : 15} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Long Ride Max KM</strong><br/><code>numbers.longRideDistanceMax</code></td>
                        <td>Problem 2 Section</td>
                        <td>Lambi kamai wali ride ki maximum doori (KM)</td>
                        <td><input type="number" name="numbers[longRideDistanceMax]" defaultValue={nums.longRideDistanceMax !== undefined ? nums.longRideDistanceMax : 20} required /></td>
                      </tr>
                      <tr>
                        <td><strong>Auto-Accept Speed (Sec)</strong><br/><code>numbers.autoAcceptTimeSec</code></td>
                        <td>Problem 1 Section</td>
                        <td>App dwara ride grab karne ka timing (seconds)</td>
                        <td><input type="number" name="numbers[autoAcceptTimeSec]" defaultValue={nums.autoAcceptTimeSec !== undefined ? nums.autoAcceptTimeSec : 1} required /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">💾 Save Website Numbers</button>
                  <Link href="/" target="_blank" className="btn-outline" style={{ textDecoration: 'none' }}>View Website &rarr;</Link>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 3. TAB: BILINGUAL CONTENT CMS ================= */}
          <div className={`tab-pane ${activeTab === 'tabBilingual' ? 'active' : ''}`} id="tabBilingual">
            <div className="admin-card">
              <h2>Page Content &amp; Text CMS (Hindi &amp; English)</h2>
              <div className="admin-card-desc">
                Website ka saara static text, headings, buttons aur messages Hindi aur English dono bhashao me yahan se edit karein:
              </div>

              <form id="bilingualCmsForm" onSubmit={(e) => handleSettingsSubmit(e, 'Bilingual Hindi & English content saved!')}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '2px solid var(--admin-border)', paddingBottom: '10px' }}>
                  <button
                    type="button"
                    className={bilingualLang === 'hi' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                    onClick={() => setBilingualLang('hi')}
                  >
                    🇮🇳 Hindi Content (हिंदी)
                  </button>
                  <button
                    type="button"
                    className={bilingualLang === 'en' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                    onClick={() => setBilingualLang('en')}
                  >
                    🇬🇧 English Content
                  </button>
                </div>

                {/* Hindi Sub-Pane */}
                <div style={{ display: bilingualLang === 'hi' ? 'block' : 'none' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--admin-primary)' }}>🇮🇳 हिंदी टेक्स्ट (Hindi)</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Hero Title (Hindi)</label>
                      <input type="text" name="content_hi[heroTitle]" defaultValue={cHi.heroTitle || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Hero Subtitle (Hindi)</label>
                      <textarea name="content_hi[heroSubtitle]" rows="3" defaultValue={cHi.heroSubtitle || ''}></textarea>
                    </div>
                    <div className="form-group full-width">
                      <label>Problems Section Heading (Hindi)</label>
                      <input type="text" name="content_hi[problemsHeading]" defaultValue={cHi.problemsHeading || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Rules Section Heading (Hindi)</label>
                      <input type="text" name="content_hi[rulesHeading]" defaultValue={cHi.rulesHeading || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Pricing Section Heading (Hindi)</label>
                      <input type="text" name="content_hi[pricingHeading]" defaultValue={cHi.pricingHeading || ''} />
                    </div>
                  </div>
                </div>

                {/* English Sub-Pane */}
                <div style={{ display: bilingualLang === 'en' ? 'block' : 'none' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--admin-primary)' }}>🇬🇧 English Text</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Hero Title (English)</label>
                      <input type="text" name="content_en[heroTitle]" defaultValue={cEn.heroTitle || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Hero Subtitle (English)</label>
                      <textarea name="content_en[heroSubtitle]" rows="3" defaultValue={cEn.heroSubtitle || ''}></textarea>
                    </div>
                    <div className="form-group full-width">
                      <label>Problems Section Heading (English)</label>
                      <input type="text" name="content_en[problemsHeading]" defaultValue={cEn.problemsHeading || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Rules Section Heading (English)</label>
                      <input type="text" name="content_en[rulesHeading]" defaultValue={cEn.rulesHeading || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Pricing Section Heading (English)</label>
                      <input type="text" name="content_en[pricingHeading]" defaultValue={cEn.pricingHeading || ''} />
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn-primary">💾 Save Bilingual Content</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 4. TAB: PRICING PLANS CRUD ================= */}
          <div className={`tab-pane ${activeTab === 'tabPlans' ? 'active' : ''}`} id="tabPlans">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Pricing Plans Management ({plans.length})</h2>
                  <div className="admin-card-desc">Plans add, edit aur delete karein. Har plan ke features aur details manage karein:</div>
                </div>
                <button className="btn-primary" onClick={openPlanModalNew}>➕ Add New Plan</button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Plan ID</th>
                      <th>Name (EN / HI)</th>
                      <th>Offer Price</th>
                      <th>Original</th>
                      <th>Duration</th>
                      <th>Badge</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map(p => (
                      <tr key={p.id}>
                        <td><code>{p.id}</code></td>
                        <td>
                          <strong>{p.name}</strong><br/>
                          <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{p.name_hi || p.name}</span>
                        </td>
                        <td><span style={{ fontWeight: 750, color: 'var(--admin-primary)' }}>₹{p.price}</span></td>
                        <td>{p.wasPrice ? '₹' + p.wasPrice : '-'}</td>
                        <td>{p.durationDays}d ({p.durationText})</td>
                        <td>
                          {p.badge ? (
                            <span className="badge-tag badge-warning">{p.badge}</span>
                          ) : (
                            <span style={{ color: 'var(--admin-subtle)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-tag ${p.active !== false ? 'badge-success' : 'badge-danger'}`}>
                            {p.active !== false ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-outline btn-sm" onClick={() => openPlanModalEdit(p)}>Edit</button>
                            <button className="btn-outline btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => deletePlan(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= 5. TAB: HOW IT WORKS ================= */}
          <div className={`tab-pane ${activeTab === 'tabHowItWorks' ? 'active' : ''}`} id="tabHowItWorks">
            <div className="admin-card">
              <h2>"How It Works" Page &amp; YouTube Video CMS</h2>
              <div className="admin-card-desc">
                Website ke How It Works page (/how-it-works) par dikhne wala YouTube video configure karein:
              </div>

              <form id="howItWorksForm" onSubmit={(e) => handleSettingsSubmit(e, 'How It Works & Video settings saved!')}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>YouTube Video URL (Watch or Share link)</label>
                    <input type="text" name="howItWorks[youtubeVideoUrl]" defaultValue={hiw.youtubeVideoUrl || ''} placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ" required />
                  </div>
                  <div className="form-group full-width">
                    <label>Direct YouTube Embed URL</label>
                    <input type="text" name="howItWorks[youtubeEmbedUrl]" defaultValue={hiw.youtubeEmbedUrl || ''} placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ" />
                  </div>
                  <div className="form-group full-width">
                    <label>Page Title (English)</label>
                    <input type="text" name="howItWorks[title_en]" defaultValue={hiw.title_en || ''} />
                  </div>
                  <div className="form-group full-width">
                    <label>Page Title (Hindi)</label>
                    <input type="text" name="howItWorks[title_hi]" defaultValue={hiw.title_hi || ''} />
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn-primary">💾 Save Video &amp; Tutorial Settings</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 6. TAB: SOCIAL MEDIA ================= */}
          <div className={`tab-pane ${activeTab === 'tabSocial' ? 'active' : ''}`} id="tabSocial">
            <div className="admin-card">
              <h2>Social Media Links &amp; Floating Dock</h2>
              <form id="socialSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'Social Media & Floating Dock saved!')}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>YouTube Channel URL</label>
                    <input type="text" name="socialLinks[youtube]" defaultValue={settings.socialLinks?.youtube || ''} />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input type="text" name="socialLinks[instagram]" defaultValue={settings.socialLinks?.instagram || ''} />
                  </div>
                  <div className="form-group">
                    <label>Telegram Group / Channel</label>
                    <input type="text" name="socialLinks[telegram]" defaultValue={settings.socialLinks?.telegram || ''} />
                  </div>
                  <div className="form-group">
                    <label>Facebook Page</label>
                    <input type="text" name="socialLinks[facebook]" defaultValue={settings.socialLinks?.facebook || ''} />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save Social Links</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 7. TAB: OFFICE & COMPANY ================= */}
          <div className={`tab-pane ${activeTab === 'tabCompany' ? 'active' : ''}`} id="tabCompany">
            <div className="admin-card">
              <h2>Office Location &amp; Google Maps</h2>
              <form id="locationSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'Location & Map settings saved!')}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Google Maps Embed URL / iframe src</label>
                    <input type="text" name="location[mapEmbedUrl]" defaultValue={settings.location?.mapEmbedUrl || ''} />
                  </div>
                  <div className="form-group">
                    <label>City / State</label>
                    <input type="text" name="location[city]" defaultValue={settings.location?.city || 'Jaipur, Rajasthan'} />
                  </div>
                  <div className="form-group">
                    <label>PIN Code</label>
                    <input type="text" name="location[pinCode]" defaultValue={settings.location?.pinCode || '302020'} />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save Location</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 8. TAB: APK DOWNLOAD ================= */}
          <div className={`tab-pane ${activeTab === 'tabApp' ? 'active' : ''}`} id="tabApp">
            <div className="admin-card">
              <h2>APK Version &amp; Download Links</h2>
              <form id="appSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'APK & App Version settings saved!')}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Latest App Version (e.g. 5.28.1)</label>
                    <input type="text" name="appVersion" defaultValue={settings.appVersion || '5.28.1'} required />
                  </div>
                  <div className="form-group">
                    <label>APK File Size (e.g. 11.1 MB)</label>
                    <input type="text" name="apkFileSize" defaultValue={settings.apkFileSize || '11.1 MB'} />
                  </div>
                  <div className="form-group full-width">
                    <label>Direct APK Download URL</label>
                    <input type="text" name="apkDownloadUrl" defaultValue={settings.apkDownloadUrl || '/downloads/RiderSaathi-v5.28.1.apk'} required />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save APK Details</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 9. TAB: GUIDES CRUD ================= */}
          <div className={`tab-pane ${activeTab === 'tabGuides' ? 'active' : ''}`} id="tabGuides">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Driver Guides &amp; Tutorials ({guides.length})</h2>
                  <div className="admin-card-desc">Educational tutorials and guides for captains:</div>
                </div>
                <button className="btn-primary" onClick={openGuideModalNew}>➕ Add Driver Guide</button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guides.map(g => (
                      <tr key={g.slug}>
                        <td><strong>{g.title}</strong></td>
                        <td><code>{g.slug}</code></td>
                        <td><span className="badge-tag badge-info">{g.category || 'General'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-outline btn-sm" onClick={() => openGuideModalEdit(g)}>Edit</button>
                            <button className="btn-outline btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => deleteGuide(g.slug)}>Delete</button>
                            <Link href={`/guides/${g.slug}`} target="_blank" className="btn-outline btn-sm">View</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= 10. TAB: FAQS CRUD ================= */}
          <div className={`tab-pane ${activeTab === 'tabFaq' ? 'active' : ''}`} id="tabFaq">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Frequently Asked Questions ({faqs.length})</h2>
                  <div className="admin-card-desc">Manage accordion FAQs displayed on /faq and home page:</div>
                </div>
                <button className="btn-primary" onClick={openFaqModalNew}>➕ Add FAQ</button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Question</th>
                      <th style={{ width: '50%' }}>Answer</th>
                      <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.q}</strong></td>
                        <td style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>{f.a}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-outline btn-sm" onClick={() => openFaqModalEdit(f)}>Edit</button>
                            <button className="btn-outline btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => deleteFaq(f.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= 11. TAB: DRIVERS ================= */}
          <div className={`tab-pane ${activeTab === 'tabDrivers' ? 'active' : ''}`} id="tabDrivers">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>All Registered Drivers ({drivers.length})</h2>
                  <div className="admin-card-desc">Live status, subscription management, trial balance &amp; ban switch:</div>
                </div>
                <div className="filter-search-bar" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    className="search-box-input"
                    placeholder="Search by phone, name or model..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredDrivers.length === 0 ? (
                <p style={{ color: 'var(--admin-muted)' }}>No matching drivers found.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Driver / Phone</th>
                        <th>Device &amp; App</th>
                        <th>Trial Left</th>
                        <th>Subscription</th>
                        <th>Total Rides</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDrivers.map(drv => {
                        const trialUsed = drv.trialRidesUsed || 0;
                        const trialTotal = drv.trialRidesTotal || 10;
                        const trialLeft = Math.max(0, trialTotal - trialUsed);

                        let subText = 'None / Trial';
                        let subBadge = 'badge-warning';
                        if (drv.subscription && drv.subscription.expiresAt) {
                          const exp = new Date(drv.subscription.expiresAt);
                          if (exp > new Date()) {
                            const daysLeft = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
                            subText = `${drv.subscription.planName || 'Active'} (${daysLeft}d left)`;
                            subBadge = 'badge-success';
                          } else {
                            subText = 'Expired';
                            subBadge = 'badge-danger';
                          }
                        }

                        return (
                          <tr key={drv.id || drv.phone}>
                            <td>
                              <strong>{drv.name || 'Captain'}</strong><br/>
                              <a href={`https://wa.me/91${drv.phone}`} target="_blank" style={{ color: 'var(--admin-primary)', textDecoration: 'none', fontSize: '12.5px' }}>
                                📱 +91 {drv.phone}
                              </a>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600 }}>{drv.deviceModel || 'Android'}</span><br/>
                              <span style={{ fontSize: '11.5px', color: 'var(--admin-muted)' }}>v{drv.appVersion || '5.28.1'}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 750, color: trialLeft > 0 ? '#10b981' : '#ef4444' }}>
                                {trialLeft} / {trialTotal}
                              </span>
                              <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>free rides</div>
                            </td>
                            <td>
                              <span className={`badge-tag ${subBadge}`}>
                                {subText}
                              </span>
                            </td>
                            <td><strong>{drv.totalRidesAccepted || 0}</strong></td>
                            <td>
                              <span className={`badge-tag ${drv.status === 'banned' ? 'badge-danger' : 'badge-success'}`}>
                                {drv.status || 'active'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <button className="btn-primary btn-sm" onClick={() => grantSubscription(drv.id, 1, '1 Day Pass')}>+1D</button>
                                <button className="btn-primary btn-sm" onClick={() => grantSubscription(drv.id, 7, '7 Days Pass')}>+7D</button>
                                <button className="btn-primary btn-sm" onClick={() => grantSubscription(drv.id, 30, '30 Days Pass')}>+30D</button>
                                <button className="btn-outline btn-sm" onClick={() => grantTrialRides(drv.id, 10)}>+10 Free</button>
                                <button
                                  className="btn-outline btn-sm"
                                  style={{ color: drv.status === 'banned' ? 'green' : 'red' }}
                                  onClick={() => toggleDriverStatus(drv.id)}
                                >
                                  {drv.status === 'banned' ? 'Unban' : 'Ban'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= 12. TAB: ORDERS ================= */}
          <div className={`tab-pane ${activeTab === 'tabOrders' ? 'active' : ''}`} id="tabOrders">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>All Subscription Orders &amp; UPI Leads ({orders.length})</h2>
                  <div className="admin-card-desc">1-click approve, activate and WhatsApp notify:</div>
                </div>
                <div className="filter-search-bar" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    className="search-box-input"
                    placeholder="Search by phone, UTR or Plan..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <p style={{ color: 'var(--admin-muted)' }}>No matching orders found.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Driver Phone</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>UTR / Ref</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(ord => (
                        <tr key={ord.id}>
                          <td>{new Date(ord.createdAt).toLocaleString()}</td>
                          <td><code>{ord.id}</code></td>
                          <td><strong>{ord.phone}</strong></td>
                          <td>{ord.planName}</td>
                          <td><span style={{ fontWeight: 750, color: 'var(--admin-primary)' }}>₹{ord.amount || ord.price}</span></td>
                          <td><code>{ord.utr || 'Waiting'}</code></td>
                          <td>
                            <span className={`badge-tag ${ord.status === 'Activated' ? 'badge-success' : 'badge-warning'}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {ord.status !== 'Activated' ? (
                                <button className="btn-primary btn-sm" onClick={() => approveAndActivateOrder(ord.id)}>
                                  ⚡ Approve &amp; Activate
                                </button>
                              ) : (
                                <button className="btn-outline btn-sm" onClick={() => updateOrderStatus(ord.id, 'Pending')}>
                                  Revert
                                </button>
                              )}
                              <a
                                href={`https://wa.me/91${ord.phone}?text=${encodeURIComponent(`Namaste! Aapka RiderSaathi ${ord.planName} plan verify aur activate ho gaya hai.`)}`}
                                target="_blank"
                                className="btn-outline btn-sm"
                                style={{ textDecoration: 'none' }}
                              >
                                WhatsApp
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= 13. TAB: INQUIRIES ================= */}
          <div className={`tab-pane ${activeTab === 'tabInquiries' ? 'active' : ''}`} id="tabInquiries">
            <div className="admin-card">
              <h2>Driver Contact Messages ({inquiries.length})</h2>
              {inquiries.length === 0 ? (
                <p style={{ color: 'var(--admin-muted)' }}>No messages received yet.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map(inq => (
                        <tr key={inq.id}>
                          <td>{new Date(inq.createdAt).toLocaleString()}</td>
                          <td><strong>{inq.name}</strong></td>
                          <td><code>{inq.phone}</code></td>
                          <td>{inq.subject}</td>
                          <td style={{ maxWidth: '280px', wordBreak: 'break-word' }}>{inq.message}</td>
                          <td>
                            <span className={`badge-tag ${inq.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                              {inq.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              {inq.status !== 'Resolved' && (
                                <button className="btn-primary btn-sm" onClick={() => updateInquiryStatus(inq.id, 'Resolved')}>
                                  Mark Resolved
                                </button>
                              )}
                              <a href={`https://wa.me/91${inq.phone}`} target="_blank" className="btn-outline btn-sm" style={{ textDecoration: 'none' }}>
                                Reply
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= 14. TAB: CONTACT ================= */}
          <div className={`tab-pane ${activeTab === 'tabContact' ? 'active' : ''}`} id="tabContact">
            <div className="admin-card">
              <h2>WhatsApp, Helpline &amp; Customer Support</h2>
              <form id="contactSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'WhatsApp & Contact details saved!')}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Official Support Email</label>
                    <input type="email" name="contactEmail" defaultValue={settings.contactEmail || 'help@ridersaathi.in'} required />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Number</label>
                    <input type="text" name="whatsappNumber" defaultValue={settings.whatsappNumber || '918641011669'} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Office Physical Address</label>
                    <textarea name="officeAddress" rows="2" defaultValue={settings.officeAddress || ''}></textarea>
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save Contact Settings</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 15. TAB: FOOTER ================= */}
          <div className={`tab-pane ${activeTab === 'tabFooter' ? 'active' : ''}`} id="tabFooter">
            <div className="admin-card">
              <h2>Company Details, Ownership &amp; Footer CMS</h2>
              <form id="footerSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'Company & Footer settings saved!')}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Founder / Owner Name</label>
                    <input type="text" name="ownerName" defaultValue={settings.ownerName || 'Shams Raza'} required />
                  </div>
                  <div className="form-group">
                    <label>Legal Business Name</label>
                    <input type="text" name="legalBusinessName" defaultValue={settings.legalBusinessName || 'RiderSaathi Technologies'} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Footer Legal Disclaimer</label>
                    <textarea name="footerDisclaimer" rows="3" defaultValue={settings.footerDisclaimer || ''}></textarea>
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save Company &amp; Footer</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 16. TAB: SEO ================= */}
          <div className={`tab-pane ${activeTab === 'tabSeo' ? 'active' : ''}`} id="tabSeo">
            <div className="admin-card">
              <h2>SEO &amp; Search Engine Optimization</h2>
              <form id="seoSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'SEO metadata saved!')}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Website SEO Title</label>
                    <input type="text" name="seoTitle" defaultValue={settings.seoTitle || ''} />
                  </div>
                  <div className="form-group full-width">
                    <label>Meta Description</label>
                    <textarea name="seoDescription" rows="3" defaultValue={settings.seoDescription || ''}></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Meta Keywords</label>
                    <input type="text" name="seoKeywords" defaultValue={settings.seoKeywords || ''} />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save SEO Settings</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 17. TAB: PAYMENT ================= */}
          <div className={`tab-pane ${activeTab === 'tabPayment' ? 'active' : ''}`} id="tabPayment">
            <div className="admin-card">
              <h2>UPI Payment Gateway Configuration</h2>
              <form id="paymentSettingsForm" onSubmit={(e) => handleSettingsSubmit(e, 'UPI & Payment details saved!')}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>UPI ID (VPA)</label>
                    <input type="text" name="upiId" defaultValue={settings.upiId || 'ridersaathi@upi'} required />
                  </div>
                  <div className="form-group">
                    <label>UPI Payee Display Name</label>
                    <input type="text" name="upiPayeeName" defaultValue={settings.upiPayeeName || 'RiderSaathi'} required />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">💾 Save Payment Settings</button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= 18. TAB: SECURITY ================= */}
          <div className={`tab-pane ${activeTab === 'tabSecurity' ? 'active' : ''}`} id="tabSecurity">
            <div className="admin-card">
              <h2>Admin Login Credentials &amp; Password</h2>
              <form id="credentialsForm" onSubmit={handleCredentialsSubmit}>
                <div className="form-grid" style={{ maxWidth: '500px' }}>
                  <div className="form-group full-width">
                    <label>Admin Email</label>
                    <input type="email" name="newEmail" defaultValue={currentAdminEmail} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" placeholder="Enter current admin password" required />
                  </div>
                  <div className="form-group">
                    <label>New Password (Optional)</label>
                    <input type="password" id="newPassword" name="newPassword" placeholder="Minimum 6 characters" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Repeat new password" />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">🔒 Update Credentials</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Plan Modal */}
      {planModalOpen && (
        <div className="modal-overlay active" id="planModal">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{planForm.id ? `Edit Plan: ${planForm.name}` : 'Add New Pricing Plan'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPlanModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <form id="planForm" onSubmit={handlePlanFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Plan Name (English)</label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="e.g. 1 Week Pass"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Plan Name (Hindi)</label>
                    <input
                      type="text"
                      value={planForm.name_hi}
                      onChange={(e) => setPlanForm({ ...planForm, name_hi: e.target.value })}
                      placeholder="e.g. 1 हफ्ते का पास"
                    />
                  </div>
                  <div className="form-group">
                    <label>Offer Price (₹)</label>
                    <input
                      type="number"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                      placeholder="e.g. 68"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price (₹ cut-off)</label>
                    <input
                      type="number"
                      value={planForm.wasPrice}
                      onChange={(e) => setPlanForm({ ...planForm, wasPrice: e.target.value })}
                      placeholder="e.g. 84"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration in Days</label>
                    <input
                      type="number"
                      value={planForm.durationDays}
                      onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration Text (English)</label>
                    <input
                      type="text"
                      value={planForm.durationText}
                      onChange={(e) => setPlanForm({ ...planForm, durationText: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration Text (Hindi)</label>
                    <input
                      type="text"
                      value={planForm.durationText_hi}
                      onChange={(e) => setPlanForm({ ...planForm, durationText_hi: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ribbon Badge (English)</label>
                    <input
                      type="text"
                      value={planForm.badge}
                      onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                      placeholder="e.g. Popular"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Plan Features (English - One per line)</label>
                    <textarea
                      rows="4"
                      value={planForm.features}
                      onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Plan Features (Hindi - One per line)</label>
                    <textarea
                      rows="4"
                      value={planForm.features_hi}
                      onChange={(e) => setPlanForm({ ...planForm, features_hi: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={planForm.active}
                        onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                        style={{ width: 'auto' }}
                      />
                      Plan Active &amp; Visible on Website
                    </label>
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">Save Plan</button>
                  <button type="button" className="btn-outline" onClick={() => setPlanModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideModalOpen && (
        <div className="modal-overlay active" id="guideModal">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{guideForm.originalSlug ? `Edit Guide: ${guideForm.title}` : 'Add Driver Guide'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setGuideModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <form id="guideForm" onSubmit={handleGuideFormSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Guide Title</label>
                    <input
                      type="text"
                      value={guideForm.title}
                      onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
                      placeholder="e.g. Trip distance aur pickup distance rules"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={guideForm.category}
                      onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>URL Slug (Optional)</label>
                    <input
                      type="text"
                      value={guideForm.slug}
                      onChange={(e) => setGuideForm({ ...guideForm, slug: e.target.value })}
                      placeholder="e.g. trip-distance-rules"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Short Summary</label>
                    <textarea
                      rows="2"
                      value={guideForm.summary}
                      onChange={(e) => setGuideForm({ ...guideForm, summary: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Content (HTML tags allowed)</label>
                    <textarea
                      rows="8"
                      value={guideForm.content}
                      onChange={(e) => setGuideForm({ ...guideForm, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">Save Guide</button>
                  <button type="button" className="btn-outline" onClick={() => setGuideModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModalOpen && (
        <div className="modal-overlay active" id="faqModal">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">{faqForm.id ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setFaqModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <form id="faqForm" onSubmit={handleFaqFormSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Question (Sawal)</label>
                  <input
                    type="text"
                    value={faqForm.q}
                    onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Answer (Jawab)</label>
                  <textarea
                    rows="4"
                    value={faqForm.a}
                    onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">Save FAQ</button>
                  <button type="button" className="btn-outline" onClick={() => setFaqModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
