class ArduinoWebSerial {
  constructor() {
    this.port = null;
    this.reader = null;
    this.callbacks = {};
    this.isConnected = false;
    this.lineBuffer = "";
  }

  // Check if Web Serial API is supported
  isSupported() {
    return "serial" in navigator;
  }

  // Connect to Arduino with user selection
  async connect() {
    if (!this.isSupported()) {
      throw new Error("Web Serial API not supported in this browser");
    }

    try {
      console.log("🔍 Requesting serial port...");

      // Check what ports are available (this might help debug)
      try {
        const ports = await navigator.serial.getPorts();
        console.log("📋 Previously authorized ports:", ports.length);
        ports.forEach((port, index) => {
          console.log(`Port ${index}:`, port);
        });
      } catch (e) {
        console.log("Could not get existing ports:", e);
      }

      // Request a port and open a connection
      console.log("📤 Showing port picker dialog...");
      this.port = await navigator.serial.requestPort();
      console.log("✅ Port selected:", this.port);

      console.log("🔌 Opening port with baudRate 9600...");
      await this.port.open({ baudRate: 9600 });
      console.log("✅ Port opened successfully");

      this.isConnected = true;
      console.log("Arduino connected successfully!");

      // Start reading data
      this.startReading();

      if (this.callbacks.connected) {
        this.callbacks.connected();
      }

      return true;
    } catch (error) {
      console.error("❌ Connection failed at step:", error.name, error.message);
      if (this.callbacks.error) {
        this.callbacks.error(error.message);
      }
      return false;
    }
  }

  // Start reading data from Arduino
  async startReading() {
    if (!this.port || !this.port.readable) return;

    try {
      this.reader = this.port.readable.getReader();

      while (this.isConnected) {
        const { value, done } = await this.reader.read();
        if (done) break;

        // Convert bytes to string
        const text = new TextDecoder().decode(value);
        this.processData(text);
      }
    } catch (error) {
      console.error("Error reading from Arduino:", error);
      if (this.callbacks.error) {
        this.callbacks.error(error.message);
      }
    }
  }

  // Process incoming data and handle line buffering
  processData(text) {
  const receiveTime = performance.now();
  console.log(`📡 Arduino raw bytes at ${receiveTime.toFixed(2)}ms:`, JSON.stringify(text));
  
  for (const char of text) {
    if (char === "\n" || char === "\r") {
      if (this.lineBuffer.length > 0) {
        const line = this.lineBuffer.trim();
        const processTime = performance.now();
        console.log(`📥 Arduino line processed: "${line}" at ${processTime.toFixed(2)}ms`);
        
        if (this.callbacks.line) {
          const callbackStart = performance.now();
          this.callbacks.line(line);
          const callbackTime = performance.now() - callbackStart;
          console.log(`⚡ Arduino callback took ${callbackTime.toFixed(2)}ms`);
        }
        this.lineBuffer = "";
      }
    } else {
      this.lineBuffer += char;
    }
  }
}

  // Set up event callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  // Disconnect from Arduino
  async disconnect() {
    this.isConnected = false;

    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    if (this.port) {
      await this.port.close();
      this.port = null;
    }

    if (this.callbacks.disconnected) {
      this.callbacks.disconnected();
    }
  }

  // Write data to Arduino (if needed)
  async write(data) {
    if (!this.port || !this.port.writable) {
      throw new Error("Port not connected or not writable");
    }

    const writer = this.port.writable.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(data));
    writer.releaseLock();
  }
}
