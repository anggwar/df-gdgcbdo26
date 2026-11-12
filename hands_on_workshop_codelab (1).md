# Codelab: Workspace, meet Gemma ⚡
**Turn a Blank Google Sheet into an AI Project Architect with Gemma 4 E2B (Zero GPU Quota Required!)**

* **Duration:** 45–60 minutes
* **Vibe Check:** Practical, serverless, and wallet-friendly.
* **What You Need:** A Google Cloud Platform (GCP) project with billing enabled, Cloud Shell, and a Google Workspace / Gmail account.

> **Why no GPU?** Getting public cloud GPU quotas approved right before a workshop is an extreme sport nobody asked for. Instead, we are running **Gemma 4 E2B (`gemma4:e2b`)** on pure serverless CPU (8 vCPUs + 16 GiB RAM)—giving you fast, deterministic JSON responses without waiting in a GPU quota queue.

---

## Step 1: Spin Up Gemma 4 E2B on Cloud Run

Pop open **Google Cloud Shell** in your GCP Console (click the `>_` terminal icon in the top-right bar).

### 1.1 Create a Clean Build Folder
Cloud Run packages everything in your active directory when deploying from source. Let's create a dedicated folder and a `.gcloudignore` file so `gcloud` doesn't trip over hidden shell files or broken symlinks.

```bash
mkdir -p ~/gemma4-e2b && cd ~/gemma4-e2b

cat << 'EOF' > .gcloudignore
.gcloudignore
.git
.gitignore
.gemini
.*
EOF
```

### 1.2 Write the Ollama + Gemma 4 E2B Dockerfile
We pre-pull `gemma4:e2b` during `docker build` so the model weights are baked right into the container image. No downloading 2GB over the network when your spreadsheet makes its first call!

```bash
cat << 'EOF' > Dockerfile
FROM ollama/ollama:latest
ENV OLLAMA_HOST=0.0.0.0:8080
ENV OLLAMA_KEEP_ALIVE=-1
ENV OLLAMA_NUM_PARALLEL=2
RUN ollama serve & sleep 5 && ollama pull gemma4:e2b
ENTRYPOINT ["ollama", "serve"]
EOF
```

### 1.3 Deploy to Cloud Run (FinOps Safe Mode 🛡️)
Run the deployment command below. Notice `--min-instances 0` and `--cpu-throttling`: this guarantees **scale-to-zero** billing so you only pay pennies while actively clicking buttons—and **$0.00** the moment you walk away.

```bash
gcloud run deploy gemma4-e2b-service \
  --source . \
  --region us-central1 \
  --execution-environment gen2 \
  --cpu 8 \
  --memory 16Gi \
  --timeout 900s \
  --cpu-throttling \
  --min-instances 0 \
  --allow-unauthenticated
```

> ⚠️ **FinOps Pro-Tip (Don't Melt Your Credit Card!):** You might be tempted to set `--min-instances 1 --no-cpu-throttling` to eliminate cold starts. **Do not leave those flags on after testing!** Keeping an unthrottled 8-vCPU / 16GiB container warm 24/7 bills continuously (~$15–$20/day even while you sleep). Only turn on `--min-instances 1` 10 minutes before you go live on stage, and set it right back to `0` afterward!

When the build finishes, copy the **Service URL** printed in your terminal (it looks like `https://gemma4-e2b-service-xxxxxxxxx.us-central1.run.app`).

---

## Step 2: Wire Up Your Google Sheets Control Deck

1. Open [sheets.new](https://sheets.new) to spin up a fresh spreadsheet.
2. Name it **Gemma 4 PM Architect**.
3. In the top toolbar, go to **Extensions** > **Apps Script**.
4. Wipe out the empty `myFunction()` boilerplate in `Code.gs`, paste in the complete **E2B `Code.gs`** script from this repo, and hit **Ctrl + S** (or **Cmd + S**).
5. Switch back to your Google Sheet tab and hit **F5 / Refresh**.

---

## Step 3: Run the 5-Stage State Machine

1. In the Google Sheets menu bar, click **⚡ Gemma 4 PM Engine (E2B)** > **🚀 Open PM Copilot Sidebar**.
   *(Click through the standard Google Apps Script "Unverified App" warning—it's your own script!)*
2. Paste your **Cloud Run Service URL** into the sidebar box.
3. Click **🔌 0. Setup Brief & Ping**.
   * *Note:* Because we used scale-to-zero, the very first ping wakes up the container (~15–20 seconds). Subsequent calls will fly!
4. **Make it yours:** Edit Column B in `0_Brief` with your own hackathon, product launch, or community event idea (or stick with the *Jakarta Tech & AI Community Summit 2026* starter brief).
5. Click through the pipeline one stage at a time:
   * **1️⃣ Charter & OKRs:** Drafts your executive summary, scope guardrails, and measurable OKRs.
   * **2️⃣ CBA & Deliverables:** Crunches Cost-Benefit ROI and builds WBS deliverables. *(Human-in-the-loop magic: try changing a deliverable name or due week right in the cells before running Step 3!)*
   * **3️⃣ RACI Matrix:** Maps your team roles against your updated WBS deliverables with color-coded badges.
   * **4️⃣ Risk & Fishbone Diagram:** Fires two fast micro-calls to generate a Risk Register and a 6M Ishikawa Root-Cause spine.
   * **5️⃣ 12-Week Gantt Chart:** Calculates task dependencies and paints critical-path timelines across weeks W1–W12.

---

## 🎉 You Did It!
You just built a sovereign, stateful AI workflow inside Google Sheets without touching a single GPU or leaking data to an external SaaS API.

Ready to push the hardware harder? Head over to **`challenge.md`** to swap in the heavier **Gemma 4 E4B** model and see how parameter scaling changes the game!