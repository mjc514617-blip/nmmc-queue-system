import "dotenv/config";
import http from "node:http";
import fs from "node:fs/promises";

const PORT = Number(process.env.PRINT_DAEMON_PORT || 8787);
const SERIAL_DEVICE = process.env.PRINTER_DEVICE || "/dev/rfcomm0";
const QR_BASE_URL = (
  process.env.QR_BASE_URL ||
  process.env.VITE_QR_BASE_URL ||
  "https://nmmc-queue-system.vercel.app"
).replace(/\/$/, "");

const ok = (res, data) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
};

const fail = (res, status, message) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify({ error: message }));
};

const esc = (...bytes) => Buffer.from(bytes);

const escPosQr = (value) => {
  const content = Buffer.from(String(value), "utf8");
  const storeLength = content.length + 3;
  const pL = storeLength & 0xff;
  const pH = (storeLength >> 8) & 0xff;

  return Buffer.concat([
    esc(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00),
    // Slightly larger module size improves camera detection on thermal paper.
    esc(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x08),
    // Lower ECC can improve readability for long URL payloads on small paper.
    esc(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30),
    Buffer.concat([esc(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30), content]),
    esc(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30),
  ]);
};

const escPosTicket = (payload) => {
  const now = new Date().toLocaleString();
  const ticketNumber = String(payload.ticketNumber || payload.queue_number || "").trim();
  const payloadQrUrl = String(payload.qr_url || payload.qrUrl || "").trim();
  const qrValue = payloadQrUrl || (ticketNumber ? `${QR_BASE_URL}/track?queue=${encodeURIComponent(ticketNumber)}` : QR_BASE_URL);
  const headText = [
    "NMMC QUEUE SYSTEM\n",
    "--------------------------\n",
    `Department: ${payload.department || "-"}\n`,
    `Service: ${payload.service || "-"}\n`,
    `Ticket: ${payload.ticketNumber || "-"}\n`,
    `Doctor: ${payload.doctorName || "-"}\n`,
    `Room: ${payload.roomNumber || "-"}\n`,
    `Time: ${now}\n`,
    "--------------------------\n",
  ].join("");

  const parts = [
    esc(0x1b, 0x40),
    Buffer.from(headText, "utf8"),
  ];

  if (qrValue) {
    // Center QR so quiet zone is balanced and easier to scan.
    parts.push(esc(0x1b, 0x61, 0x01));
    parts.push(Buffer.from("Scan to check your queue:\n\n", "utf8"));
    parts.push(escPosQr(qrValue));
    parts.push(Buffer.from("\n\n", "utf8"));
    parts.push(esc(0x1b, 0x61, 0x00));
  }

  parts.push(Buffer.from("Please wait for your turn\n\n\n", "utf8"));
  parts.push(esc(0x1d, 0x56, 0x01));

  return Buffer.concat(parts);
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    ok(res, {
      ok: true,
      device: SERIAL_DEVICE,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method !== "POST" || req.url !== "/print") {
    fail(res, 404, "Not found");
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const ticket = escPosTicket(payload);

    await fs.writeFile(SERIAL_DEVICE, ticket, { flag: "w" });
    ok(res, { success: true, device: SERIAL_DEVICE });
  } catch (error) {
    fail(res, 500, error instanceof Error ? error.message : "Print failed");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Print daemon listening on http://127.0.0.1:${PORT}`);
  console.log(`Serial printer device: ${SERIAL_DEVICE}`);
});
