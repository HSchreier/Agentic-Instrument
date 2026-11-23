# 🎛️ Hardware Setup Guide

**If your machine isn't detected in Agentic Instrument**, follow the setup for your device below.

---

## 🔧 General Requirements

Before trying device-specific setup:

- ✅ **Browser:** Chrome, Edge, or Opera (Safari/Firefox don't support Web MIDI)
- ✅ **Cable:** Quality USB cable (some cheap ones don't support MIDI)
- ✅ **Power:** Device must be powered on
- ✅ **Drivers:** Install latest drivers for your OS (see device below)

**Still not detected?**
1. Try a different USB port
2. Restart your computer
3. Restart Agentic Instrument browser tab (Cmd+R / Ctrl+R)
4. Check the browser console for errors (open Developer Tools: F12)

---

## 🎯 Device-Specific Setup

### 🥁 Akai Rhythm Wolf
**USB Mode:** MIDI (not Audio)

**Mac:**
- Download: https://www.akaipro.com/rhythm-wolf (look for "Mac Driver")
- Install and restart
- Connect via USB
- Device should appear as "Rhythm Wolf"

**Windows:**
- Download: https://www.akaipro.com/rhythm-wolf (look for "Windows Driver")
- Install and restart
- Connect via USB
- Device should appear as "Rhythm Wolf"

**Troubleshooting:**
- In Rhythm Wolf: Check **MIDI Setup** menu, set channel to 10
- Try different USB port on computer
- If still nothing: Device may need firmware update (check Akai website)

---

### 🎚️ Elektron Analog Rytm MKII
**USB Mode:** MIDI Device

**Mac & Windows:**
- Usually plug-and-play (no drivers needed)
- On device: Go to **Settings → MIDI → USB** and set to **ON**
- Connect via USB (use the USB port on back)
- Device should appear as "Analog Rytm MKII"

**Troubleshooting:**
- Check device has latest OS (Elektron.cc → Updates)
- Try the USB-C port if device has multiple
- Restart device after changing MIDI settings

---

### 🤖 Roland TR-8S
**USB Mode:** MIDI

**Mac & Windows:**
- Usually plug-and-play
- On device: **MENU → SYSTEM → MIDI → USB DEVICE** = **ON**
- Connect via USB (micro-USB port)
- Device should appear as "TR-8S"

**Troubleshooting:**
- Update OS: https://www.roland.com/us/products/tr-8s/
- Use original or high-quality USB cable (micro-USB)
- Try different USB port

---

### 🧵 Teenage Engineering OP-Z
**USB Mode:** MIDI

**Mac & Windows:**
- Plug-and-play
- On device: **Menu → Devices → USB MIDI** should be enabled by default
- Connect via USB-C
- Device should appear as "OP-Z"

**Troubleshooting:**
- Check firmware: https://teenage.engineering/guides/op-z/getting-started
- OP-Z may show as generic MIDI device — still works!
- Use a quality USB-C cable

---

### 🎹 Korg Volca Keys
**USB Mode:** MIDI

**Mac & Windows:**
- Plug-and-play (no drivers)
- Connect via micro-USB
- Device should appear as "Volca Keys"

**Troubleshooting:**
- Very basic MIDI support — may appear as "USB Audio Device"
- If that happens, it's normal — Agentic Instrument will still work
- Use a quality micro-USB cable

---

### 🥁 Native Instruments Maschine MK3
**USB Mode:** MIDI

**Mac:**
- Download Maschine 2.0+: https://www.native-instruments.com/en/products/maschine/
- Install and restart
- In Maschine software: Set to MIDI mode
- Connect via USB
- Device should appear as "Maschine"

**Windows:**
- Same as Mac
- Download latest Maschine software
- Install and restart

**Troubleshooting:**
- Maschine software must be installed (not just driver)
- In Maschine software, enable MIDI output
- Restart Maschine software if device appears/disappears

---

### 🔌 Generic MIDI Device
**USB Mode:** MIDI

For any MIDI device not listed above:

**Mac & Windows:**
1. Connect via USB
2. Open **System Preferences / Settings → Sound**
3. Look for your device in MIDI setup
4. If it appears there, Agentic Instrument should find it
5. Device will appear as "Generic MIDI" in Agentic Instrument

---

## 🐛 Debugging Checklist

If your device still doesn't appear:

- [ ] Browser is Chrome, Edge, or Opera
- [ ] Device is powered on
- [ ] USB cable works (try with another app)
- [ ] Latest drivers installed
- [ ] Device USB MIDI mode is enabled
- [ ] Try different USB port
- [ ] Restart computer
- [ ] Restart browser
- [ ] Check browser console (F12) for errors
- [ ] Device appears in OS system settings

---

## 📱 Browser Console Errors

Open **Developer Tools** (F12) and check for messages like:

**"MIDI access denied"**
- Some browsers block MIDI by default
- Use Chrome, Edge, or Opera instead
- Safari & Firefox don't support Web MIDI

**"Device unknown"**
- Device is detected but not recognized
- Try using Generic MIDI mode
- Contact support with device name from console

**"No MIDI devices"**
- Device not detected by OS
- Install drivers (see device above)
- Try different USB port/cable

---

## 🆘 Still Stuck?

1. **Check GitHub Issues:** https://github.com/HSchreier/Agentic-Instrument/issues
2. **Share device output:** 
   - Open DevTools (F12)
   - Right-click → Inspect Element
   - Copy everything from Console tab
   - Paste in GitHub issue
3. **Include:**
   - Device name & model
   - Computer OS (Mac/Windows)
   - Browser used
   - What you tried

---

## ✅ Once Detected

After your device appears in the **Devices** tab:

1. Click to select it
2. Go to **Generate** tab
3. Create a pattern
4. Click **Send Events →**
5. Check your device for incoming data!

**Welcome to Agentic Instrument!** 🎛️
