import { defineConfig } from '@playwright/test';
import { loadEnv } from './utils/env';
import fs from 'fs';

loadEnv();

// Current date & time
const now = new Date();

// Format parts
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');

// History path (never override)
const historyDir = `reports/monocart/${year}/${month}/${day}/${time}`;

// Ensure folder exists
fs.mkdirSync(historyDir, { recursive: true });

export default defineConfig({
  testDir: './tests',

  reporter: [
    ['monocart-reporter', {
      name: `BAFCO Automation Report (${year}-${month}-${day} ${time})`,
      outputFile: `${historyDir}/index.html`,
      showSteps: true,
      showHooks: false,       // hide before/after hooks
      showAttachments: true  // show screenshots & videos
      
    }]
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
    browserName: 'chromium',
    viewport: null,   // real window
    launchOptions: {
      args: ['--start-maximized']   // maximize browser
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
