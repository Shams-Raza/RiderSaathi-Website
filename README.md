# RiderSaathi Website

Official website and admin management system for **RiderSaathi** — Smart Ride Filter & Driver Productivity Assistant for Rapido, Uber, and Porter drivers.

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the website server
npm start
```

The website will be live at:
- **Public Website:** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin`
- **Default Admin Password:** `admin123`

---

## 🛠️ Features Included

1. **Complete Public Pages (Matching Lapak style & structure):**
   - **Home (`/`)**: Hero section, driver problems, feature list, plan cards, WhatsApp updates, 3-step start guide, guides preview.
   - **Pricing (`/pricing`)**: 1 Day, 1 Week, 1 Month prepaid plans with instant activation instructions.
   - **Install (`/install`)**: Android installation guide, Play Protect bypass, Android 13+ restricted settings, Vivo/Oppo/Realme/Xiaomi battery optimizations, verified SHA-256 fingerprints.
   - **Direct Download (`/download`)**: Live APK download counter and file delivery.
   - **Buy Plan (`/buy` & `/buy/upi`)**: Mobile number registration, plan picker, order generation, UPI payment instructions with one-click copy button and direct UPI app launcher.
   - **Guides (`/guides` & `/guides/:slug`)**: Categorized guides for drivers on rules, settings, and strategies.
   - **FAQ (`/faq`)**: Driver-focused questions and answers.
   - **Updates (`/updates`)**: Version changelog and update guides.
   - **About (`/about`)**: Story of why RiderSaathi was built, founder vision, business details.
   - **Contact (`/contact`)**: Contact details, WhatsApp chat, and **working contact form**.
   - **Legal Policies (`/refunds`, `/delivery`, `/terms`, `/privacy`)**: Fully drafted terms, refund policies, and privacy notices.

2. **Full Admin Control Panel (`/admin`):**
   - **Dashboard Overview**: Live visitor counter, APK download counter, plan orders count, contact inquiries count.
   - **Owner & Site Info Manager**: Change website name, founder name, business registration, contact email, WhatsApp number, Telegram link, address, support timings, and top banner alert.
   - **APK & Download Manager**: Update APK version, file size, download link, and SHA-256 checksums.
   - **UPI & Payment Settings**: Update receiving UPI ID and Payee name for manual payments.
   - **Pricing Plans Manager**: Add, edit, or delete subscription plans and badges.
   - **Orders & Buy Leads**: Live table of all driver subscription requests with quick WhatsApp reply links and activation status toggles.
   - **Inquiries Manager**: Review driver contact messages and reply via WhatsApp.
   - **FAQ Manager**: Add or delete FAQs.
   - **Security**: Change admin password and download complete JSON backups.

---

## 📝 Information You Can Customize

All data is stored in the `data/` folder and can be modified directly or via the **Admin Panel (`/admin`)**:
- `data/settings.json`: Site settings, owner information, contact details, UPI details.
- `data/plans.json`: Pricing plans.
- `data/faqs.json`: FAQ items.
- `data/guides.json`: Driver guide articles.
- `data/updates.json`: Version changelogs.
- `data/inquiries.json`: Contact messages from drivers.
- `data/orders.json`: Subscription buy orders.
- `data/stats.json`: Visitor and download statistics.