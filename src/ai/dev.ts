import { config } from 'dotenv';
config();

// The direct imports of flows have been removed from this file.
// They are loaded on-demand by the application, which resolves a
// critical race condition with the database connection during startup.
// This was the root cause of the signup and login failures.
