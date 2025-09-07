import { config } from 'dotenv';
config();

import '@/ai/flows/deep-search.ts';
import '@/ai/flows/quick-response.ts';
import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/generate-table.ts';
import '@/ai/flows/code-generation.ts';
import '@/ai/flows/anonymous-chat.ts';
