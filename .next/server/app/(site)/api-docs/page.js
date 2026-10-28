"use strict";(()=>{var e={};e.id=668,e.ids=[668],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},9273:(e,t,r)=>{r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>x,originalPathname:()=>c,pages:()=>l,routeModule:()=>f,tree:()=>d}),r(4317),r(4437),r(7764),r(9204),r(1888);var a=r(3191),i=r(8716),o=r(7922),n=r.n(o),s=r(5231),p={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(p[e]=()=>s[e]);r.d(t,p);let d=["",{children:["(site)",{children:["api-docs",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,4317)),"C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\(site)\\api-docs\\page.js"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4437)),"C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\(site)\\layout.js"],metadata:{icon:[],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}]},{layout:[()=>Promise.resolve().then(r.bind(r,7764)),"C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\layout.js"],loading:[()=>Promise.resolve().then(r.bind(r,9204)),"C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\loading.js"],"not-found":[()=>Promise.resolve().then(r.bind(r,1888)),"C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\not-found.js"],metadata:{icon:[],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}],l=["C:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\RiderSaathi-Website\\app\\(site)\\api-docs\\page.js"],c="/(site)/api-docs/page",x={require:r,loadChunk:()=>Promise.resolve()},f=new a.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(site)/api-docs/page",pathname:"/api-docs",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4317:(e,t,r)=>{r.r(t),r.d(t,{default:()=>n,generateMetadata:()=>o});var a=r(9510);r(1159);var i=r(9652);async function o(){let e=(0,i.getSettings)();return{title:`Mobile App API Documentation — ${e.siteName||"RiderSaathi"}`,description:`API specifications for ${e.siteName||"RiderSaathi"} Android & Flutter app integration.`}}function n(){let e=(0,i.getSettings)();return(0,a.jsxs)("div",{style:{maxWidth:"1040px",margin:"40px auto 80px",padding:"0 20px"},children:[(0,a.jsxs)("div",{style:{textAlign:"center",marginBottom:"40px"},children:[a.jsx("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"999px",fontSize:"13px",fontWeight:700,background:"rgba(30, 102, 245, 0.1)",color:"var(--brand-primary)",marginBottom:"16px"},children:"⚡ Android & Flutter App Integration"}),(0,a.jsxs)("h1",{style:{fontSize:"32px",fontWeight:800,color:"var(--text-heading)",marginBottom:"12px"},children:[e.siteName||"RiderSaathi"," Mobile App REST APIs"]}),a.jsx("p",{style:{fontSize:"16px",color:"var(--text-muted)",maxWidth:"680px",margin:"0 auto"},children:"Use these production-ready endpoints to connect the RiderSaathi Android APK with your live backend for authentication, 10 free trial rides counter, active subscription verification, filter rules sync, and OTA updates."}),(0,a.jsxs)("div",{style:{marginTop:"16px",fontFamily:"var(--font-mono)",fontSize:"14px",background:"rgba(30,102,245,0.06)",padding:"8px 16px",borderRadius:"8px",display:"inline-block"},children:["Base URL: ",a.jsx("strong",{children:"https://ridersaathi.onrender.com/api/app"})]})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#e0f2fe",color:"#0284c7"},children:"POST"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/auth"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Driver Login or Registration. Automatically assigns 10 Free Trial Rides on new sign up, checks existing subscription, and returns auth token with driver filter rules."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Request Body (JSON)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "phone": "9876543210",
  "name": "Raju Captain",
  "deviceId": "android-uuid-99a12c",
  "deviceModel": "Xiaomi Redmi Note 12",
  "appVersion": "5.28.1"
}`})}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Response (200 OK)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "success": true,
  "message": "Authenticated successfully",
  "token": "token_17300000_abc123",
  "driver": {
    "id": "DRV-1730000001",
    "phone": "9876543210",
    "name": "Raju Captain",
    "status": "active"
  },
  "access": {
    "accessGranted": true,
    "reason": "trial_active",
    "message": "Free trial active: 10 rides remaining",
    "trial": { "total": 10, "used": 0, "remaining": 10 },
    "subscription": { "isActive": false, "daysLeft": 0 }
  },
  "filterRules": {
    "minFare": 50,
    "maxPickupDistanceKm": 2.5,
    "minFarePerKm": 12,
    "platforms": { "rapido": true, "uber": true, "porter": true },
    "autoAccept": true
  }
}`})})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#dcfce7",color:"#16a34a"},children:"GET"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/status"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Verify if the driver is currently allowed to filter rides. Returns trial status or days left in active paid subscription."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Headers"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`Authorization: Bearer <token>
// OR Query param: ?phone=9876543210`})}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Response (200 OK)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "success": true,
  "accessGranted": true,
  "reason": "active_subscription",
  "subscription": {
    "isActive": true,
    "planName": "1 Week Pass",
    "expiresAt": "2026-10-28T12:00:00.000Z",
    "daysLeft": 7
  },
  "trial": { "total": 10, "used": 10, "remaining": 0 },
  "serverTime": "2026-10-21T16:40:00.000Z"
}`})})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#e0f2fe",color:"#0284c7"},children:"POST"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/ride/record"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Triggered when RiderSaathi accessibility service accepts or filters a matching ride. Deducts 1 ride from the 10 free trial rides (if in trial mode) and updates driver stats."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Request Body (JSON)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "token": "token_17300000_abc123",
  "platform": "rapido",
  "fare": 95,
  "pickupDistanceKm": 1.4,
  "tripDistanceKm": 6.8
}`})}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Response (200 OK)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "success": true,
  "message": "Ride recorded successfully",
  "access": {
    "accessGranted": true,
    "reason": "trial_active",
    "trial": { "total": 10, "used": 1, "remaining": 9 }
  }
}`})})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#e0f2fe",color:"#0284c7"},children:"POST"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/rules/sync"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Saves the driver's custom filter settings (Min Fare, Max Pickup, Platforms) to cloud so settings are never lost on phone restart."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Request Body (JSON)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "token": "token_17300000_abc123",
  "filterRules": {
    "minFare": 60,
    "maxPickupDistanceKm": 2.0,
    "minFarePerKm": 14,
    "platforms": { "rapido": true, "uber": true, "porter": false },
    "passengers": true,
    "parcels": false,
    "autoAccept": true,
    "voiceAlert": true
  }
}`})})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#dcfce7",color:"#16a34a"},children:"GET"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/check-update?version=5.28.1"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Checks if a newer APK is released. Prompts the driver to download update."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Response (200 OK)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "hasUpdate": false,
  "latestVersion": "5.28.1",
  "apkUrl": "https://ridersaathi.onrender.com/downloads/RiderSaathi-v5.28.1.apk",
  "apkFileSize": "11.1 MB",
  "releaseNotes": "Faster Rapido & Uber filter response with Android 14 support",
  "isForceUpdate": false
}`})})]}),(0,a.jsxs)("div",{className:"card",style:{border:"1px solid var(--border)",borderRadius:"16px",padding:"24px",marginBottom:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.03)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"13px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",background:"#e0f2fe",color:"#0284c7"},children:"POST"}),a.jsx("span",{style:{fontFamily:"var(--font-mono)",fontSize:"16px",fontWeight:600,color:"var(--text-heading)"},children:"/api/app/order/create"})]}),a.jsx("div",{style:{fontSize:"14.5px",color:"var(--text-muted)",marginBottom:"16px",lineHeight:1.5},children:"Initiate plan subscription directly inside the mobile app. Returns UPI payment intent string and QR details."}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Request Body (JSON)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "planId": "week1",
  "phone": "9876543210"
}`})}),a.jsx("div",{style:{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"14px"},children:"Response (200 OK)"}),a.jsx("pre",{style:{background:"#0f172a",color:"#f8fafc",fontFamily:"var(--font-mono)",fontSize:"13px",padding:"16px",borderRadius:"10px",overflowX:"auto",marginTop:"8px"},children:a.jsx("code",{children:`{
  "success": true,
  "orderId": "ORD-17300000-ABC",
  "planName": "1 Week",
  "amount": 68,
  "upiString": "upi://pay?pa=ridersaathi@upi&pn=RiderSaathi&am=68&tn=RiderSaathi_week1",
  "upiId": "ridersaathi@upi"
}`})})]})]})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,348,155,145],()=>r(9273));module.exports=a})();