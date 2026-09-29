import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const port = Number(process.env.PORT || 8787);
const secret = process.env.ATTENDANCE_TOKEN_SECRET || "campus-plus-development-secret-change-me";
const tokenLifetimeSeconds = 3;

function loadDotEnv() {
  const envFile = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
loadDotEnv();

// --- Mongoose Setup ---
let isMongoConnected = false;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { isMongoConnected = true; console.log("Connected to MongoDB!"); })
    .catch(err => console.error("MongoDB connection error:", err));
}

const sessionSchema = new mongoose.Schema({
  id: String,
  subject: String,
  section: String,
  room: String,
  createdAt: Number,
  closed: Boolean,
  attendance: [String]
});
const SessionModel = mongoose.model("Session", sessionSchema);

// In-Memory Fallbacks (if MongoDB is not provided)
const sessions = new Map();
const studentRegistrations = new Map();
const passwordResetChallenges = new Map();
const faceRegistrationFile = path.join(process.cwd(), "face-registrations.json");
const faceRegistrations = new Map(Object.entries(JSON.parse(fs.existsSync(faceRegistrationFile) ? fs.readFileSync(faceRegistrationFile, "utf8") : "{}")));

const interviewAssistantSystemPrompt = "You are CampusConnect's Interview... (Truncated for memory)";
const careerAssistantSystemPrompt = "You are CampusConnect's Career Path...";

function encode(value) { return Buffer.from(JSON.stringify(value)).toString("base64url"); }
function sign(value) { return crypto.createHmac("sha256", secret).update(value).digest("base64url"); }

function encryptFaceDescriptor(descriptor) {
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(descriptor), "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function issueToken(session) {
  const now = Math.floor(Date.now() / 1000);
  const payload = encode({
    sessionId: session.id,
    subject: session.subject,
    section: session.section,
    room: session.room,
    iat: now,
    exp: now + tokenLifetimeSeconds,
    jti: crypto.randomUUID(),
  });
  return `${payload}.${sign(payload)}`;
}

async function verifyToken(token) {
  if (typeof token !== "string") throw new Error("Missing attendance token.");
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Malformed attendance token.");
  const expected = sign(parts[0]);
  const actual = Buffer.from(parts[1]);
  const expectedBuffer = Buffer.from(expected);
  if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) throw new Error("Invalid attendance token.");
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); } catch { throw new Error("Malformed attendance token."); }
  const now = Math.floor(Date.now() / 1000);
  if (!payload.sessionId || !payload.jti || !payload.exp || payload.exp <= now || payload.iat > now + 1) throw new Error("Attendance QR has expired.");
  
  let session;
  if (isMongoConnected) {
    session = await SessionModel.findOne({ id: payload.sessionId });
  } else {
    session = sessions.get(payload.sessionId);
  }
  
  if (!session || session.closed) throw new Error("Attendance session is closed or unknown.");
  return { payload, session };
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let value = "";
    request.on("data", chunk => { value += chunk; if (value.length > 100000) reject(new Error("Request too large.")); });
    request.on("end", () => { try { resolve(value ? JSON.parse(value) : {}); } catch { reject(new Error("Invalid JSON body.")); } });
    request.on("error", reject);
  });
}

function saveFaceRegistrations() { fs.writeFileSync(faceRegistrationFile, JSON.stringify(Object.fromEntries(faceRegistrations), null, 2)); }
function requireTeacherRole(body) { if (body.role !== "teacher") throw new Error("Teacher authorization is required."); }

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") { response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }); return response.end(); }
  if (request.method === "GET" && request.url === "/api/health") return json(response, 200, { ok: true });
  if (request.method !== "POST") return json(response, 404, { error: "Not found." });

  try {
    const body = await readBody(request);
    
    // ... [Omitted other non-attendance endpoints for brevity, assuming we paste them back in correctly] ...
    if (request.url === "/api/attendance/session") {
      requireTeacherRole(body);
      if (!body.sessionId) throw new Error("Session ID is required.");
      const sessionData = { id: body.sessionId, subject: body.subject || "Data Structures", section: body.section || "CSE-A", room: body.room || "204", createdAt: Date.now(), closed: false, attendance: [] };
      if (isMongoConnected) {
        await SessionModel.create(sessionData);
      } else {
        sessionData.attendance = new Set();
        sessions.set(sessionData.id, sessionData);
      }
      return json(response, 200, { sessionId: sessionData.id, token: issueToken(sessionData), expiresIn: tokenLifetimeSeconds });
    }
    
    if (request.url === "/api/attendance/token") {
      requireTeacherRole(body);
      let session;
      if (isMongoConnected) session = await SessionModel.findOne({ id: body.sessionId });
      else session = sessions.get(body.sessionId);
      
      if (!session || session.closed) throw new Error("Attendance session is closed or unknown.");
      return json(response, 200, { token: issueToken(session), expiresIn: tokenLifetimeSeconds });
    }
    
    if (request.url === "/api/attendance/mark") {
      const { payload, session } = await verifyToken(body.token);
      if (!body.studentId) throw new Error("Student identity is required.");
      
      if (isMongoConnected) {
        if (session.attendance.includes(body.studentId)) return json(response, 409, { error: "Attendance already marked for this session." });
        session.attendance.push(body.studentId);
        await session.save();
      } else {
        if (session.attendance.has(body.studentId)) return json(response, 409, { error: "Attendance already marked for this session." });
        session.attendance.add(body.studentId);
      }
      return json(response, 200, { ok: true, sessionId: payload.sessionId, subject: payload.subject, section: payload.section, room: payload.room, markedAt: new Date().toISOString() });
    }
    
    // Other endpoints go here (password reset, groq, etc)
    return json(response, 404, { error: "Not found." });
  } catch (error) {
    return json(response, 400, { error: error.message || "Attendance request failed." });
  }
});

server.listen(port, () => console.log(`Campus Plus API listening on http://localhost:${port}`));
