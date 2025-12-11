# Zimbabwe Mining Sector ESG Features - User Guide

## ✅ Features Status: FULLY IMPLEMENTED & WORKING

All mining sector features are now **completely functional** and visible in the application.

---

## 📍 Where to Find Mining Features

### 1. **Data Entry Page** (`/data-entry`)

#### Step 1: Company Information
- **Sector Dropdown**: Select "Mining & Extractives"
- **Region Dropdown**: Select "Zimbabwe" or "Southern Africa"
- **Framework**: Choose from GRI, SASB, TCFD, or ISSB (IFRS S1 & S2)

#### Step 2: Environmental Metrics (Mining-Specific)
- **Tailings Produced** (tonnes) - GRI-11 Tailings Management
- **Water Discharge** (m³) - GRI-303-4 Water Stewardship
- **Land Rehabilitated** (hectares) - GRI-11 Land Use
- **Biodiversity Impact** (hectares) - GRI-304 Biodiversity

#### Step 3: Social Metrics (Mining-Specific)
- **Fatality Rate** - GRI-403-9 Critical Safety Metric
- **Local Employment Percentage** (%) - GRI-413 Local Communities
- **Community Grievances** (count) - GRI-413 Community Relations

#### Step 4: Governance Metrics (Mining-Specific)
- **Climate Risk Disclosure** - IFRS-S2 Climate Risk
- **Sustainability Governance** - IFRS-S1 Governance

---

### 2. **Reports Page** (`/reports`)

After submitting mining sector data, you will see:

#### Mining Sector ESG Compliance Panel
- **Overall Compliance Score**: Percentage based on 7 standards
- **Visual Compliance Grid**: 7 boxes showing status for:
  - ✅ GRI-11 (Tailings Management)
  - ✅ GRI-303 (Water Stewardship)
  - ✅ GRI-304 (Biodiversity)
  - ✅ GRI-403 (Occupational Health & Safety)
  - ✅ GRI-413 (Local Communities)
  - ✅ IFRS-S1 (Sustainability Governance)
  - ✅ IFRS-S2 (Climate-Related Disclosures)

#### Zimbabwe Mining Requirements Section
Four categories displayed:
1. **Environmental**: Water pollution control, Land rehabilitation, Biodiversity protection
2. **Social**: Local employment targets, Community development, Safety standards
3. **Governance**: Revenue transparency, Anti-corruption, Stakeholder engagement
4. **Investor Focus**: ESG risk scoring, FDI readiness, Export compliance

---

### 3. **Analytics Page** (`/analytics`)

Mining compliance analytics appear automatically when mining data is detected:

#### Mining Sector ESG Compliance Dashboard
- **Compliance Score**: Large percentage indicator (0-100%)
- **7 Standard Compliance Grid**: Visual status for all mining standards
- **Zimbabwe Requirements Coverage**: Detailed breakdown by category
- **Investor Focus Alert**: Highlights that 80% of investors consider ESG critical

---

## 🎯 How to Test Mining Features

### Quick Test Steps:

1. **Navigate to Data Entry** (`/data-entry`)
2. **Fill Company Info**:
   - Company Name: "Zimbabwe Mining Corp"
   - Sector: "Mining & Extractives"
   - Region: "Zimbabwe"
   - Framework: "GRI Standards"

3. **Add Mining Metrics** (any values):
   - Environmental: Tailings Produced = 5000
   - Environmental: Water Discharge = 10000
   - Environmental: Land Rehabilitated = 50
   - Social: Fatality Rate = 0.5
   - Social: Local Employment = 75
   - Governance: Climate Risk Disclosure = "Yes"

4. **Submit Data**

5. **View Results**:
   - Go to `/reports` - See Mining Compliance Panel
   - Go to `/analytics` - See Mining Analytics Dashboard

---

## 📊 Compliance Scoring Logic

The system calculates compliance based on 7 standards:

```javascript
GRI-11:   Tailings data present = ✅
GRI-303:  Water withdrawal + discharge = ✅
GRI-304:  Biodiversity or land rehab = ✅
GRI-403:  Injury rate + fatality rate = ✅
GRI-413:  Community investment + local employment = ✅
IFRS-S1:  Sustainability governance = ✅
IFRS-S2:  Scope 1 emissions + climate risk = ✅

Score = (Compliant Standards / 7) × 100%
```

---

## 🌍 International Standards Alignment

### GRI Mining & Metals Standards
- **GRI-11**: Tailings management (critical for mining)
- **GRI-303**: Water stewardship (water-intensive operations)
- **GRI-304**: Biodiversity (land use impacts)
- **GRI-403**: Occupational health & safety (high-risk industry)
- **GRI-413**: Local communities (social license to operate)

### ISSB Standards (IFRS S1 & S2)
- **IFRS-S1**: General sustainability disclosures & governance
- **IFRS-S2**: Climate-related financial disclosures

### Zimbabwe Mining Sector Requirements
- Environmental compliance (water, land, biodiversity)
- Social responsibility (local employment, community development)
- Governance transparency (revenue, anti-corruption)
- Investor readiness (ESG risk scoring, FDI compliance)

---

## 🚀 Advanced Features

### Framework Selection
Choose reporting framework in Data Entry:
- **GRI Standards**: Global standard (recommended for mining)
- **ISSB (IFRS S1 & S2)**: Climate & sustainability focus
- **SASB**: Industry-specific metrics
- **TCFD**: Climate risk disclosure

### Bulk Import
Upload CSV/Excel with mining metrics:
- Template includes all mining-specific fields
- Auto-validates against GRI-11, GRI-303, GRI-304, GRI-403, GRI-413
- Supports IFRS-S1 and IFRS-S2 columns

### PDF Reports
Generate investor-grade reports:
- Mining compliance summary
- Zimbabwe requirements checklist
- International standards alignment
- Risk assessment & recommendations

---

## 📈 Investor-Grade Reporting

**Why This Matters**:
- 80% of investors consider ESG critical for mining investments
- Zimbabwe mining sector needs international compliance for FDI
- GRI-11 (tailings) is mandatory for mining companies
- IFRS S1/S2 becoming global standard (2024+)

**What You Get**:
- ✅ Investor-ready ESG reports
- ✅ International standard compliance
- ✅ Zimbabwe regulatory alignment
- ✅ Risk assessment & scoring
- ✅ Export & FDI readiness

---

## 🛠️ Technical Implementation

### Files Modified:
1. **DataEntry.js**: Added mining sector/region options + 9 mining metrics
2. **esgFrameworks.js**: Added ISSB and GRI_MINING frameworks
3. **miningMetrics.js**: Created validation logic for 7 standards
4. **Reports.js**: Added mining compliance panel with visual grid
5. **Analytics.js**: Added mining analytics dashboard

### Data Flow:
```
Data Entry → localStorage + Backend → Reports/Analytics → Mining Compliance Check → Display Panel
```

---

## ❓ FAQ

**Q: Do I need to fill all mining metrics?**
A: No, but more data = higher compliance score. Minimum: 1 metric per standard.

**Q: Can I use this for non-mining companies?**
A: Yes! Mining features only appear when sector="mining" or region="zimbabwe".

**Q: Which framework should I choose?**
A: GRI Standards (most comprehensive) or ISSB (climate-focused).

**Q: How do I export mining reports?**
A: Go to Reports page → Select framework → Click "Generate PDF".

**Q: Is this Zimbabwe-specific?**
A: No, it follows international GRI & IFRS standards applicable globally.

---

## 📞 Support

For issues or questions:
1. Check Data Entry form has mining sector selected
2. Verify at least one mining metric is filled
3. Submit data and navigate to Reports/Analytics
4. Mining compliance panel should appear automatically

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: ✅ Production Ready
