# Workspace, meet Gemma ⚡
**Sovereign, Deterministic Project Planning Automation in Google Sheets powered by Gemma 4 & Cloud Run**

An end-to-end reference architecture and hands-on workshop showing how to run Google's open-weight **Gemma 4** models on serverless CPU infrastructure (Cloud Run + Ollama) to drive a stateful, 5-stage project management pipeline inside Google Sheets—with **zero GPU quota required**.

---

## 🎯 Why Gemma Instead of SaaS LLMs?

A fair question from any architect or attendee: *"We already have Gemini for Workspace—why self-host Gemma?"*

1. **Data Sovereignty & Zero-Egress:** Regulated industries (finance, healthcare, hospitality PMS, government) often cannot send operational data to multi-tenant SaaS endpoints. Gemma runs inside your own private VPC or air-gapped local machine.
2. **Predictable FinOps Economics:** Shifts billing from unbounded per-token/per-seat API costs to a capped, scale-to-zero compute footprint (`--min-instances 0` costs **$0.00** when idle).
3. **Deterministic State Machines:** Commercial chat interfaces optimize for conversational prose. Self-hosting via Ollama / `llama.cpp` gives you low-level control over native JSON mode (`format: "json"`), CPU thread pinning, context windows, and model version freezing.
4. **Offline & Cross-Suite Portability:** Because the backend exposes a standard local HTTP API, the exact same engine can be bridged via **Model Context Protocol (MCP)** to offline Microsoft Office (Excel/Word) or local Python automations without an internet connection.

---

## 🏗️ System Architecture

```text
┌───────────────────────────┐       HTTPS POST        ┌────────────────────────────────┐
│   Google Sheets UI        │ ──────────────────────► │   Google Cloud Run (Gen2)      │
│   (Apps Script Sidebar)   │      /api/generate      │   8 vCPUs • 16 GiB RAM (CPU)   │
│                           │ ◄────────────────────── │                                │
│  [0_Brief]                │   Strict JSON Payload   │   ┌──────────────────────────┐ │
│     └─► [1_Charter_OKRs]  │                         │   │ Ollama Inference Engine  │ │
│     └─► [2_CBA_Scope]     │                         │   │ Model: gemma4:e2b / e4b  │ │
│     └─► [3_RACI]          │                         │   │ num_thread: 4            │ │
│     └─► [4_Risk_Fishbone] │                         │   └──────────────────────────┘ │
│     └─► [5_Gantt_Chart]   │                         └────────────────────────────────┘
└───────────────────────────┘
```

### Engineering & FinOps Lessons Baked Into This Repo
* **Zero-Idle FinOps Defaults (`--min-instances 0 --cpu-throttling`):** Always use request-based billing with scale-to-zero. Leaving an 8-vCPU / 16GiB container warm with `--min-instances 1 --no-cpu-throttling` bills 24/7 (~$0.80–$1.00/hour even while you sleep), whereas scale-to-zero costs pennies per full 5-stage spreadsheet run.
* **Lightweight JSON Mode:** Uses `/api/generate` with `format: "json"` rather than heavy nested grammar constraints, cutting CPU evaluation overhead.
* **Memory-Bandwidth Thread Pinning:** Sets `num_thread: 4` on an 8-vCPU container to prevent L3 cache and memory bus thrashing.
* **Decoupled Micro-Chains:** Breaks complex tabs (like Risk + 6M Fishbone) into sub-100-token micro-calls so requests never hit Apps Script execution limits or upstream gateway timeouts.
* **Human-in-the-Loop State:** Each generated tab acts as the database for the next step—users can manually edit cells in `1_Charter_OKRs` or `2_CBA_Scope` before generating downstream tabs.

---

## 📊 Model Comparison: E2B vs. E4B on CPU

| Metric | `gemma4:e2b` (Default Workshop Tier) | `gemma4:e4b` (High-Reasoning Challenge Tier) |
| :--- | :--- | :--- |
| **Model Footprint** | ~1.5 GB – 2.0 GB RAM | ~3.5 GB – 4.5 GB RAM |
| **Cloud Run Spec** | 8 vCPUs, 16 GiB RAM (Scale-to-Zero) | 8 vCPUs, 16 GiB RAM (Scale-to-Zero) |
| **CPU Latency / Step** | **~15 – 25 seconds** | ~60 – 180 seconds |
| **Best Use Case** | Live demos, rapid iteration, structured matrices (RACI, Gantt, WBS) | Deep financial reasoning, complex multi-constraint risk analysis |

---

## 📂 Repository Contents

* `codelabs.md` — Step-by-step hands-on workshop guide to deploy `gemma4:e2b` safely with zero idle cost and wire up Google Apps Script.
* `challenge.md` — Capstone challenge guide for deploying `gemma4:e4b` (or other open models), hot-swapping endpoints, and tuning CPU inference parameters.
* `Code.gs` — Complete Google Apps Script control deck, sidebar HTML UI, defensive JSON parser, and spreadsheet formatting engine.
* `Dockerfile` — Container definition pre-baking Ollama and the Gemma 4 weights for fast container startup.