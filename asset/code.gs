/**
 * ============================================================================
 * WORKSPACE, MEET GEMMA: PROJECT & EVENT ARCHITECT
 * Model: Google Gemma 4 E2B (High-Speed CPU Optimized Edition)
 * ============================================================================
 */

const DEFAULT_MODEL = "gemma4:e2b";

/**
 * Creates the custom UI menu on spreadsheet open.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Gemma 4 PM Engine (E2B)")
    .addItem("🚀 Open PM Copilot Sidebar", "showSidebar")
    .addSeparator()
    .addItem("0. Setup / Reset '0_Brief' Tab", "setupBriefTab")
    .addItem("Step 1: Generate Charter & OKRs", "runStep1CharterAndOKRs")
    .addItem("Step 2: Generate CBA & Deliverables", "runStep2CBAAndDeliverables")
    .addItem("Step 3: Build RACI Matrix", "runStep3RACIMatrix")
    .addItem("Step 4: Run Risk & Fishbone RCA", "runStep4RiskAndFishbone")
    .addItem("Step 5: Paint 12-Week Gantt Chart", "runStep5GanttChart")
    .addToUi();
}

/**
 * Displays the persistent Right-Hand Sidebar UI.
 */
function showSidebar() {
  const savedUrl = PropertiesService.getDocumentProperties().getProperty("CLOUD_RUN_URL") || "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Google Sans', Roboto, Arial, sans-serif; margin: 0; padding: 14px; background: #f8f9fa; color: #202124; }
    h3 { margin: 0 0 2px 0; font-size: 16px; color: #1a73e8; }
    p.sub { margin: 0 0 12px 0; font-size: 11px; color: #5f6368; font-weight: 500; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; background: #e8f0fe; color: #1a73e8; border-radius: 4px; margin-bottom: 8px; }
    .card { background: #fff; border: 1px solid #dadce0; border-radius: 8px; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    label { font-size: 11px; font-weight: 700; color: #3c4043; display: block; margin-bottom: 4px; text-transform: uppercase; }
    input[type="text"] { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #dadce0; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
    button { width: 100%; padding: 10px 12px; margin-bottom: 8px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between; transition: 0.15s; }
    button.primary { background: #1a73e8; color: white; }
    button.primary:hover { background: #1557b0; }
    button.step { background: #ffffff; color: #202124; border: 1px solid #dadce0; }
    button.step:hover { background: #e8f0fe; border-color: #1a73e8; }
    button.done { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    #statusBox { font-size: 12px; padding: 8px; border-radius: 6px; background: #e8f0fe; color: #1967d2; margin-top: 4px; line-height: 1.4; word-break: break-word; }
    .tip { font-size: 11px; color: #5f6368; line-height: 1.4; margin-top: 8px; }
  </style>
</head>
<body>
  <h3>⚡ Gemma 4 Copilot</h3>
  <span class="badge">Model: gemma4:e2b</span>
  <p class="sub">Workspace, meet Gemma • Fast Engine</p>

  <div class="card">
    <label>1. Cloud Run Endpoint</label>
    <input type="text" id="urlInput" placeholder="https://gemma4-e2b-service-...run.app" value="${savedUrl}" />
    <button class="primary" id="btn0" onclick="initAndPing()">
      <span>🔌 0. Setup Brief & Ping</span>
      <span id="icon0">▶</span>
    </button>
    <div id="statusBox">Paste your E2B Cloud Run URL and click Setup to start.</div>
  </div>

  <div class="card">
    <label>2. Generate Project Tabs</label>
    <button class="step" id="btn1" onclick="runStep(1, 'runStep1CharterAndOKRs', 'Drafting Charter & OKRs (~6s)...')">
      <span>1️⃣ Charter & OKRs</span><span id="icon1">🔵</span>
    </button>
    <button class="step" id="btn2" onclick="runStep(2, 'runStep2CBAAndDeliverables', 'Calculating CBA & Deliverables (~6s)...')">
      <span>2️⃣ CBA & Deliverables</span><span id="icon2">🟡</span>
    </button>
    <button class="step" id="btn3" onclick="runStep(3, 'runStep3RACIMatrix', 'Mapping RACI Governance (~5s)...')">
      <span>3️⃣ RACI Matrix</span><span id="icon3">🟣</span>
    </button>
    <button class="step" id="btn4" onclick="runStep(4, 'runStep4RiskAndFishbone', 'Running Risk & Fishbone (~8s)...')">
      <span>4️⃣ Risk & Fishbone Diagram</span><span id="icon4">🔴</span>
    </button>
    <button class="step" id="btn5" onclick="runStep(5, 'runStep5GanttChart', 'Painting 12-Week Gantt (~7s)...')">
      <span>5️⃣ 12-Week Gantt Chart</span><span id="icon5">🩵</span>
    </button>
    <div class="tip">💡 <b>Human-in-the-loop:</b> You can edit cells in any sheet before running the next step.</div>
  </div>

  <script>
    function setStatus(msg, bg, color) {
      const box = document.getElementById('statusBox');
      box.innerText = msg;
      box.style.background = bg || '#e8f0fe';
      box.style.color = color || '#1967d2';
    }

    function setAllDisabled(disabled) {
      for (let i = 0; i <= 5; i++) {
        const btn = document.getElementById('btn' + i);
        if (btn) btn.disabled = disabled;
      }
    }

    function initAndPing() {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) {
        setStatus('❌ Please paste your Cloud Run URL first!', '#fce8e6', '#c5221f');
        return;
      }
      setAllDisabled(true);
      document.getElementById('icon0').innerText = '⏳';
      setStatus('⏳ Connecting to E2B instance...', '#fef7e0', '#b06000');

      google.script.run
        .withSuccessHandler(function(msg) {
          setAllDisabled(false);
          document.getElementById('icon0').innerText = '✅';
          setStatus('✅ ' + msg, '#e6f4ea', '#137333');
        })
        .withFailureHandler(function(err) {
          setAllDisabled(false);
          document.getElementById('icon0').innerText = '⚠️';
          setStatus('❌ ' + err.message, '#fce8e6', '#c5221f');
        })
        .saveUrlAndInitialize(url);
    }

    function runStep(stepNum, fnName, loadingMsg) {
      setAllDisabled(true);
      const btn = document.getElementById('btn' + stepNum);
      const icon = document.getElementById('icon' + stepNum);
      icon.innerText = '⏳';
      setStatus('⏳ Gemma 4 E2B: ' + loadingMsg, '#fef7e0', '#b06000');

      google.script.run
        .withSuccessHandler(function() {
          setAllDisabled(false);
          btn.className = 'step done';
          icon.innerText = '✅';
          setStatus('✅ Step ' + stepNum + ' complete! Tab updated.', '#e6f4ea', '#137333');
        })
        .withFailureHandler(function(err) {
          setAllDisabled(false);
          icon.innerText = '❌';
          setStatus('❌ Error: ' + err.message, '#fce8e6', '#c5221f');
        })[fnName]();
    }
  </script>
</body>
</html>
  `;

  const html = HtmlService.createHtmlOutput(htmlContent)
    .setTitle("⚡ Gemma 4 PM Copilot (E2B)")
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Saves URL, sets up 0_Brief tab, and executes a sub-second health check.
 */
function saveUrlAndInitialize(rawUrl) {
  const cleanUrl = rawUrl.replace(/\/+$/, "");
  PropertiesService.getDocumentProperties().setProperty("CLOUD_RUN_URL", cleanUrl);
  setupBriefTab();

  const res = callGemmaE2B(
    "Return JSON: {\"status\": \"Online\"}",
    "Ping"
  );
  return `Service Online (${res.status || "OK"}). Ready!`;
}

/**
 * ============================================================================
 * CORE ENGINE: High-Speed E2B Caller
 * - Uses /api/generate for direct completion without chat/reasoning wrapper
 * - num_thread: 4 for optimal CPU memory bus utilization
 * - Clean regex extraction and defensive JSON parsing
 * ============================================================================
 */
function callGemmaE2B(systemInstruction, userPrompt) {
  const cloudRunUrl = PropertiesService.getDocumentProperties().getProperty("CLOUD_RUN_URL");
  if (!cloudRunUrl) {
    throw new Error("Cloud Run URL missing! Open sidebar and paste your URL first.");
  }

  const endpoint = `${cloudRunUrl}/api/generate`;
  const payload = {
    model: DEFAULT_MODEL,
    system: systemInstruction + " Return valid JSON only. Never output thinking or conversational text.",
    prompt: userPrompt + "\nOutput raw JSON object now:",
    format: "json",
    stream: false,
    options: { 
      temperature: 0.1, 
      num_ctx: 2048,
      num_predict: 1500,  // Prevents truncated JSON
      num_thread: 4       // 4 threads avoids hyperthread memory bus contention
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const statusCode = response.getResponseCode();
  const rawText = response.getContentText();

  if (statusCode !== 200) {
    throw new Error(`Cloud Run HTTP ${statusCode}: ${rawText}`);
  }

  const result = JSON.parse(rawText);
  let rawContent = (result.response || "").trim();

  // Strip code fences if present
  rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  // Extract the outermost JSON structure
  const jsonMatch = rawContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    rawContent = jsonMatch[0];
  }

  if (!rawContent) {
    throw new Error("Empty response received. Model did not produce JSON.");
  }

  try {
    return JSON.parse(rawContent);
  } catch (err) {
    Logger.log("Failed parsing rawContent: " + rawContent);
    throw new Error("Malformed JSON: " + err.message);
  }
}

/**
 * Helper: Safely converts any value into an iterable Array.
 */
function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
}

/**
 * Helper: Formats table header banners.
 */
function styleHeader(range, bgColor) {
  range
    .setBackground(bgColor || "#1a73e8")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setWrap(true);
}

/**
 * Helper: Creates or resets a tab and sets tab color.
 */
function getOrCreateCleanSheet(sheetName, tabColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
    sheet.clearConditionalFormatRules();
  } else {
    sheet = ss.insertSheet(sheetName);
  }
  if (tabColor) sheet.setTabColor(tabColor);
  sheet.setHiddenGridlines(false);
  return sheet;
}

/**
 * Helper: Reads parameters from 0_Brief tab.
 */
function getBriefData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("0_Brief");
  if (!sheet) throw new Error("Tab '0_Brief' not found! Click '0. Setup Brief' first.");
  const values = sheet.getRange("A2:B8").getValues();
  const brief = {};
  values.forEach(row => {
    if (row[0]) brief[String(row[0]).trim()] = String(row[1]).trim();
  });
  return brief;
}

/**
 * Helper: Reads deliverables from 2_CBA_Scope tightly (avoids blank cell overhead).
 */
function getDeliverablesFromStep2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cbaSheet = ss.getSheetByName("2_CBA_Scope");
  if (!cbaSheet) throw new Error("Please run Step 2 first!");
  
  const values = cbaSheet.getRange("A6:B15").getValues();
  const deliverables = [];
  
  for (let i = 0; i < values.length; i++) {
    const id = String(values[i][0]).trim();
    const name = String(values[i][1]).trim();
    if (id.startsWith("WBS") && name) {
      deliverables.push(`${id}: ${name}`);
    }
  }
  
  return deliverables.length > 0 ? deliverables : [
    "WBS_01: Venue & Tech Contract",
    "WBS_02: Sponsorship Funding",
    "WBS_03: Speaker Tracks Confirmed",
    "WBS_04: Attendee Registrations Full"
  ];
}

/**
 * ============================================================================
 * STAGE 0: INITIALIZE '0_Brief'
 * ============================================================================
 */
function setupBriefTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("0_Brief");
  if (sheet) {
    ss.setActiveSheet(sheet);
    return;
  }
  sheet = getOrCreateCleanSheet("0_Brief", "#34a853");

  const headers = [["PARAMETER", "YOUR PROJECT / EVENT INPUT (EDIT COLUMN B)"]];
  const starterData = [
    ["Project / Event Name", "Jakarta Tech & AI Community Summit 2026"],
    ["Core Objective", "Host a 1-day hands-on developer conference for 350 attendees with 3 workshop tracks and 90% satisfaction."],
    ["Total Budget Cap", "IDR 150,000,000 (approx. USD $9,500)"],
    ["Target Timeline (Weeks)", "12 Weeks"],
    ["Team Roles (Comma-separated)", "Event Director, Sponsorship Lead, Technical Track Lead, Logistics Lead, Marketing Lead"],
    ["Key Constraints & Context", "Venue needs 1Gbps Wi-Fi for 350 laptops; strict halal catering; sponsorships must cover 60% of cost."],
    ["Output Language", "English"]
  ];

  sheet.getRange("A1:B1").setValues(headers);
  styleHeader(sheet.getRange("A1:B1"), "#0f9d58");

  sheet.getRange(2, 1, starterData.length, 2).setValues(starterData);
  sheet.getRange("A2:A8").setFontWeight("bold").setBackground("#f1f8e9");
  sheet.getRange("B2:B8").setBackground("#ffffff").setWrap(true);
  sheet.getRange("A1:B8").setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);

  const langRule = SpreadsheetApp.newDataValidation().requireValueInList(["English", "Bahasa Indonesia"], true).build();
  sheet.getRange("B8").setDataValidation(langRule);

  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 620);
  sheet.setRowHeights(2, 7, 36);

  ss.setActiveSheet(sheet);
}

/**
 * ============================================================================
 * STAGE 1: CREATE '1_Charter_OKRs'
 * ============================================================================
 */
function runStep1CharterAndOKRs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const brief = getBriefData();
  const lang = brief["Output Language"] || "English";

  const prompt = `Write in ${lang}. Create a concise Project Charter & 3 OKRs for:\n${JSON.stringify(brief)}\n\n` +
    `Respond in EXACTLY this JSON structure:\n` +
    `{\n` +
    `  "executive_summary": "1 sentence overview",\n` +
    `  "business_case": "1 sentence value driver",\n` +
    `  "in_scope": ["Boundary 1", "Boundary 2"],\n` +
    `  "out_of_scope": ["Exclusion 1", "Exclusion 2"],\n` +
    `  "okrs": [\n` +
    `    {"objective_id": "OBJ-01", "objective": "Goal", "key_result_1": "Metric 1", "key_result_2": "Metric 2", "key_result_3": "Metric 3", "target_metric": "100%"},\n` +
    `    {"objective_id": "OBJ-02", "objective": "Goal", "key_result_1": "Metric 1", "key_result_2": "Metric 2", "key_result_3": "Metric 3", "target_metric": "90%"},\n` +
    `    {"objective_id": "OBJ-03", "objective": "Goal", "key_result_1": "Metric 1", "key_result_2": "Metric 2", "key_result_3": "Metric 3", "target_metric": "< Budget"}\n` +
    `  ]\n` +
    `}`;

  let data = callGemmaE2B("You are a Principal PM Consultant.", prompt);
  if (data && !data.okrs && typeof data === "object") {
    const k = Object.keys(data).find(x => data[x] && data[x].okrs);
    if (k) data = data[k];
  }

  const sheet = getOrCreateCleanSheet("1_Charter_OKRs", "#1a73e8");
  sheet.getRange("A1:F1").merge().setValue(`PROJECT CHARTER: ${brief["Project / Event Name"]}`);
  styleHeader(sheet.getRange("A1:F1"), "#1a73e8");

  const inScopeList = ensureArray(data.in_scope || data.inScope);
  const outScopeList = ensureArray(data.out_of_scope || data.outOfScope);
  const okrsList = ensureArray(data.okrs || data.OKRs);

  const charterRows = [
    ["Executive Summary", data.executive_summary || "Event Execution Plan"],
    ["Business Case / Value", data.business_case || "Drive community and developer engagement"],
    ["In-Scope Boundaries", inScopeList.map(i => "• " + i).join("\n") || "• Event Planning & Logistics"],
    ["Out-of-Scope (Exclusions)", outScopeList.map(i => "• " + i).join("\n") || "• Unrelated organizational expenses"]
  ];

  let currentRow = 2;
  charterRows.forEach(item => {
    sheet.getRange(currentRow, 1).setValue(item[0]).setFontWeight("bold").setBackground("#e8f0fe").setVerticalAlignment("top");
    sheet.getRange(currentRow, 2, 1, 5).merge().setValue(item[1]).setWrap(true).setVerticalAlignment("top");
    currentRow++;
  });
  sheet.getRange(2, 1, charterRows.length, 6).setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);

  currentRow += 1;
  const okrHeaders = [["OBJ ID", "OBJECTIVE", "KEY RESULT 1", "KEY RESULT 2", "KEY RESULT 3", "PRIMARY SUCCESS METRIC"]];
  sheet.getRange(currentRow, 1, 1, 6).setValues(okrHeaders);
  styleHeader(sheet.getRange(currentRow, 1, 1, 6), "#174ea6");
  currentRow++;

  const okrStartRow = currentRow;
  if (okrsList.length > 0) {
    okrsList.forEach((okr, idx) => {
      sheet.getRange(currentRow, 1, 1, 6).setValues([[
        okr.objective_id || `OBJ-0${idx + 1}`,
        okr.objective || "Deliver Project Milestones",
        okr.key_result_1 || "Complete all tasks on time",
        okr.key_result_2 || "Achieve target attendee satisfaction",
        okr.key_result_3 || "Remain within budget cap",
        okr.target_metric || "100%"
      ]]);
      currentRow++;
    });

    sheet.getRange(okrStartRow, 1, okrsList.length, 6)
      .setWrap(true)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.setColumnWidth(1, 150);
  for (let c = 2; c <= 6; c++) sheet.setColumnWidth(c, 220);

  ss.setActiveSheet(sheet);
}

/**
 * ============================================================================
 * STAGE 2: CREATE '2_CBA_Scope'
 * ============================================================================
 */
function runStep2CBAAndDeliverables() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const brief = getBriefData();
  const lang = brief["Output Language"] || "English";
  const charterSheet = ss.getSheetByName("1_Charter_OKRs");
  if (!charterSheet) throw new Error("Please run Step 1 first!");

  const prompt = `Write in ${lang}. Project: ${JSON.stringify(brief)}\n` +
    `Generate exactly 3 budget items and 4 key deliverables in concise JSON:\n` +
    `{\n` +
    `  "cba_summary_verdict": "High positive ROI",\n` +
    `  "budget_breakdown": [\n` +
    `    {"category": "Venue & Wi-Fi", "item_description": "Hall & Tech", "cost_type": "Direct", "estimated_cost": "IDR 55M", "expected_benefit": "Capacity"},\n` +
    `    {"category": "Catering", "item_description": "Halal Meals", "cost_type": "Direct", "estimated_cost": "IDR 45M", "expected_benefit": "Satisfaction"},\n` +
    `    {"category": "Marketing", "item_description": "Ads & Outreach", "cost_type": "Direct", "estimated_cost": "IDR 10M", "expected_benefit": "Attendees"}\n` +
    `  ],\n` +
    `  "deliverables": [\n` +
    `    {"wbs_id": "WBS_01", "deliverable_name": "Venue & Wi-Fi Contract", "linked_okr": "OBJ-01", "acceptance_criteria": "Signed", "due_week": "Week 2"},\n` +
    `    {"wbs_id": "WBS_02", "deliverable_name": "Speaker Lineup Confirmed", "linked_okr": "OBJ-01", "acceptance_criteria": "Confirmed", "due_week": "Week 4"},\n` +
    `    {"wbs_id": "WBS_03", "deliverable_name": "60% Sponsorship Secured", "linked_okr": "OBJ-03", "acceptance_criteria": "Invoiced", "due_week": "Week 6"},\n` +
    `    {"wbs_id": "WBS_04", "deliverable_name": "Ticket Registrations Full", "linked_okr": "OBJ-02", "acceptance_criteria": "350 Sold", "due_week": "Week 8"}\n` +
    `  ]\n` +
    `}`;

  const data = callGemmaE2B("You are a Senior Project Controller.", prompt);
  const sheet = getOrCreateCleanSheet("2_CBA_Scope", "#fbbc04");

  sheet.getRange("A1:E1").merge().setValue(`COST-BENEFIT ANALYSIS (CBA) — Verdict: ${data.cba_summary_verdict || "Positive ROI"}`);
  styleHeader(sheet.getRange("A1:E1"), "#e37400");

  const cbaHeaders = [["CATEGORY", "COST / INVESTMENT ITEM", "TYPE (DIRECT/INDIRECT)", "ESTIMATED COST", "QUANTIFIED BENEFIT / ROI IMPACT"]];
  sheet.getRange("A2:E2").setValues(cbaHeaders);
  styleHeader(sheet.getRange("A2:E2"), "#f29900");

  const budgetList = ensureArray(data.budget_breakdown);
  const delivList = ensureArray(data.deliverables);

  let rowIdx = 3;
  if (budgetList.length > 0) {
    budgetList.forEach(item => {
      sheet.getRange(rowIdx, 1, 1, 5).setValues([[
        item.category || "Ops", item.item_description || "Cost Item", item.cost_type || "Direct", item.estimated_cost || "TBD", item.expected_benefit || "Execution"
      ]]);
      rowIdx++;
    });
    sheet.getRange(3, 1, budgetList.length, 5).setWrap(true).setVerticalAlignment("top").setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
  }

  rowIdx += 2;
  sheet.getRange(rowIdx, 1, 1, 5).setValues([["WBS ID", "DELIVERABLE NAME", "LINKED OKR", "DEFINITION OF DONE", "TARGET WEEK"]]);
  styleHeader(sheet.getRange(rowIdx, 1, 1, 5), "#1a73e8");
  rowIdx++;

  const delivStartRow = rowIdx;
  if (delivList.length > 0) {
    delivList.forEach(d => {
      sheet.getRange(rowIdx, 1, 1, 5).setValues([[
        d.wbs_id || "WBS-01", d.deliverable_name || "Deliverable", d.linked_okr || "OBJ-01", d.acceptance_criteria || "Done", d.due_week || "Week 4"
      ]]);
      rowIdx++;
    });
    sheet.getRange(delivStartRow, 1, delivList.length, 5).setWrap(true).setVerticalAlignment("top").setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 300);
  sheet.setColumnWidth(5, 240);

  ss.setActiveSheet(sheet);
}

/**
 * ============================================================================
 * STAGE 3: CREATE '3_RACI'
 * ============================================================================
 */
function runStep3RACIMatrix() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const brief = getBriefData();
  const deliverables = getDeliverablesFromStep2();
  
  const roles = (brief["Team Roles (Comma-separated)"] || "Director, Sponsor, Tech, Logistics, Marketing")
    .split(",")
    .map(r => r.trim())
    .filter(Boolean)
    .slice(0, 5);

  const prompt = `Deliverables:
${deliverables.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Assign RACI letters (R, A, C, I) across roles: [${roles.join(", ")}].
Rule: Each item must have exactly one 'A' and at least one 'R'.

Output strictly JSON:
{
  "raci": [
    {"id": "WBS_01", "roles": ["A", "I", "C", "R", "I"], "note": "Venue lead"},
    {"id": "WBS_02", "roles": ["I", "A", "I", "I", "R"], "note": "Sponsor lead"},
    {"id": "WBS_03", "roles": ["C", "I", "A", "I", "R"], "note": "Content lead"},
    {"id": "WBS_04", "roles": ["I", "C", "I", "A", "R"], "note": "Marketing lead"}
  ]
}`;

  const data = callGemmaE2B("You are a PMO Lead. Return short JSON only.", prompt);
  const sheet = getOrCreateCleanSheet("3_RACI", "#9334e6");

  sheet.getRange("A1:G1").merge().setValue("RACI GOVERNANCE MATRIX (R = Responsible | A = Accountable | C = Consulted | I = Informed)");
  styleHeader(sheet.getRange("A1:G1"), "#7627bb");

  const headerRow = [["DELIVERABLE", ...roles, "HANDOFF OWNER"]];
  sheet.getRange("A2:G2").setValues(headerRow);
  styleHeader(sheet.getRange("A2:G2"), "#9334e6");

  const raciList = ensureArray(data.raci);
  const matrixRows = raciList.map((r, i) => {
    const assignedRoles = ensureArray(r.roles);
    return [
      deliverables[i] || r.id || `WBS_0${i + 1}`,
      assignedRoles[0] || "I",
      assignedRoles[1] || "A",
      assignedRoles[2] || "R",
      assignedRoles[3] || "C",
      assignedRoles[4] || "I",
      r.note || "Signoff"
    ];
  });

  if (matrixRows.length > 0) {
    sheet.getRange(3, 1, matrixRows.length, 7).setValues(matrixRows);
    sheet.getRange(3, 1, matrixRows.length, 7)
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);

    const badgeRange = sheet.getRange(3, 2, matrixRows.length, 5);
    badgeRange.setHorizontalAlignment("center").setFontWeight("bold");

    const rules = [
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("A").setBackground("#fce8e6").setFontColor("#c5221f").setRanges([badgeRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("R").setBackground("#e6f4ea").setFontColor("#137333").setRanges([badgeRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("C").setBackground("#fef7e0").setFontColor("#b06000").setRanges([badgeRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("I").setBackground("#e8f0fe").setFontColor("#1967d2").setRanges([badgeRange]).build()
    ];
    sheet.setConditionalFormatRules(rules);
  }

  sheet.setColumnWidth(1, 240);
  for (let c = 2; c <= 6; c++) sheet.setColumnWidth(c, 110);
  sheet.setColumnWidth(7, 200);

  ss.setActiveSheet(sheet);
}

/**
 * ============================================================================
 * STAGE 4: CREATE '4_Risk_Fishbone'
 * ============================================================================
 */
function runStep4RiskAndFishbone() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const brief = getBriefData();
  const lang = brief["Output Language"] || "English";

  // Micro-Call 1: Top 3 Risks only (~50 tokens)
  const riskPrompt = `Project: ${brief["Project / Event Name"] || "Community Event"}. Language: ${lang}.
Output Top 3 critical risks in JSON:
{
  "risks": [
    {"id": "RSK-01", "event": "Wi-Fi bandwidth collapse", "prob": "HIGH", "impact": "HIGH", "mitigation": "Dual ISP + 5G failover"},
    {"id": "RSK-02", "event": "Sponsor funding delay", "prob": "MED", "impact": "HIGH", "mitigation": "Upfront milestone billing"},
    {"id": "RSK-03", "event": "Speaker last-minute drop", "prob": "MED", "impact": "MED", "mitigation": "Backup track leads ready"}
  ]
}`;
  const riskData = callGemmaE2B("Return compact JSON only.", riskPrompt);

  // Micro-Call 2: Fishbone 6M Root Causes (~60 tokens)
  const fishbonePrompt = `Target Problem: Complete Event Day Technical Failure. Language: ${lang}.
Give 1 concise cause (under 4 words) per 6M category in JSON:
{
  "problem": "Event Day Tech Blackout",
  "people": "Understaffed IT crew",
  "process": "No dry-run load test",
  "tech": "Router overload at 350 pax",
  "venue": "Single power circuit limit",
  "budget": "Subpar network switch",
  "vendors": "ISP SLA response delay"
}`;
  const fbData = callGemmaE2B("Return compact JSON only.", fishbonePrompt);

  // Render to Sheet
  const sheet = getOrCreateCleanSheet("4_Risk_Fishbone", "#d93025");

  sheet.getRange("A1:E1").merge().setValue("PROJECT RISK REGISTER & MITIGATION PLAYBOOK");
  styleHeader(sheet.getRange("A1:E1"), "#c5221f");

  const riskHeaders = [["RISK ID", "RISK EVENT", "PROBABILITY", "IMPACT", "PREVENTIVE MITIGATION PLAN"]];
  sheet.getRange("A2:E2").setValues(riskHeaders);
  styleHeader(sheet.getRange("A2:E2"), "#d93025");

  const riskList = ensureArray(riskData.risks);
  const riskRows = riskList.map(r => [
    r.id || "RSK-01", 
    r.event || "Operational Risk", 
    r.prob || "MED", 
    r.impact || "HIGH", 
    r.mitigation || "Active monitoring"
  ]);

  if (riskRows.length > 0) {
    sheet.getRange(3, 1, riskRows.length, 5).setValues(riskRows);
    sheet.getRange(3, 1, riskRows.length, 5)
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
  }

  // Draw 6M Ishikawa Diagram
  const fbStart = 3 + Math.max(1, riskRows.length) + 2;
  const headProblem = fbData.problem || "Major Event Technical Failure";
  sheet.getRange(fbStart, 1, 1, 5).merge().setValue(`🐟 ISHIKAWA ROOT-CAUSE: "${headProblem}"`);
  styleHeader(sheet.getRange(fbStart, 1, 1, 5), "#3c4043");

  sheet.getRange(fbStart + 1, 1).setValue("🦴 PEOPLE").setBackground("#fce8e6").setFontWeight("bold");
  sheet.getRange(fbStart + 1, 2, 1, 2).merge().setValue("🦴 PROCESS").setBackground("#fce8e6").setFontWeight("bold");
  sheet.getRange(fbStart + 1, 4, 1, 2).merge().setValue("🦴 TECH").setBackground("#fce8e6").setFontWeight("bold");

  sheet.getRange(fbStart + 2, 1).setValue("↘ " + (fbData.people || "Staffing gap")).setWrap(true);
  sheet.getRange(fbStart + 2, 2, 1, 2).merge().setValue("↘ " + (fbData.process || "Lack of testing")).setWrap(true);
  sheet.getRange(fbStart + 2, 4, 1, 2).merge().setValue("↘ " + (fbData.tech || "Hardware fault")).setWrap(true);

  sheet.getRange(fbStart + 3, 1, 1, 4).merge()
    .setValue("═══════════════════ ROOT CAUSE SPINE ═══════════════════▶")
    .setBackground("#202124")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setFontWeight("bold");
  sheet.getRange(fbStart + 3, 5)
    .setValue(`🎯 HEAD:\n${headProblem}`)
    .setBackground("#c5221f")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setWrap(true);

  sheet.getRange(fbStart + 4, 1).setValue("↗ " + (fbData.venue || "Venue power outage")).setWrap(true);
  sheet.getRange(fbStart + 4, 2, 1, 2).merge().setValue("↗ " + (fbData.budget || "Budget cut")).setWrap(true);
  sheet.getRange(fbStart + 4, 4, 1, 2).merge().setValue("↗ " + (fbData.vendors || "Vendor SLA breach")).setWrap(true);

  sheet.getRange(fbStart + 5, 1).setValue("🦴 VENUE").setBackground("#fce8e6").setFontWeight("bold");
  sheet.getRange(fbStart + 5, 2, 1, 2).merge().setValue("🦴 BUDGET").setBackground("#fce8e6").setFontWeight("bold");
  sheet.getRange(fbStart + 5, 4, 1, 2).merge().setValue("🦴 VENDORS").setBackground("#fce8e6").setFontWeight("bold");

  sheet.getRange(fbStart + 1, 1, 5, 5).setBorder(true, true, true, true, true, true, "#3c4043", SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 260);

  ss.setActiveSheet(sheet);
}

/**
 * ============================================================================
 * STAGE 5: CREATE '5_Gantt_Chart'
 * ============================================================================
 */
function runStep5GanttChart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const brief = getBriefData();
  const lang = brief["Output Language"] || "English";
  const deliverables = getDeliverablesFromStep2();

  const prompt = `Write in ${lang}. Project: ${JSON.stringify(brief)}\n` +
    `Deliverables: ${deliverables.join(", ")}\n` +
    `Create 5 sequential tasks across W1 to W12 in JSON format:\n` +
    `{\n` +
    `  "tasks": [\n` +
    `    {"task_id": "T-01", "phase_name": "Setup", "task_name": "Venue & Date", "owner_role": "Director", "dependency": "None", "start_week": 1, "end_week": 2, "is_critical_path": true},\n` +
    `    {"task_id": "T-02", "phase_name": "Sponsorship", "task_name": "Fundraising", "owner_role": "Sponsors", "dependency": "T-01", "start_week": 3, "end_week": 6, "is_critical_path": true},\n` +
    `    {"task_id": "T-03", "phase_name": "Marketing", "task_name": "Ticket Sales", "owner_role": "Marketing", "dependency": "T-02", "start_week": 5, "end_week": 8, "is_critical_path": false},\n` +
    `    {"task_id": "T-04", "phase_name": "Tech", "task_name": "Wi-Fi & Labs", "owner_role": "Tech", "dependency": "T-01", "start_week": 8, "end_week": 11, "is_critical_path": true},\n` +
    `    {"task_id": "T-05", "phase_name": "Ops", "task_name": "Rehearsal & Setup", "owner_role": "Logistics", "dependency": "T-04", "start_week": 11, "end_week": 12, "is_critical_path": true}\n` +
    `  ]\n` +
    `}`;

  const data = callGemmaE2B("You are a Master Scheduler.", prompt);
  const sheet = getOrCreateCleanSheet("5_Gantt_Chart", "#00acc1");

  sheet.getRange("A1:R1").merge().setValue(`📅 VISUAL GANTT CHART — ${brief["Project / Event Name"]} (🔴 Red = Critical Path | 🔵 Blue = Standard)`);
  styleHeader(sheet.getRange("A1:R1"), "#006064");

  const headers = [["TASK ID", "PHASE", "TASK", "OWNER", "DEPENDS", "CRITICAL?", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"]];
  sheet.getRange("A2:R2").setValues(headers);
  styleHeader(sheet.getRange("A2:R2"), "#00838f");

  const taskList = ensureArray(data.tasks);
  const tableRows = [];
  const bgColors = [];
  const fontColors = [];

  taskList.forEach(t => {
    const startW = Math.max(1, Math.min(12, Number(t.start_week) || 1));
    const endW = Math.max(startW, Math.min(12, Number(t.end_week) || startW));
    const isCrit = Boolean(t.is_critical_path);

    const rowData = [
      t.task_id || "T-01", 
      t.phase_name || "Ops", 
      t.task_name || "Task", 
      t.owner_role || "Lead", 
      t.dependency || "None", 
      isCrit ? "CRITICAL" : "Standard"
    ];
    const rowBg = ["#ffffff", "#f8f9fa", "#ffffff", "#ffffff", "#ffffff", isCrit ? "#fce8e6" : "#e8f0fe"];
    const rowFont = ["#202124", "#5f6368", "#202124", "#202124", "#5f6368", isCrit ? "#c5221f" : "#1967d2"];

    for (let w = 1; w <= 12; w++) {
      if (w >= startW && w <= endW) {
        rowData.push(`W${w}`);
        rowBg.push(isCrit ? "#d93025" : "#1a73e8");
        rowFont.push("#ffffff");
      } else {
        rowData.push("");
        rowBg.push("#ffffff");
        rowFont.push("#202124");
      }
    }
    tableRows.push(rowData);
    bgColors.push(rowBg);
    fontColors.push(rowFont);
  });

  const numTasks = tableRows.length;
  if (numTasks > 0) {
    const targetRange = sheet.getRange(3, 1, numTasks, 18);
    targetRange.setValues(tableRows);
    targetRange.setBackgrounds(bgColors);
    targetRange.setFontColors(fontColors);
    targetRange.setVerticalAlignment("middle").setBorder(true, true, true, true, true, true, "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(3, 6, numTasks, 13).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.setRowHeights(3, numTasks, 32);
  }

  sheet.setColumnWidth(1, 85);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 85);
  sheet.setColumnWidth(6, 95);
  for (let c = 7; c <= 18; c++) sheet.setColumnWidth(c, 48);

  ss.setActiveSheet(sheet);
}
