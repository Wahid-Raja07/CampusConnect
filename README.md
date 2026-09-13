# CAMPUS CONNECT 3D

A professional Smart Campus Management & Smart Attendance prototype built for the hackathon problem:

**How Can Technology Simplify Everyday Campus Life for Students and Administrators?**

## Stack
- React + Vite
- JavaScript
- CSS
- Lucide React
- Framer Motion
- QRCode
- html5-qrcode
- Three.js / React Three Fiber dependencies included for future 3D expansion
- localStorage for demo persistence

## Run
1. Open this folder in VS Code.
2. Open Terminal in the project folder.
3. Run:
   npm install
4. Then:
   npm run dev
5. Open the local URL shown by Vite.

## Deployment

The frontend can be deployed as a Vite static site on either Vercel or Render.

- **Vercel:** Import the repository. The included `vercel.json` uses `npm run build` and publishes `dist`.
- **Render:** Create a Static Site from the repository. The included `render.yaml` uses the same build and publish settings.
- **QR URL:** On HTTPS deployments, QR links automatically use the current deployment origin. For a fixed domain, set `VITE_PUBLIC_APP_URL` in the deployment environment variables.

## Demo
Student:
- Select Student
- Start Identity Check
- Allow camera or continue through the demo fallback
- Use Mark Attendance
- For guaranteed local testing, create an admin session and copy its CAMPUS-ATT-* session ID into the demo scanner input.

Admin:
- Select Teacher / Admin
- Create Attendance Session
- QR is generated locally and is downloadable/printable.
- Live Monitoring uses local demo records.
- Issue Reports shows submitted reports.

## Important
This is a college/hackathon prototype. Authentication and data are intentionally local and are not production security. The identity verification is explicitly a demo flow unless a real biometric service is configured.
