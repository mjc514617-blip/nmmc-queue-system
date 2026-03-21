import http from "node:http";
import fs from "node:fs/promises";

const PORT = Number(process.env.PRINT_DAEMON_PORT || 8787);
const SERIAL_DEVICE = process.env.PRINTER_DEVICE || "/dev/rfcomm0";

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

const escPosText = (payload) => {
  const now = new Date().toLocaleString();
  const lines = [
    "\u001b@", // init
    "NMMC QUEUE SYSTEM\n",
    "--------------------------\n",
    `Department: ${payload.department || "-"}\n`,
    `Service: ${payload.service || "-"}\n`,
    `Ticket: ${payload.ticketNumber || "-"}\n`,
    `Doctor: ${payload.doctorName || "-"}\n`,
    `Room: ${payload.roomNumber || "-"}\n`,
    `Time: ${now}\n`,
    "--------------------------\n",
    "Please wait for your turn\n\n\n",
    "\u001dV\u0001", // partial cut
  ];

  return lines.join("");
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
    const ticket = escPosText(payload);

    await fs.writeFile(SERIAL_DEVICE, ticket, { encoding: "binary", flag: "w" });
    ok(res, { success: true, device: SERIAL_DEVICE });
  } catch (error) {
    fail(res, 500, error instanceof Error ? error.message : "Print failed");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Print daemon listening on http://127.0.0.1:${PORT}`);
  console.log(`Serial printer device: ${SERIAL_DEVICE}`);
});
