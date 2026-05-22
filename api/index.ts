import app from "../src/app.ts";
import { initDB } from "../src/db/index.ts";

// Initialize database tables on cold start
initDB().catch(console.error);

export default app;
