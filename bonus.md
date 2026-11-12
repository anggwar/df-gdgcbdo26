# 🎁 Take-Home Bonus: Air-Gapped Gemma on Your Laptop + Offline MS Office

So you built the cloud pipeline—now what happens when you're on a 12-hour flight with zero Wi-Fi, or working inside a strict enterprise network where cloud endpoints are completely blocked?

Welcome to the **100% Offline Take-Home Stack**. Because Gemma 4 is open-weight and runs locally via Ollama, you can pack this entire AI brain onto your laptop, slap a clean Chatbox UI on top of it, and even wire it directly into **Microsoft Excel & Word**—with **zero internet** and **$0.00 cloud bills forever**.

---

## 🛠️ Part 1: Install Ollama Locally (2 Minutes)

Ollama turns your laptop's CPU or GPU (Apple Silicon M-series, NVIDIA, or standard x86) into a local inference server listening on `http://localhost:11434`.

* **macOS / Windows:**
  1. Download the official installer from [ollama.com/download](https://ollama.com/download).
  2. Double-click and run it. Once installed, you'll see the little llama icon chilling in your top menu bar or system tray.
* **Linux:**
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

Verify it's alive by opening your terminal / PowerShell and running:
```bash
ollama --version
```

---

## 📦 Part 2: Download Gemma 4 Models for Offline Use

While you still have Wi-Fi, pull the Gemma 4 weights onto your hard drive. Once downloaded, they live locally forever—no internet required!

### Option A: The Speedy Daily Driver (`gemma4:e2b`)
Great for laptops with **8GB – 16GB RAM**. Fast responses, tiny footprint (~1.5GB).
```bash
ollama pull gemma4:e2b
```

### Option B: The Heavyweight Thinker (`gemma4:e4b`)
Great for laptops with **16GB+ RAM** (especially Apple Silicon Macs or GPUs). Deeper reasoning (~4GB).
```bash
ollama pull gemma4:e4b
```

Test it right in your terminal (turn off your Wi-Fi if you want to flex!):
```bash
ollama run gemma4:e2b "Give me 3 bullet points on why offline AI rocks."
```

---

## 💬 Part 3: Add a Sleek Local Chatbox UI

Terminals are cool, but having a clean desktop chat window for brainstorming, summarizing PDFs, and drafting emails offline is even better.

1. Download **Chatbox** (free, open-source desktop client) from [chatboxai.app](https://chatboxai.app) — *or use **Open WebUI** / **AnythingLLM** if you prefer browser-based UIs.*
2. Open Chatbox and go to **Settings** > **Model Provider**.
3. Select **Ollama** as your provider.
4. Set the API Host to:
   ```text
   http://127.0.0.1:11434
   ```
5. Pick **`gemma4:e2b`** or **`gemma4:e4b`** from the model dropdown and hit **Save**.

Boom—you now have a private, offline ChatGPT-style workspace sitting on your dock.

---

## 📊 Part 4: Connect Offline Gemma to Microsoft Office (Excel & Word)

Remember the big question from the talk: *"Can we do the Google Sheets magic inside Microsoft Office completely offline?"*

**Yes!** Because Ollama exposes a standard local HTTP server on `localhost:11434`, MS Office can talk to Gemma without a single packet leaving your laptop. You have two awesome ways to wire this up:

### Route 1: The "Zero-Install" Excel VBA Macro (Works Offline Immediately!)
Just like Google Apps Script talks to Cloud Run, Excel's built-in **VBA (Visual Basic for Applications)** can send HTTP POST requests straight to `http://localhost:11434/api/generate`!

1. Open **Microsoft Excel**, press **`Alt + F11`** (or `Option + F11` on Mac) to open the VBA Editor.
2. Go to **Insert** > **Module** and paste this starter function:

```vba
Function AskGemmaOffline(promptText As String) As String
    Dim http As Object
    Dim url As String
    Dim jsonBody As String
    Dim responseText As String
    
    url = "http://localhost:11434/api/generate"
    
    ' Escape quotes safely for JSON
    promptText = Replace(promptText, """", "\""")
    
    jsonBody = "{""model"": ""gemma4:e2b"", ""prompt"": """ & promptText & """, ""stream"": false}"
    
    Set http = CreateObject("MSXML2.XMLHTTP")
    http.Open "POST", url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.send jsonBody
    
    responseText = http.responseText
    
    ' Quick extraction of the "response" field
    Dim startPos As Long, endPos As Long
    startPos = InStr(responseText, """response"":""") + 12
    endPos = InStr(startPos, responseText, """,""done"":")
    
    If startPos > 12 And endPos > startPos Then
        AskGemmaOffline = Replace(Mid(responseText, startPos, endPos - startPos), "\n", vbCrLf)
    Else
        AskGemmaOffline = "Error: Check if Ollama is running locally."
    End If
End Function
```

3. Close the VBA editor, click any Excel cell, and type:
   ```excel
   =AskGemmaOffline("Write a 1-sentence risk mitigation plan for: " & A2)
   ```
   Excel will call your local Gemma 4 model offline and populate the cell!

---

### Route 2: Model Context Protocol (MCP) + Local `.xlsx` / `.docx` Files
If you want Gemma to read, analyze, and edit entire Excel workbooks or Word documents autonomously without touching VBA:

1. **How it works:** Run a lightweight local **MCP Server** (using Python `openpyxl` / `python-docx` or Node.js) on your laptop.
2. **Connect your MCP Client:** Point an MCP-compatible local host (like **Claude Desktop**, **Cline / Continue in VS Code**, or a local Python agent) to your local Ollama endpoint (`http://localhost:11434/v1`) and enable the **Filesystem / Excel MCP tool**.
3. **Prompt away offline:**
   > *"Read `Q4_Event_Budget.xlsx` in my Documents folder, check if catering exceeds 30% of the IDR 150M cap, and write a new tab called `Risk_Audit` with your findings."*

Your local Gemma model inspects the spreadsheet on disk, crunches the numbers, and writes the new tab—all while your laptop is in Airplane Mode. ✈️

---

## 🚀 Keep Building!
* **Want more models?** Browse [ollama.com/library](https://ollama.com/library) to experiment with vision models, coding models, or embedding models for local RAG.
* **Share what you build:** Tag your offline spreadsheet workflows and share your benchmarks from the workshop!