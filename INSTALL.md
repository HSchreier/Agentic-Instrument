# 🎛️ Agentic Instrument — Installation Guide

**No coding required. Just download, click, and start making beats.**

---

## 🚀 Quick Start: Choose Your Method

### ⭐ **RECOMMENDED: Docker (Works on Mac/Windows/Linux, 3 minutes)**

**Best for:** Most users (simplest, works with all hardware)

#### Step 1: Download & Install Docker Desktop
1. Go to **https://www.docker.com/products/docker-desktop**
2. Click **"Download for Mac"** or **"Download for Windows"**
3. Run the installer, click "Install" or "Next" until done
4. Restart your computer
5. Open Docker Desktop (you'll see the Docker icon in your menu bar or system tray)

#### Step 2: Download Agentic Instrument
1. Go to **https://github.com/HSchreier/Agentic-Instrument**
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the folder (double-click the ZIP file)
5. Remember where you put it (e.g., Desktop or Documents)

#### Step 3: Run It
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
   docker-compose up --build
   ```
   *(First run takes 2-3 minutes to download & build)*

4. Wait for the message: `Uvicorn running on http://0.0.0.0:5000`

5. Open your browser and go to: **http://localhost:3000**

6. ✅ **Done!** Your app is running.

---

## 🎯 That's It!

You now have Agentic Instrument running. 

- Connect your drum machine via USB
- Go to the **Devices** tab to find it
- Create patterns with the **Generate** tab
- Send to your hardware with **Send Events**

---

## 🔧 Troubleshooting (Docker)

### "Command not found: docker"
- You skipped Step 1. Download & install Docker Desktop from https://www.docker.com/products/docker-desktop
- Restart your computer after installing
- Try the command again

### "Port 3000 is already in use"
- Another app is using that port
- In Terminal, press Ctrl+C to stop Agentic Instrument
- Wait 10 seconds
- Run `docker-compose up` again

### "Device not detected"
- Make sure your drum machine is powered on
- Check the USB cable is plugged in both ways
- Try a different USB port
- Restart the Docker container (Ctrl+C, then `docker-compose up` again)
- Docker handles all MIDI drivers — your device should appear automatically

### Still stuck?
- Take a screenshot of the error
- Open a GitHub issue: https://github.com/HSchreier/Agentic-Instrument/issues
- Include: your OS (Mac/Windows/Linux), what you were doing, and the error message

---

## 🌐 Alternative: Web-Only Install (npm, 5 minutes)

**Best for:** Quick testing on Chrome/Edge, development

Skip Docker and use npm instead:

#### Step 1: Download & Install Node.js
1. Go to **https://nodejs.org**
2. Click the big green button (LTS version)
3. Run the installer, click "Next" until done
4. Restart your computer

#### Step 2: Download Agentic Instrument
1. Go to **https://github.com/HSchreier/Agentic-Instrument**
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the folder
5. Remember where you put it

#### Step 3: Install & Run
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the folder:
   ```
   cd Desktop/Agentic-Instrument
   ```
3. Install dependencies:
   ```
   cd frontend && npm install
   ```
4. Start the app:
   ```
   npm run dev
   ```
5. Open your browser: **http://localhost:5173**

**Note:** Web-only version uses your browser's MIDI support. Some hardware may not detect properly on Windows/Mac. For best results, use the Docker version above.

---

## 📱 Get Help from Claude

Want personalized help? Ask Claude Desktop:

> *"Help me install Agentic Instrument for making drum patterns"*

Claude can walk you through any step, troubleshoot errors, or explain how to use it.

---

## ✅ You're Ready

Plug in your hardware. Open http://localhost:3000 (Docker) or http://localhost:5173 (npm). Start making music.

**Questions?** See the README at https://github.com/HSchreier/Agentic-Instrument
