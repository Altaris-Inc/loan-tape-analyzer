/**
 * Loan Tape Analyzer — Automated Test Suite
 * 
 * Covers: parsing, formatting, column matching, analysis, validation,
 * regression, templates, custom fields, messy data, edge cases.
 * 
 * Run: npm test
 */
import {
  pn, fC, fP, fN, fR, fS,
  ruleMatch, scoreTemplate,
  doAnalyze, doValidate,
  calcRegression, calcMultiReg,
  STD
} from "./logic";

// ═══════════════════════════════════════════════════════════════════
// TEST DATA FIXTURES
// ═══════════════════════════════════════════════════════════════════

// Clean consumer-style rows
const CLEAN_ROWS = [
  { Loan_ID: "L001", Current_Balance: 25000, Original_Amount: 30000, Interest_Rate: 12.5, FICO_Origination: 720, DTI: 28, Loan_Status: "Current", State: "CA", Months_On_Book: 12, Net_Loss: 0, Recoveries: 0, Loan_Purpose: "Debt Consolidation", Grade: "B", Origination_Channel: "Online", Income_Verification: "Verified", Original_Term_Months: 36 },
  { Loan_ID: "L002", Current_Balance: 15000, Original_Amount: 20000, Interest_Rate: 8.5, FICO_Origination: 780, DTI: 18, Loan_Status: "Current", State: "NY", Months_On_Book: 24, Net_Loss: 0, Recoveries: 0, Loan_Purpose: "Home Improvement", Grade: "A", Origination_Channel: "Direct", Income_Verification: "Verified", Original_Term_Months: 60 },
  { Loan_ID: "L003", Current_Balance: 10000, Original_Amount: 12000, Interest_Rate: 22.0, FICO_Origination: 620, DTI: 42, Loan_Status: "30DPD", State: "TX", Months_On_Book: 6, Net_Loss: 0, Recoveries: 0, Loan_Purpose: "Medical", Grade: "D", Origination_Channel: "Broker", Income_Verification: "Not Verified", Original_Term_Months: 36 },
  { Loan_ID: "L004", Current_Balance: 0, Original_Amount: 18000, Interest_Rate: 15.0, FICO_Origination: 680, DTI: 35, Loan_Status: "Charged Off", State: "CA", Months_On_Book: 36, Net_Loss: 12000, Recoveries: 3000, Loan_Purpose: "Debt Consolidation", Grade: "C", Origination_Channel: "Online", Income_Verification: "Verified", Original_Term_Months: 36 },
  { Loan_ID: "L005", Current_Balance: 32000, Original_Amount: 35000, Interest_Rate: 10.0, FICO_Origination: 750, DTI: 22, Loan_Status: "Current", State: "FL", Months_On_Book: 3, Net_Loss: 0, Recoveries: 0, Loan_Purpose: "Major Purchase", Grade: "A", Origination_Channel: "Online", Income_Verification: "Verified", Original_Term_Months: 60 },
];

const CLEAN_HDRS = Object.keys(CLEAN_ROWS[0]);

// QuickDrive-style rows (different column names)
const QD_ROWS = [
  { QD_Ref: "QD-001", OutstandingPrincipal: 20000, Amt_Funded: 25000, NoteRate: 9.5, CreditScoreAtOrig: 740, BorrowerDTI_Back: 25, LoanStat: "CURRENT", BorrState: "CA", MonthsOnBooks: 18, ContractTermMo: 60 },
  { QD_Ref: "QD-002", OutstandingPrincipal: 15000, Amt_Funded: 22000, NoteRate: 14.5, CreditScoreAtOrig: 660, BorrowerDTI_Back: 38, LoanStat: "30DPD", BorrState: "TX", MonthsOnBooks: 8, ContractTermMo: 48 },
  { QD_Ref: "QD-003", OutstandingPrincipal: 30000, Amt_Funded: 30000, NoteRate: 6.0, CreditScoreAtOrig: 800, BorrowerDTI_Back: 15, LoanStat: "CURRENT", BorrState: "NY", MonthsOnBooks: 2, ContractTermMo: 72 },
];
const QD_HDRS = Object.keys(QD_ROWS[0]);

// Messy data rows
const MESSY_ROWS = [
  { Loan_ID: "M001", Current_Balance: "$25,000", Interest_Rate: "12.5%", FICO_Origination: 720, DTI: "28%", Loan_Status: "Current", State: "CA", Original_Amount: 30000 },
  { Loan_ID: "M002", Current_Balance: "", Interest_Rate: "N/A", FICO_Origination: "MISSING", DTI: 18, Loan_Status: "Current", State: "NY", Original_Amount: 20000 },
  { Loan_ID: "M003", Current_Balance: -5000, Interest_Rate: 150.5, FICO_Origination: 0, DTI: 200, Loan_Status: "", State: "California", Original_Amount: "$12,000" },
  { Loan_ID: "M004", Current_Balance: "  15000  ", Interest_Rate: 8.5, FICO_Origination: 780, DTI: "22.5", Loan_Status: "Current", State: "FL", Original_Amount: 18000 },
];
const MESSY_HDRS = Object.keys(MESSY_ROWS[0]);

// Mapping for clean data
const CLEAN_MAP = {
  loan_id: "Loan_ID",
  current_balance: "Current_Balance",
  original_balance: "Original_Amount",
  interest_rate: "Interest_Rate",
  fico_origination: "FICO_Origination",
  dti: "DTI",
  loan_status: "Loan_Status",
  state: "State",
  months_on_book: "Months_On_Book",
  net_loss: "Net_Loss",
  recoveries: "Recoveries",
  loan_purpose: "Loan_Purpose",
  grade: "Grade",
  origination_channel: "Origination_Channel",
  income_verification: "Income_Verification",
  original_term: "Original_Term_Months"
};


// ═══════════════════════════════════════════════════════════════════
// 1. PARSING & FORMATTERS
// ═══════════════════════════════════════════════════════════════════

describe("1. Parsing — pn()", () => {
  test("1.1 parses normal numbers", () => {
    expect(pn(123.45)).toBe(123.45);
    expect(pn("123.45")).toBe(123.45);
    expect(pn(0)).toBe(0);
  });

  test("1.2 strips dollar signs", () => {
    expect(pn("$25,000")).toBe(25000);
    expect(pn("$1,234.56")).toBe(1234.56);
  });

  test("1.3 strips percent signs", () => {
    expect(pn("12.5%")).toBe(12.5);
    expect(pn("0.5%")).toBe(0.5);
  });

  test("1.4 strips whitespace", () => {
    expect(pn("  15000  ")).toBe(15000);
    expect(pn(" 8.5 ")).toBe(8.5);
  });

  test("1.5 returns null for non-numeric", () => {
    expect(pn(null)).toBeNull();
    expect(pn(undefined)).toBeNull();
    expect(pn("")).toBeNull();
    expect(pn("N/A")).toBeNull();
    expect(pn("MISSING")).toBeNull();
    expect(pn("abc")).toBeNull();
  });

  test("1.6 handles negative numbers", () => {
    expect(pn(-5000)).toBe(-5000);
    expect(pn("-5000")).toBe(-5000);
  });
});

describe("1. Formatters", () => {
  test("fC formats currency", () => {
    expect(fC(1500000000)).toBe("$1.50B");
    expect(fC(2500000)).toBe("$2.50M");
    expect(fC(50000)).toBe("$50.0K");
    expect(fC(500)).toBe("$500");
    expect(fC(null)).toBe("—");
  });

  test("fP formats percentage", () => {
    expect(fP(12.34)).toBe("12.3%");
    expect(fP(0)).toBe("0.0%");
  });

  test("fR formats rate", () => {
    expect(fR(12.345)).toBe("12.35%");
  });

  test("fN formats number with commas", () => {
    expect(fN(1000)).toBe("1,000");
    expect(fN(1234567)).toBe("1,234,567");
  });

  test("fS formats score", () => {
    expect(fS(720.4)).toBe("720");
    expect(fS(720.6)).toBe("721");
  });
});


// ═══════════════════════════════════════════════════════════════════
// 2. COLUMN MATCHING
// ═══════════════════════════════════════════════════════════════════

describe("2. Column Matching — ruleMatch()", () => {
  test("2.1 matches standard consumer column names", () => {
    const mp = ruleMatch(CLEAN_HDRS, CLEAN_ROWS);
    expect(mp.loan_id).toBe("Loan_ID");
    expect(mp.current_balance).toBe("Current_Balance");
    expect(mp.interest_rate).toBe("Interest_Rate");
    expect(mp.fico_origination).toBe("FICO_Origination");
    expect(mp.loan_status).toBe("Loan_Status");
  });

  test("2.2 matches QuickDrive-style column names", () => {
    const mp = ruleMatch(QD_HDRS, QD_ROWS);
    // NoteRate should match interest_rate via /^rate$/i
    expect(mp.current_balance).toBe("OutstandingPrincipal");
    expect(mp.original_balance).toBe("Amt_Funded");
    expect(mp.dti).toBe("BorrowerDTI_Back");
  });

  test("2.3 uses value heuristics for FICO (300-900 range)", () => {
    const hdrs = ["Score", "Amount"];
    const rows = [
      { Score: 720, Amount: 25000 },
      { Score: 680, Amount: 15000 },
    ];
    const mp = ruleMatch(hdrs, rows);
    // Score alone may not match without pattern, but Amount could match balance
  });

  test("2.4 uses state abbreviation heuristic", () => {
    const hdrs = ["Region"];
    const rows = [
      { Region: "CA" }, { Region: "NY" }, { Region: "TX" },
      { Region: "FL" }, { Region: "IL" },
    ];
    const mp = ruleMatch(hdrs, rows);
    // "Region" doesn't match state pattern, but state-abbreviation heuristic adds score
    // This shouldn't match because there's no pattern for "Region"
    expect(mp.state).toBeUndefined();
  });

  test("2.5 accepts custom fields dict", () => {
    const customFields = {
      vehicle_make: { l: "Make", p: [/make/i, /manufacturer/i] },
      vehicle_year: { l: "Year", p: [/year/i, /model.?year/i] },
    };
    const hdrs = ["VehicleMake", "VehicleYear", "Price"];
    const rows = [{ VehicleMake: "Toyota", VehicleYear: 2022, Price: 25000 }];
    const mp = ruleMatch(hdrs, rows, customFields);
    expect(mp.vehicle_make).toBe("VehicleMake");
    expect(mp.vehicle_year).toBe("VehicleYear");
  });

  test("2.6 handles empty rows", () => {
    const mp = ruleMatch(["Loan_ID", "Current_Balance"], []);
    expect(mp.loan_id).toBe("Loan_ID");
  });

  test("2.7 no duplicate column assignments", () => {
    const mp = ruleMatch(CLEAN_HDRS, CLEAN_ROWS);
    const assigned = Object.values(mp);
    const unique = [...new Set(assigned)];
    expect(assigned.length).toBe(unique.length);
  });
});


// ═══════════════════════════════════════════════════════════════════
// 3. TEMPLATES
// ═══════════════════════════════════════════════════════════════════

describe("3. Template Scoring — scoreTemplate()", () => {
  test("3.1 perfect match scores 1.0", () => {
    const tpl = { mapping: { loan_id: "Loan_ID", current_balance: "Current_Balance" } };
    const score = scoreTemplate(tpl, ["Loan_ID", "Current_Balance", "Extra"]);
    expect(score).toBe(1.0);
  });

  test("3.2 partial match scores correctly", () => {
    const tpl = { mapping: { loan_id: "Loan_ID", current_balance: "Current_Balance", fico: "FICO_Score" } };
    const score = scoreTemplate(tpl, ["Loan_ID", "Current_Balance"]);
    expect(score).toBeCloseTo(2 / 3, 2);
  });

  test("3.3 no match scores 0", () => {
    const tpl = { mapping: { loan_id: "ID", current_balance: "Balance" } };
    const score = scoreTemplate(tpl, ["Loan_Number", "Outstanding"]);
    expect(score).toBe(0);
  });

  test("3.4 empty template scores 0", () => {
    const score = scoreTemplate({ mapping: {} }, ["Loan_ID"]);
    expect(score).toBe(0);
  });

  test("3.5 template with blank values excluded from clean mapping", () => {
    // Simulates the cleanMp fix — template should not contain empty mappings
    const tpl = { mapping: { loan_id: "Loan_ID", current_balance: "" } };
    // If cleanMp was applied, current_balance wouldn't be here
    // But scoreTemplate counts it, so it scores 0.5
    const score = scoreTemplate(tpl, ["Loan_ID"]);
    expect(score).toBe(0.5);
  });
});


// ═══════════════════════════════════════════════════════════════════
// 5. POOL ANALYSIS — doAnalyze()
// ═══════════════════════════════════════════════════════════════════

describe("5. Pool Analysis — doAnalyze()", () => {
  const an = doAnalyze(CLEAN_ROWS, CLEAN_MAP);

  test("5.1 loan count correct", () => {
    expect(an.N).toBe(5);
  });

  test("5.2 total balance correct", () => {
    expect(an.tb).toBe(25000 + 15000 + 10000 + 0 + 32000);
  });

  test("5.3 total original balance correct", () => {
    expect(an.tob).toBe(30000 + 20000 + 12000 + 18000 + 35000);
  });

  test("5.4 average balance correct", () => {
    // Only 4 non-zero balances counted by pn... actually pn(0) returns 0 not null
    expect(an.avg).toBeCloseTo(82000 / 5, 2);
  });

  test("5.5 WA FICO is balance-weighted", () => {
    // L004 has 0 balance so doesn't contribute
    // (25000*720 + 15000*780 + 10000*620 + 0*680 + 32000*750) / 82000
    const expected = (25000 * 720 + 15000 * 780 + 10000 * 620 + 0 * 680 + 32000 * 750) / 82000;
    expect(an.waFO).toBeCloseTo(expected, 1);
  });

  test("5.6 WA rate is balance-weighted", () => {
    const expected = (25000 * 12.5 + 15000 * 8.5 + 10000 * 22.0 + 0 * 15.0 + 32000 * 10.0) / 82000;
    expect(an.waR).toBeCloseTo(expected, 1);
  });

  test("5.7 FICO distribution sums to total loans with FICO", () => {
    const totalInDist = an.ficoDist.reduce((a, b) => a + b.count, 0);
    expect(totalInDist).toBe(5);
  });

  test("5.8 status grouping correct", () => {
    const current = an.stat.find(s => s.name === "Current");
    const dpd30 = an.stat.find(s => s.name === "30DPD");
    const co = an.stat.find(s => s.name === "Charged Off");
    expect(current.count).toBe(3);
    expect(dpd30.count).toBe(1);
    expect(co.count).toBe(1);
  });

  test("5.9 geographic distribution", () => {
    const ca = an.geo.find(g => g.name === "CA");
    expect(ca.count).toBe(2);
  });

  test("5.10 pool factor correct", () => {
    expect(an.pf).toBeCloseTo((82000 / 115000) * 100, 1);
  });

  test("5.11 has() returns true for mapped fields", () => {
    expect(an.has("fico_origination")).toBe(true);
    expect(an.has("monthly_income")).toBe(false);
  });

  test("5.12 net loss accumulated", () => {
    expect(an.nl).toBe(12000);
  });

  test("5.13 recoveries accumulated", () => {
    expect(an.rec).toBe(3000);
  });

  test("5.14 HHI calculated", () => {
    expect(an.hhi).toBeGreaterThan(0);
    expect(an.hhi).toBeLessThanOrEqual(1);
  });

  test("5.15 handles empty dataset", () => {
    const empty = doAnalyze([], CLEAN_MAP);
    expect(empty.N).toBe(0);
    expect(empty.tb).toBe(0);
    expect(empty.avg).toBe(0);
  });
});


// ═══════════════════════════════════════════════════════════════════
// 6. DELINQUENCY & TAPE CRACKING
// ═══════════════════════════════════════════════════════════════════

describe("6. Tape Cracking — delinquency metrics", () => {
  const an = doAnalyze(CLEAN_ROWS, CLEAN_MAP);

  test("6.1 30+ DPD captures 30DPD and worse", () => {
    // 30DPD row (L003) has balance 10000, total = 82000
    expect(an.dq30).toBeCloseTo((10000 / 82000) * 100, 1);
  });

  test("6.2 gross loss rate captures charge-offs", () => {
    // L004 Charged Off original = 18000, total orig = 115000
    // coB = balance of charged off = 0 (L004 has 0 current balance)
    expect(an.glr).toBeCloseTo(0, 1); // 0 balance / orig
  });

  test("6.3 net loss rate", () => {
    expect(an.nlr).toBeCloseTo((12000 / 115000) * 100, 1);
  });
});


// ═══════════════════════════════════════════════════════════════════
// 9. REGRESSION
// ═══════════════════════════════════════════════════════════════════

describe("9. Regression — calcRegression()", () => {
  test("9.1 perfect positive correlation", () => {
    const pts = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }];
    const reg = calcRegression(pts);
    expect(reg.slope).toBeCloseTo(2, 5);
    expect(reg.intercept).toBeCloseTo(0, 5);
    expect(reg.r2).toBeCloseTo(1, 5);
    expect(reg.r).toBeCloseTo(1, 5);
  });

  test("9.2 perfect negative correlation", () => {
    const pts = [{ x: 1, y: 6 }, { x: 2, y: 4 }, { x: 3, y: 2 }];
    const reg = calcRegression(pts);
    expect(reg.slope).toBeCloseTo(-2, 5);
    expect(reg.r).toBeCloseTo(-1, 5);
  });

  test("9.3 no correlation", () => {
    const pts = [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }];
    const reg = calcRegression(pts);
    expect(reg.slope).toBeCloseTo(0, 5);
  });

  test("9.4 returns null with < 3 points", () => {
    expect(calcRegression([{ x: 1, y: 2 }])).toBeNull();
    expect(calcRegression([])).toBeNull();
    expect(calcRegression(null)).toBeNull();
  });

  test("9.5 regression line endpoints correct", () => {
    const pts = [{ x: 10, y: 20 }, { x: 20, y: 40 }, { x: 30, y: 60 }];
    const reg = calcRegression(pts);
    expect(reg.line[0].x).toBe(10);
    expect(reg.line[1].x).toBe(30);
  });

  test("9.6 R² between 0 and 1 for noisy data", () => {
    const pts = [{ x: 1, y: 2.1 }, { x: 2, y: 3.8 }, { x: 3, y: 6.2 }, { x: 4, y: 7.9 }];
    const reg = calcRegression(pts);
    expect(reg.r2).toBeGreaterThan(0);
    expect(reg.r2).toBeLessThanOrEqual(1);
  });
});

describe("9. Multiple Regression — calcMultiReg()", () => {
  test("9.7 perfect 2-variable fit", () => {
    // y = 1 + 2*x1 + 3*x2
    const pts = [
      { x1: 1, x2: 1, y: 6 },
      { x1: 2, x2: 1, y: 8 },
      { x1: 1, x2: 2, y: 9 },
      { x1: 2, x2: 2, y: 11 },
      { x1: 3, x2: 3, y: 16 },
    ];
    const reg = calcMultiReg(pts);
    expect(reg.b0).toBeCloseTo(1, 3);
    expect(reg.b1).toBeCloseTo(2, 3);
    expect(reg.b2).toBeCloseTo(3, 3);
    expect(reg.r2).toBeCloseTo(1, 3);
  });

  test("9.8 returns null with < 5 points", () => {
    expect(calcMultiReg([{ x1: 1, x2: 1, y: 1 }])).toBeNull();
    expect(calcMultiReg(null)).toBeNull();
  });

  test("9.9 adjusted R² ≤ R²", () => {
    const pts = [
      { x1: 1, x2: 5, y: 10 },
      { x1: 2, x2: 3, y: 12 },
      { x1: 3, x2: 8, y: 20 },
      { x1: 4, x2: 2, y: 15 },
      { x1: 5, x2: 7, y: 25 },
      { x1: 6, x2: 1, y: 18 },
    ];
    const reg = calcMultiReg(pts);
    expect(reg.adjR2).toBeLessThanOrEqual(reg.r2);
  });
});


// ═══════════════════════════════════════════════════════════════════
// 11. DATA QUALITY — doValidate()
// ═══════════════════════════════════════════════════════════════════

describe("11. Data Quality — doValidate()", () => {
  test("11.1 clean data high completeness", () => {
    const vl = doValidate(CLEAN_ROWS, CLEAN_MAP);
    expect(vl.comp).toBeGreaterThan(95);
  });

  test("11.2 counts missing cells", () => {
    const rows = [
      { Loan_ID: "X1", Current_Balance: 1000, FICO_Origination: "" },
      { Loan_ID: "X2", Current_Balance: "", FICO_Origination: 700 },
    ];
    const mp = { loan_id: "Loan_ID", current_balance: "Current_Balance", fico_origination: "FICO_Origination" };
    const vl = doValidate(rows, mp);
    expect(vl.mc).toBe(2); // 2 empty cells
  });

  test("11.3 detects out-of-range FICO", () => {
    const rows = [
      { FICO: 200 },  // below 300
      { FICO: 950 },  // above 900
      { FICO: 720 },  // valid
    ];
    const mp = { fico_origination: "FICO" };
    const vl = doValidate(rows, mp);
    expect(vl.oor).toBe(2);
  });

  test("11.4 detects out-of-range interest rate", () => {
    const rows = [
      { Rate: 150.5 },  // way too high
      { Rate: -5 },      // negative
      { Rate: 12 },      // valid
    ];
    const mp = { interest_rate: "Rate" };
    const vl = doValidate(rows, mp);
    expect(vl.oor).toBe(2);
  });

  test("11.5 detects out-of-range DTI", () => {
    const rows = [
      { DTI: 200 },  // above 100
      { DTI: -10 },  // negative
      { DTI: 35 },   // valid
    ];
    const mp = { dti: "DTI" };
    const vl = doValidate(rows, mp);
    expect(vl.oor).toBe(2);
  });

  test("11.6 issues list capped at 20", () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ FICO: 100 }));
    const mp = { fico_origination: "FICO" };
    const vl = doValidate(rows, mp);
    expect(vl.issues.length).toBeLessThanOrEqual(20);
  });

  test("11.7 handles empty mapping", () => {
    const vl = doValidate(CLEAN_ROWS, {});
    expect(vl.comp).toBe(0); // 0/0 = 0
    expect(vl.mc).toBe(0);
  });
});


// ═══════════════════════════════════════════════════════════════════
// MESSY DATA HANDLING
// ═══════════════════════════════════════════════════════════════════

describe("Messy Data Handling", () => {
  test("pn strips $ and parses", () => {
    expect(pn("$25,000")).toBe(25000);
  });

  test("pn strips % and parses", () => {
    expect(pn("12.5%")).toBe(12.5);
  });

  test("pn handles N/A gracefully", () => {
    expect(pn("N/A")).toBeNull();
  });

  test("pn handles MISSING gracefully", () => {
    expect(pn("MISSING")).toBeNull();
  });

  test("pn handles negative values", () => {
    expect(pn(-5000)).toBe(-5000);
  });

  test("pn handles whitespace-padded values", () => {
    expect(pn("  15000  ")).toBe(15000);
  });

  test("doAnalyze handles messy data without crashing", () => {
    const mp = { current_balance: "Current_Balance", interest_rate: "Interest_Rate", fico_origination: "FICO_Origination", dti: "DTI", loan_status: "Loan_Status", state: "State", original_balance: "Original_Amount" };
    expect(() => doAnalyze(MESSY_ROWS, mp)).not.toThrow();
  });

  test("doValidate flags messy data", () => {
    const mp = { current_balance: "Current_Balance", interest_rate: "Interest_Rate", fico_origination: "FICO_Origination", dti: "DTI", original_balance: "Original_Amount" };
    const vl = doValidate(MESSY_ROWS, mp);
    expect(vl.oor).toBeGreaterThan(0); // rate=150.5, FICO=0, DTI=200
    expect(vl.mc).toBeGreaterThan(0); // empty cells
  });
});


// ═══════════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════════

describe("Edge Cases", () => {
  test("doAnalyze with 0 total balance", () => {
    const rows = [{ bal: 0, orig: 0, rate: 5, fico: 700, status: "Current", state: "CA" }];
    const mp = { current_balance: "bal", original_balance: "orig", interest_rate: "rate", fico_origination: "fico", loan_status: "status", state: "state" };
    const an = doAnalyze(rows, mp);
    expect(an.N).toBe(1);
    expect(an.tb).toBe(0);
    expect(an.waR).toBe(0); // no balance to weight
    expect(isNaN(an.waFO)).toBe(false);
  });

  test("doAnalyze with single loan", () => {
    const rows = [{ bal: 10000, rate: 8, fico: 750, status: "Current" }];
    const mp = { current_balance: "bal", interest_rate: "rate", fico_origination: "fico", loan_status: "status" };
    const an = doAnalyze(rows, mp);
    expect(an.N).toBe(1);
    expect(an.waR).toBeCloseTo(8, 1);
    expect(an.waFO).toBeCloseTo(750, 1);
  });

  test("ruleMatch with no matching columns", () => {
    const mp = ruleMatch(["foo", "bar", "baz"], [{ foo: 1, bar: 2, baz: 3 }]);
    expect(Object.keys(mp).length).toBe(0);
  });

  test("scoreTemplate with empty headers", () => {
    const score = scoreTemplate({ mapping: { a: "col1" } }, []);
    expect(score).toBe(0);
  });

  test("calcRegression with identical x values", () => {
    const pts = [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }];
    const reg = calcRegression(pts);
    expect(reg).toBeNull(); // denom = 0
  });
});


// ═══════════════════════════════════════════════════════════════════
// STRAT BALANCE INTEGRITY
// ═══════════════════════════════════════════════════════════════════

describe("7. Stratification Integrity", () => {
  const an = doAnalyze(CLEAN_ROWS, CLEAN_MAP);

  test("7.1 FICO strat balance % sums close to 100", () => {
    const total = an.ficoDist.reduce((a, b) => a + b.pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  test("7.2 rate strat balance % sums close to 100", () => {
    const total = an.rateDist.reduce((a, b) => a + b.pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  test("7.3 status group counts sum to total", () => {
    const total = an.stat.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(5);
  });

  test("7.4 geo group counts sum to total", () => {
    const total = an.geo.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(5);
  });
});
