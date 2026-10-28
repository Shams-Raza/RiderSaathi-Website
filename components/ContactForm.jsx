'use client';

import React, { useState } from 'react';

export default function ContactForm({ lang = 'hi' }) {
  const isEn = lang === 'en';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'Payment & Plan Activation',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.ok || result.success) {
        setFormData({
          name: '',
          phone: '',
          subject: 'Payment & Plan Activation',
          message: '',
        });
        setAlert({
          type: 'success',
          message: isEn
            ? 'Message Received! We have received your query. Our support team will get back to you on WhatsApp or call shortly.'
            : 'Aapka sandesh mil gaya hai. Hamari support team aapse WhatsApp ya call par jald revert karegi.',
        });
      } else {
        setAlert({
          type: 'error',
          message: result.error || result.message || (isEn ? 'Could not send message.' : 'Sandesh bhejne me samasya aayi.'),
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: isEn
          ? 'Network error. Please try again or WhatsApp directly.'
          : 'Network error. Kripya dubara koshish karein ya seedhe WhatsApp karein.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {alert && (
        <div
          id="contactAlert"
          className={`notice-box ${alert.type === 'success' ? 'success' : 'danger'}`}
          style={{ display: 'block', marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <strong>{alert.type === 'success' ? (isEn ? 'Success!' : 'संदेश प्राप्त!') : (isEn ? 'Error!' : 'त्रुटि!')}</strong>{' '}
          {alert.message}
        </div>
      )}

      <form id="contactForm" className="delform" onSubmit={handleSubmit}>
        <label htmlFor="cName" style={{ marginTop: 0 }}>
          {isEn ? 'Your Name' : 'आपका नाम'}
        </label>
        <input
          type="text"
          id="cName"
          name="name"
          placeholder={isEn ? 'Driver / Captain Name' : 'ड्राइवर / कप्तान का नाम'}
          required
          value={formData.name}
          onChange={handleChange}
        />

        <label htmlFor="cPhone">{isEn ? 'Mobile Number (10 Digits)' : 'मोबाइल नंबर (10 अंक)'}</label>
        <input
          type="tel"
          id="cPhone"
          name="phone"
          placeholder={isEn ? '10-digit number' : '10 अंकों का नंबर'}
          required
          pattern="[0-9]{10}"
          maxLength={10}
          value={formData.phone}
          onChange={handleChange}
        />

        <label htmlFor="cSubject">{isEn ? 'Topic / Subject' : 'मुद्दा / विषय'}</label>
        <select id="cSubject" name="subject" required value={formData.subject} onChange={handleChange}>
          <option value="Payment & Plan Activation">
            {isEn ? 'Payment & Plan Activation' : 'पेमेंट और प्लान एक्टिवेशन'}
          </option>
          <option value="App Installation & Permissions">
            {isEn ? 'App Installation & Permissions' : 'ऐप इंस्टॉलेशन और परमिशन'}
          </option>
          <option value="Rules & Booking Filtering">
            {isEn ? 'Rules & Booking Filtering' : 'रूल्स और बुकिंग फ़िल्टर'}
          </option>
          <option value="Refund Request">{isEn ? 'Refund Request' : 'रिफंड रिक्वेस्ट'}</option>
          <option value="Other">{isEn ? 'Other / General Question' : 'अन्य / सामान्य सवाल'}</option>
        </select>

        <label htmlFor="cMessage">{isEn ? 'Your Message / Issue' : 'आपका संदेश / समस्या'}</label>
        <textarea
          id="cMessage"
          name="message"
          rows={4}
          placeholder={isEn ? 'Describe your issue here...' : 'अपनी समस्या यहाँ विस्तार से लिखें...'}
          required
          value={formData.message}
          onChange={handleChange}
        ></textarea>

        <button type="submit" className="btn" style={{ width: '100%', marginTop: '18px', padding: '13px' }} disabled={isSubmitting}>
          {isSubmitting ? (isEn ? 'Sending message...' : 'भेजा जा रहा है...') : (isEn ? 'Submit Message' : 'संदेश भेजें')}
        </button>
      </form>
    </div>
  );
}
