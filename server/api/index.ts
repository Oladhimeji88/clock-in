import app from "../src/app.js";

// All requests under /api/* are rewritten to this single function (see
// vercel.json) and handled by the same Express app used for local dev.
export default app;
