# 🎛️ Agentic Instrument — Installation Guide

**No coding required. Just download, click, and start making beats.**

---

## 🚀 Quick Start (5 minutes)

### Step 1: Download & Install Node.js
1. Go to **https://nodejs.org**
2. Click the big green button (LTS version)
3. Run the installer, click "Next" until done
4. Restart your computer

### Step 2: Download Agentic Instrument
1. Go to **https://github.com/HSchreier/Agentic-Instrument**
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the folder (double-click the ZIP file)
5. Remember where you put it (e.g., Desktop or Documents)

### Step 3: Install & Run
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
   - **Mac:** Press Cmd+Space, type "Terminal", press Enter
   - **Windows:** Press Win+R, type "cmd", press Enter

2. Copy and paste this command, then press Enter:
   ```
   cd Desktop/Agentic-Instrument
   ```
   *(If you put the folder elsewhere, change "Desktop" to your folder path)*

3. Copy and paste this command, then press Enter:
   ```
   cd frontend && npm install
   ```
   *(This takes 1-2 minutes — let it finish)*

4. Copy and paste this command, then press Enter:
   ```
   npm run dev
   ```

5. A browser window opens at **http://localhost:5175**
   - If it doesn't, open your browser and type that URL manually

---

## 🎯 That's It!

You now have Agentic Instrument running. 

- Connect your drum machine via USB
- Go to the **Devices** tab to find it
- Create patterns with the **Generate** tab
- Send to your hardware with **Send Events**

---

## 🔧 Troubleshooting

### "Command not found: npm"
- You skipped Step 1. Download & install Node.js from https://nodejs.org
- Restart your computer after installing
- Try the command again

### "Port 5175 is already in use"
- Another app is using that port
- In Terminal, press Ctrl+C to stop Agentic Instrument
- Wait 10 seconds
- Run `npm run dev` again

### "Device not detected"
- Make sure your drum machine is powered on
- Check the USB cable is plugged in both ways
- Try a different USB port
- Refresh the browser (Cmd+R on Mac, Ctrl+R on Windows)
- Some browsers don't support Web MIDI — use Chrome or Edge

### Still stuck?
- Take a screenshot of the error
- Open a GitHub issue: https://github.com/HSchreier/Agentic-Instrument/issues
- Include: your OS (Mac/Windows), what you were doing, and the error message

---

## 📱 Next: Claude Integration (Optional)

Want to use Claude to generate patterns? Ask Claude Desktop:

> *"Help me set up Agentic Instrument"*

Claude can walk you through any step, troubleshoot errors, or explain how to use it.

---

## ✅ You're Ready

Plug in your hardware. Open http://localhost:5175. Start making music.

**Questions?** See the README at https://github.com/HSchreier/Agentic-Instrument
