import { test } from "@playwright/test";
import { ListPage } from "../../pages/listPage";
import { StatsPage } from "../../pages/statsPage";

test.describe("Мобильная версия — переключение темы", () => {
    test("E2E-MOBILE-THEME-001: переключение светлой темы на тёмную на странице объявлений работает корректно", async ({ page }) => {
        const listPage = new ListPage(page);

        await listPage.openListPage();
        await listPage.assertLightThemeEnabled();

        await listPage.clickThemeToggleButton();

        await listPage.assertDarkThemeEnabled();
    });

    test("E2E-MOBILE-THEME-002: переключение тёмной темы на светлую на странице объявлений работает корректно", async ({ page }) => {
        const listPage = new ListPage(page);

        await listPage.openListPage();
        await listPage.assertLightThemeEnabled();
        await listPage.clickThemeToggleButton();
        await listPage.assertDarkThemeEnabled();

        await listPage.clickThemeToggleButton();

        await listPage.assertLightThemeEnabled();
    });

    test("E2E-MOBILE-THEME-003: переключение светлой темы на тёмную на странице статистики работает корректно", async ({ page }) => {
        const listPage = new ListPage(page);
        const statsPage = new StatsPage(page);

        await listPage.openListPage();
        await statsPage.openStatsPage();
        await statsPage.assertLightThemeEnabled();

        await statsPage.clickThemeToggleButton();

        await statsPage.assertDarkThemeEnabled();
    });

    test("E2E-MOBILE-THEME-004: переключение тёмной темы на светлую на странице статистики работает корректно", async ({ page }) => {
        const listPage = new ListPage(page);
        const statsPage = new StatsPage(page);

        await listPage.openListPage();
        await statsPage.openStatsPage();
        await statsPage.assertLightThemeEnabled();
        await statsPage.clickThemeToggleButton();
        await statsPage.assertDarkThemeEnabled();

        await statsPage.clickThemeToggleButton();

        await statsPage.assertLightThemeEnabled();
    });
});