# 📋 Final Checklist — ก่อนลงทุนจริง (Investment Pre-Flight Checklist)

เว็บแอปพลิเคชัน Interactive Checklist สำหรับนักลงทุนรายบุคคล ใช้ตรวจสอบและกลั่นกรองหุ้นรายตัว (Individual Stock) และ ETF ก่อนตัดสินใจกดซื้อ (BUY) เพื่อความมีวินัยและการบริหารความเสี่ยงอย่างเป็นระบบ

---

## ✨ ฟีเจอร์หลัก (Features)

1. **Interactive Checklists 8+1 หมวดหมู่ครบถ้วน**:
   - **01. ตัวเราเอง (Self-Assessment & Mindset)**: ตรวจสอบเงินสำรอง สภาวะจิตใจ และตัดอารมณ์ FOMO
   - **02. เรารู้ไหมว่ากำลังซื้ออะไร (Business Understanding)**: สลับดูระหว่าง **หุ้นรายตัว** หรือ **ETF** ได้ทันที
   - **03. ธุรกิจแข็งแรงไหม (Financial Health & Fundamentals)**: ตรวจสอบงบการเงินย้อนหลัง Revenue, Margins, FCF, Debt, ROIC, Dilution
   - **04. หุ้นดี แล้วราคาดีไหม (Valuation & Price)**: ประเมินความคุ้มค่า พร้อม Cheat-sheet แนะนำ Valuation Ratio ตามประเภทธุรกิจ
   - **05. มี Investment Thesis หรือยัง (Thesis Builder)**: มีช่องให้กรอกสรุปเหตุผล 3 ข้อ, ตัวเร่งการเติบโต (Growth Drivers), ความเสี่ยงหลัก (Risks) และจุดที่สมมติฐานพัง (Thesis Break)
   - **06. Portfolio รับมันไหวไหม (Portfolio Risk & Allocation)**: บริหารสัดส่วน Position Sizing และผลกระทบต่อพอร์ต
   - **07. มีแผนหลังจากซื้อหรือยัง (Post-Purchase Action Plan)**: เตรียมแผนรับมือล่วงหน้าในทุกสถานการณ์ (ขึ้น / ลง / ตัน)
   - **08. Technical — ใช้เป็นเครื่องมือเสริม**: ใช้กราฟช่วยดูจังหวะและแนวรับ-แนวต้าน
   - **09. ก่อนกด BUY ถามตัวเองครั้งสุดท้าย (Pre-Flight 10 Questions)**: บอร์ดสรุปคำถามเด็ดขาด 10 ข้อก่อนเคาะขวา
2. **ระบบคิดคะแนนความพร้อม Real-time Score Ring**: คำนวณ % ความพร้อมทันที พร้อมเปลี่ยนสีเตือนสติ
3. **ระบบจัดการบันทึกหลาย Ticker (Multi-Asset Profiles)**: สร้างและสลับเช็กลิสต์แยกตามหุ้นแต่ละตัว (เช่น NVDA, VOO, BDMS) บันทึกอัตโนมัติลงใน `localStorage`
4. **Smart Filtering**: กรองเฉพาะข้อที่เกี่ยวข้องเมื่อเลือกประเภทเป็น หุ้นรายตัว หรือ ETF
5. **Export & Sharing**:
   - 📋 **คัดลอกเป็น Markdown**: นำไปวางใน Obsidian, Notion, Logseq หรือ Trading Journal ได้ทันที
   - 🖨️ **พิมพ์ / บันทึก PDF**: ออกแบบ Print Stylesheet สำหรับบันทึกเป็น Investment Memo สวยงาม
6. **Modern Design & Dark/Light Theme**: ธีม Fintech Terminal สุดหรู รองรับการแสดงผลทุกหน้าจอทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์

---

## 🚀 วิธีเปิดใช้งานในเครื่อง (Local Run)

คุณสามารถดับเบิลคลิกเปิดไฟล์ `index.html` บนเบราว์เซอร์ใดก็ได้ (Chrome, Edge, Safari, Firefox) โดยไม่ต้องติดตั้งโปรแกรมเสริมใด ๆ หรือเปิดผ่าน Local Server:

```bash
# ทางเลือก: เปิดด้วย npx serve หรือ Live Server
npx serve .
```

---

## 🌐 วิธีนำขึ้นโฮสต์บน GitHub Pages (Step-by-Step)

### วิธีที่ 1: ผ่าน Git Terminal (แนะนำ)

1. **สร้าง Git Repository และ Commit ไฟล์:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Pre-investment checklist web app"
   ```

2. **สร้าง Repository บน GitHub:**
   - ไปที่ [github.com/new](https://github.com/new)
   - ตั้งชื่อคลัง เช่น `investment-checklist`
   - เลือก **Public** และคลิก **Create repository**

3. **Push โค้ดขึ้น GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```

4. **เปิดใช้งาน GitHub Pages:**
   - ในหน้า Repository บน GitHub ไปที่ **Settings** &rarr; **Pages** (เมนูด้านซ้าย)
   - ที่หัวข้อ **Build and deployment > Source**:
     - เลือก **GitHub Actions** (ระบบจะรัน Workflow `.github/workflows/deploy.yml` อัตโนมัติ)
     - หรือเลือก **Deploy from a branch** &rarr; เลือก Branch `main` โฟลเดอร์ `/ (root)` แล้วกด **Save**
   - รอ 1-2 นาที คุณจะได้ URL เว็บไซต์ เช่น: `https://<YOUR_GITHUB_USERNAME>.github.io/<REPO_NAME>/`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
d:/Cyn/Checklist/
├── index.html                  # หน้าเว็บหลักและโครงสร้างเนื้อหา
├── css/
│   └── style.css               # สไตล์ลิ่ง ดีไซน์ระบบ Dark/Light, Glassmorphism, Print CSS
├── js/
│   └── app.js                  # ระบบคำนวณคะแนน, กรองประเภท, Autosave, Profiles, Markdown Export
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions สำหรับ Deploy ไปยัง GitHub Pages อัตโนมัติ
└── README.md                   # คู่มือการใช้งานและติดตั้ง
```

---

> **“ไม่ซื้อก็ไม่เสียอะไร ตลาดยังอยู่พรุ่งนี้”**  
> *หน้าที่ของนักลงทุนไม่ใช่ซื้อหุ้นให้เยอะที่สุด แต่คือเลือกลงทุนเฉพาะสิ่งที่เราเข้าใจ และคิดว่าราคากับความเสี่ยงสมเหตุสมผล*
