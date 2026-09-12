import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import { authRouter } from "./routes/auth.js";
import { employeesRouter } from "./routes/employees.js";
import { attendanceRouter } from "./routes/attendance.js";
import { exportRouter } from "./routes/export.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/export", exportRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Clock-in API running on http://localhost:${PORT}`);
});
