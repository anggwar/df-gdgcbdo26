# 🏆 Capstone Challenge: Level Up to Gemma 4 E4B (or Custom Models)

So you got `gemma4:e2b` humming inside Google Sheets—nice work! Now let's put on our AI Systems Engineer hat and explore the classic production tradeoff: **Model Intelligence vs. CPU Inference Latency.**

In this challenge, you will deploy the larger **`gemma4:e4b`** model (or another open-weight model from the Ollama library), hot-swap your Google Sheet to point at it, and tune the inference parameters so it doesn't time out on CPU.

---

## 🎯 Challenge Objectives

1. Deploy a second Cloud Run microservice running **`gemma4:e4b`**.
2. Hot-swap your Google Sheets sidebar to the new endpoint without breaking your existing tabs.
3. Compare output quality vs. execution speed—and tune `num_thread` and `num_predict` to keep CPU inference stable.

---

## Step 1: Deploy the `gemma4:e4b` Container

Head back to **Google Cloud Shell** and create a separate directory so both services live side-by-side cleanly.

```bash
mkdir -p ~/gemma4-e4b && cd ~/gemma4-e4b

cat << 'EOF' > .gcloudignore
.gcloudignore
.git
.gitignore
.gemini
.*
EOF

cat << 'EOF' > Dockerfile
FROM ollama/ollama:latest
ENV OLLAMA_HOST=0.0.0.0:8080
ENV OLLAMA_KEEP_ALIVE=-1
ENV OLLAMA_NUM_PARALLEL=2
RUN ollama serve & sleep 5 && ollama pull gemma4:e4b
ENTRYPOINT ["ollama", "serve"]
EOF
```

Deploy it as a brand-new Cloud Run service (keeping `--min-instances 0` so your wallet stays happy!):

```bash
gcloud run deploy gemma4-e4b-service \
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

Copy the new `https://gemma4-e4b-service-...run.app` URL once deployment wraps up.

---

## Step 2: Hot-Swap the Model in Apps Script

Because our sidebar stores the active URL in `PropertiesService`, switching backends takes 10 seconds:

1. Open **Extensions** > **Apps Script** in your Google Sheet.
2. Find line 8 at the very top of `Code.gs` and switch the target model:
   ```javascript
   const DEFAULT_MODEL = "gemma4:e4b";
   ```
3. Press **Ctrl + S** (or **Cmd + S**) to save.
4. Refresh your Google Sheet (`F5`) and open **⚡ Gemma 4 PM Engine** > **🚀 Open PM Copilot Sidebar**.
5. Paste your new **`gemma4-e4b-service`** URL into the input box and click **🔌 0. Setup Brief & Ping**.

---

## Step 3: Benchmark & Tune (The Real-World Engineering Part)

Run **Step 1 (Charter & OKRs)** and **Step 4 (Risk & Fishbone)** using E4B and observe what happens:

1. **Compare the Output Nuance:** Look at the Business Case, Risk Mitigation plans, and Root-Cause phrasing compared to E2B. Notice how E4B connects multi-step constraints (like tying Wi-Fi bandwidth directly to attendee headcount and SLA penalties) with much sharper reasoning.
2. **Watch the Clock:** E4B is roughly twice the size of E2B. On 8 vCPUs, each step will take noticeably longer (~60–150 seconds depending on token count).
3. **Experiment with CPU Parameters:** Inside `callGemmaE2B()` in `Code.gs`, try tweaking the `options` block:
   ```javascript
   options: { 
     temperature: 0.1, 
     num_ctx: 2048,
     num_predict: 2000, // Try bumping this if E4B writes longer JSON values
     num_thread: 4      // Compare 4 threads vs 6 threads on memory-bandwidth speed
   }
   ```

---

## 🌟 Bonus Boss Level: Try Another Open Model!

Want to test how non-Gemma open models handle strict JSON state machines on CPU? Swap `gemma4:e4b` in your `Dockerfile` and `DEFAULT_MODEL` for:
* `gemma3:4b` (Compare Gemma 3 vs. Gemma 4 reasoning efficiency!)
* `qwen2.5:3b` or `llama3.2:3b` (Test cross-family JSON schema adherence)

---

## 🧹 Final Cleanup Check

Before closing your laptop, verify that **all** your Cloud Run services are scaled to `0` so you have zero surprise charges:

```bash
gcloud run services list --region us-central1
```
If any service shows `MIN INSTANCES: 1`, scale it down:
```bash
gcloud run services update YOUR_SERVICE_NAME --region us-central1 --min-instances 0 --cpu-throttling
```