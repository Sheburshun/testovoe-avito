import { test } from "@playwright/test";
import { ListPage } from "../../pages/listPage";
import { StatsPage } from "../../pages/statsPage";

test.describe("Страница статистики — управление таймером", () => {
    let listPage: ListPage;
    let statsPage: StatsPage;

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        statsPage = new StatsPage(page);

        await listPage.openListPage();
        await statsPage.openStatsPage();
    });

    test("E2E-STATS-001: кнопка «Обновить» сбрасывает таймер", async () => {
        // arrange
        await statsPage.assertTimerContainerIsVisible();
        await statsPage.assertTimerValueIsVisible();
        await statsPage.assertRefreshButtonIsVisible();
        await statsPage.assertRefreshButtonIsEnabled();

        await statsPage.waitTenSeconds();
        const timerBeforeRefresh = await statsPage.getTimerValueInSeconds();

        // act
        await statsPage.clickRefreshButton();

        // assert
        await statsPage.assertTimerValueIsVisible();
        await statsPage.assertTimerValueResetUpFrom(timerBeforeRefresh);
    });

    test("E2E-STATS-002: кнопка «Отключить автообновление» останавливает таймер", async () => {
        // arrange
        await statsPage.assertTimerContainerIsVisible();
        await statsPage.assertTimerValueIsVisible();
        await statsPage.assertAutoRefreshCanBeStopped();

        // act
        await statsPage.clickAutoRefreshToggleButton();

        // assert
        await statsPage.assertAutoRefreshCanBeStarted();
        await statsPage.assertAutoRefreshDisabledTextIsVisible();
        await statsPage.assertTimerValueIsHidden();
    });

    test("E2E-STATS-003: кнопка «Включить автообновление» запускает таймер после остановки", async () => {
        // arrange
        await statsPage.clickAutoRefreshToggleButton();
        await statsPage.assertAutoRefreshCanBeStarted();
        await statsPage.assertAutoRefreshDisabledTextIsVisible();
        await statsPage.assertTimerValueIsHidden();

        // act
        await statsPage.clickAutoRefreshToggleButton();

        // assert
        await statsPage.assertAutoRefreshCanBeStopped();
        await statsPage.assertAutoRefreshDisabledTextIsHidden();
        await statsPage.assertTimerValueIsVisible();
        await statsPage.waitForTimerValueToDecrease();
    });
});