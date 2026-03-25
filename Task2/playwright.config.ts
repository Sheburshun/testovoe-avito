import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "https://cerulean-praline-8e5aa6.netlify.app";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,

    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
    ],

    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        headless: true,
    },

     projects: [
        {
            name: "chromium",
            testDir: "tests/desktop",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1920, height: 1080 },
            },
        },
        {
            name: "mobile-chrome",
            testDir: "tests/mobile",
            use: {
                ...devices["Pixel 7"],
            },
        },
    ],
});