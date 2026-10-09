import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.env.PORT || 8787);
const secret = process.env.ATTENDANCE_TOKEN_SECRET || "campus-plus-development-secret-change-me";
const sessions = new Map();
const studentRegistrations = new Map();
const passwordResetChallenges = new Map();
const faceRegistrationFile = path.join(process.cwd(), "face-registrations.json");
const faceRegistrations = new Map(Object.entries(JSON.parse(fs.existsSync(faceRegistrationFile) ? fs.readFileSync(faceRegistrationFile, "utf8") : "{}")));
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
const interviewAssistantSystemPrompt = "You are CampusConnect's Interview and Career Assistant. Help college students prepare for placements and internships with practical, clear, encouraging advice. Answer interview questions, resume and application questions, behavioral and technical preparation questions, career planning questions, and company research questions. When useful, give concise steps, sample answers, frameworks, or practice prompts. Do not invent private company policies or claim access to a student's records. Ask a brief clarifying question when essential details are missing.";
const careerAssistantSystemPrompt = "You are CampusConnect's Career Path Recommender. Have a natural, practical conversation with college students about careers, education, skills, jobs, internships, roadmaps, courses, technologies, placements, and related goals. Use the student's branch, year, skills, interests, and goals when provided. Give personalized career paths, learning roadmaps, skill recommendations, project ideas, internship guidance, and interview preparation when relevant. Answer normal career questions conversationally, ask useful follow-up questions when context is missing, and do not claim access to private student records.";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

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

function verifyToken(token) {
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
  const session = sessions.get(payload.sessionId);
  if (!session || session.closed) throw new Error("Attendance session is closed or unknown.");
  return { payload, session };
}

function json(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
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

function saveFaceRegistrations() {
  fs.writeFileSync(faceRegistrationFile, JSON.stringify(Object.fromEntries(faceRegistrations), null, 2));
}

function requireTeacherRole(body) {
  if (body.role !== "teacher") throw new Error("Teacher authorization is required.");
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
    return response.end();
  }
  if (request.method === "GET" && request.url === "/api/health") return json(response, 200, { ok: true });
  if (request.method !== "POST") return json(response, 404, { error: "Not found." });

  try {
    const body = await readBody(request);
    if (request.url === "/api/accounts/face-registration") {
      if (!body.userId || !["student", "teacher", "warden", "admin"].includes(body.role)) throw new Error("A valid account role and ID are required.");
      if (!Array.isArray(body.descriptor) || body.descriptor.length !== 128 || body.descriptor.some(value => !Number.isFinite(value))) throw new Error("A valid face descriptor is required.");
      if (body.role === "student" && body.actorRole !== "student") throw new Error("Student face registration requires the Student account flow.");
      if (["teacher", "warden"].includes(body.role) && body.actorRole !== "admin") throw new Error("Admin authorization is required for staff face registration.");
      faceRegistrations.set(`${body.role}:${body.userId}`, { userId: body.userId, role: body.role, encryptedDescriptor: encryptFaceDescriptor(body.descriptor), updatedAt: new Date().toISOString() });
      saveFaceRegistrations();
      return json(response, 201, { ok: true, userId: body.userId, role: body.role });
    }
    if (request.url === "/api/accounts/password-reset/request") {
      if (!body.email) throw new Error("Registered email is required.");
      const otp = String(crypto.randomInt(100000, 1000000));
      passwordResetChallenges.set(body.email.trim().toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
      return json(response, 200, { ok: true, message: "A password reset OTP has been sent to the registered email.", demoOtp: otp });
    }
    if (request.url === "/api/accounts/password-reset/verify") {
      const email = String(body.email || "").trim().toLowerCase();
      const challenge = passwordResetChallenges.get(email);
      if (!challenge || challenge.expiresAt < Date.now() || challenge.attempts >= 5) throw new Error("This reset code has expired. Request a new one.");
      challenge.attempts += 1;
      if (challenge.otp !== String(body.otp || "")) throw new Error("Invalid reset code.");
      passwordResetChallenges.delete(email);
      return json(response, 200, { ok: true });
    }
    if (request.url === "/api/accounts/register") {
      if (body.role !== "student") throw new Error("Only Student accounts can self-register.");
      if (!body.email || !body.name) throw new Error("Student name and email are required.");
      const key = body.email.trim().toLowerCase();
      if (studentRegistrations.has(key)) throw new Error("A student registration with this email already exists.");
      studentRegistrations.set(key, { name: body.name.trim(), email: key, department: body.department || "", status: "pending", createdAt: new Date().toISOString() });
      return json(response, 201, { ok: true, status: "pending" });
    }
    if (request.url === "/api/accounts/approval") {
      if (body.actorRole !== "admin") throw new Error("Admin authorization is required.");
      if (!body.email || !["approved", "rejected"].includes(body.status)) throw new Error("A valid Student approval decision is required.");
      const key = body.email.trim().toLowerCase();
      const registration = studentRegistrations.get(key);
      if (!registration) throw new Error("Student registration was not found.");
      registration.status = body.status;
      return json(response, 200, { ok: true, status: registration.status });
    }
    if (request.url === "/api/placement/interview") {
      if (!process.env.GROQ_API_KEY) return json(response, 503, { error: "Interview Assistant is not configured. Add GROQ_API_KEY=... to the server .env file and restart the API." });
      if (!Array.isArray(body.messages) || !body.messages.length) throw new Error("A conversation is required.");
      const messages = body.messages.slice(-20).map(message => {
        if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || !message.content.trim()) throw new Error("Conversation messages are invalid.");
        return { role: message.role, content: message.content.trim().slice(0, 6000) };
      });
      let groqResponse;
      try {
        groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-20b", temperature: 0.5, max_tokens: 700, messages: [{ role: "system", content: interviewAssistantSystemPrompt }, ...messages] }),
        });
      } catch (error) {
        console.error("Groq interview request failed:", error.message);
        return json(response, 502, { error: `Groq request failed: ${error.message}` });
      }
      const result = await groqResponse.json().catch(() => ({}));
      if (!groqResponse.ok) return json(response, 502, { error: result.error?.message || `Groq request failed with HTTP ${groqResponse.status}.` });
      const answer = result.choices?.[0]?.message?.content?.trim();
      if (!answer) throw new Error("Groq returned an empty answer. Please try again.");
      return json(response, 200, { answer });
    }
    if (request.url === "/api/placement/career") {
      if (!process.env.GROQ_API_KEY) return json(response, 503, { error: "Career Path Recommender is not configured. Add GROQ_API_KEY=... to the server .env file and restart the API." });
      if (!Array.isArray(body.messages) || !body.messages.length) throw new Error("A career conversation is required.");
      const messages = body.messages.slice(-20).map(message => {
        if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || !message.content.trim()) throw new Error("Career conversation messages are invalid.");
        return { role: message.role, content: message.content.trim().slice(0, 6000) };
      });
      const context = body.studentContext && typeof body.studentContext === "object" ? JSON.stringify({ branch: body.studentContext.branch || "", year: body.studentContext.year || "", skills: body.studentContext.skills || "", interests: body.studentContext.interests || "", goals: body.studentContext.goals || "" }) : "{}";
      let groqResponse;
      try {
        groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-20b", temperature: 0.6, max_tokens: 800, messages: [{ role: "system", content: `${careerAssistantSystemPrompt}\nStudent context (use only when provided): ${context}` }, ...messages] }),
        });
      } catch (error) {
        console.error("Groq career request failed:", error.message);
        return json(response, 502, { error: `Groq request failed: ${error.message}` });
      }
      const result = await groqResponse.json().catch(() => ({}));
      if (!groqResponse.ok) return json(response, 502, { error: result.error?.message || `Groq request failed with HTTP ${groqResponse.status}.` });
      const answer = result.choices?.[0]?.message?.content?.trim();
      if (!answer) throw new Error("Groq returned an empty career answer. Please try again.");
      return json(response, 200, { answer });
    }
    if (request.url === "/api/attendance/session") {
      requireTeacherRole(body);
      if (!body.sessionId) throw new Error("Session ID is required.");
      const session = { id: body.sessionId, subject: body.subject || "Data Structures", section: body.section || "CSE-A", room: body.room || "204", createdAt: Date.now(), closed: false, attendance: new Set() };
      sessions.set(session.id, session);
      return json(response, 200, { sessionId: session.id, token: issueToken(session), expiresIn: tokenLifetimeSeconds });
    }
    if (request.url === "/api/attendance/token") {
      requireTeacherRole(body);
      const session = sessions.get(body.sessionId);
      if (!session || session.closed) throw new Error("Attendance session is closed or unknown.");
      return json(response, 200, { token: issueToken(session), expiresIn: tokenLifetimeSeconds });
    }
    if (request.url === "/api/attendance/mark") {
      const { payload, session } = verifyToken(body.token);
      if (!body.studentId) throw new Error("Student identity is required.");
      if (session.attendance.has(body.studentId)) return json(response, 409, { error: "Attendance already marked for this session." });
      session.attendance.add(body.studentId);
      return json(response, 200, { ok: true, sessionId: payload.sessionId, subject: payload.subject, section: payload.section, room: payload.room, markedAt: new Date().toISOString() });
    }
    return json(response, 404, { error: "Not found." });
  } catch (error) {
    return json(response, 400, { error: error.message || "Attendance request failed." });
  }
});

server.listen(port, () => console.log(`Campus Plus attendance API listening on http://localhost:${port}`));
