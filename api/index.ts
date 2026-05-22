import app from "../src/app.js";
import { initDB } from "../src/db/index.js";

// Initialize database tables on cold start
initDB().catch(console.error);

export default app;
