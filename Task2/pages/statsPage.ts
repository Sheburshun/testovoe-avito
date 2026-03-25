import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../pages/basePage";

export class StatsPage extends BasePage {
    protected pageName = "Страница статистики";

    readonly timerContainer: Locator; //контейнер с таймером автообновления
    readonly refreshButton: Locator; //кнопка ручного обновления статистики
    readonly autoRefreshToggleButton: Locator; //кнопка включения и отключения автообновления
    readonly autoRefreshDisabledText: Locator; //текст о том что автообновление выключено
    readonly timerValue: Locator; //текстовое значение таймера

    constructor(page: Page) {
        super(page);

        this.timerContainer = page.locator('div[class*="_timer_"]'); //ищет блок таймера по части класса
        this.refreshButton = page.getByRole("button", { name: "Обновить сейчас" }); //ищет кнопку обновления по роли и названию
        this.autoRefreshToggleButton = page.locator('button[class*="_toggleButton_"]'); //ищет кнопку переключения автообновления
        this.autoRefreshDisabledText = page.getByText(/Автообновление выключено/i); //ищет текст выключенного автообновления

        this.timerValue = page.locator('div[class*="_timer_"]').getByText(/^\d{1,2}:\d{2}$/); //ищет значение таймера в формате мм:сс
    }

    protected root(): Locator {
        return this.timerContainer; //возвращает корневой элемент страницы для проверки открытия
    }

    //методы навигации и ожидания обновления интерфейса

    async openStatsPage() {
        await this.page.locator('a[href="/stats"]').click(); //нажимает на ссылку перехода на страницу статистики
        await this.waitForOpen(); //ждет пока страница откроется
        await this.waitForUiUpdate(); //ждет небольшое обновление интерфейса после открытия
    }

    async waitTenSeconds() {
        await this.page.waitForTimeout(10000); //ждет 10 секунд для тестов таймера
    }

    //методы действий пользователя на странице

    async clickRefreshButton() {
        await this.refreshButton.click(); //нажимает кнопку ручного обновления
        await this.waitForUiUpdate(); //ждет обновление интерфейса после клика
    }

    async clickAutoRefreshToggleButton() {
        await this.autoRefreshToggleButton.click(); //нажимает кнопку переключения автообновления
        await this.waitForUiUpdate(); //ждет обновление интерфейса после переключения
    }

    //хелперы для получения и обработки значений

    async getAutoRefreshAriaLabel(): Promise<string> {
        const ariaLabel = await this.autoRefreshToggleButton.getAttribute("aria-label"); //читает aria-label кнопки переключения

        if (ariaLabel === null) {
            throw new Error("getAutoRefreshAriaLabel: у кнопки отсутствует aria-label"); //падает если у кнопки нет aria-label
        }

        return ariaLabel; //возвращает текущее описание действия кнопки
    }

    async getTimerValueText(): Promise<string> {
        const timerText = await this.timerValue.textContent(); //читает текст таймера

        if (timerText === null) {
            throw new Error("getTimerValueText: значение таймера отсутствует"); //падает если текст таймера не найден
        }

        return timerText.trim(); //возвращает текст таймера без лишних пробелов
    }

    parseTimerToSeconds(value: string): number {
        const [minutes, seconds] = value.split(":").map(Number); //разбивает таймер на минуты и секунды

        if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
            throw new Error(`parseTimerToSeconds: не удалось распарсить таймер "${value}"`); //падает если формат таймера некорректный
        }

        return minutes * 60 + seconds; //переводит время из мм:сс в секунды
    }

    async getTimerValueInSeconds(): Promise<number> {
        const timerText = await this.getTimerValueText(); //берет текущее текстовое значение таймера
        return this.parseTimerToSeconds(timerText); //переводит значение таймера в секунды
    }

    //хелперы для проверки изменения таймера

    async waitForTimerValueToDecrease() {
        const before = await this.getTimerValueInSeconds(); //сохраняет значение таймера до ожидания
        await this.waitTenSeconds; //ждет чтобы таймер успел уменьшиться
        const after = await this.getTimerValueInSeconds(); //сохраняет значение таймера после ожидания

        expect(after, `Таймер не уменьшился: было ${before}, стало ${after}`).toBeLessThan(before); //проверяет что таймер пошел вниз
    }

    async assertTimerValueResetUpFrom(before: number) {
        await this.waitForUiUpdate; //ждет обновление после действия
        const after = await this.getTimerValueInSeconds(); //берет новое значение таймера

        expect(after, `Таймер не сбросился вверх: было ${before}, стало ${after}`).toBeGreaterThan(before); //проверяет что таймер сбросился на большее значение
    }

    //ассерты видимости и доступности элементов

    async assertTimerContainerIsVisible() {
        await expect(this.timerContainer).toBeVisible(); //проверяет что контейнер таймера отображается
    }

    async assertTimerValueIsVisible() {
        await expect(this.timerValue).toBeVisible(); //проверяет что значение таймера видно
    }

    async assertTimerValueIsHidden() {
        await expect(this.timerValue).not.toBeVisible(); //проверяет что значение таймера скрыто
    }

    async assertRefreshButtonIsVisible() {
        await expect(this.refreshButton).toBeVisible(); //проверяет что кнопка обновления отображается
    }

    async assertRefreshButtonIsEnabled() {
        await expect(this.refreshButton).toBeEnabled(); //проверяет что кнопка обновления доступна для нажатия
    }

    //ассерты состояния автообновления

    async assertAutoRefreshCanBeStopped() {
        const ariaLabel = await this.getAutoRefreshAriaLabel(); //получает текущее описание кнопки автообновления
        expect(ariaLabel).toMatch(/Отключить автообновление/i); //проверяет что автообновление включено и его можно выключить
    }

    async assertAutoRefreshCanBeStarted() {
        const ariaLabel = await this.getAutoRefreshAriaLabel(); //получает текущее описание кнопки автообновления
        expect(ariaLabel).toMatch(/Включить автообновление/i); //проверяет что автообновление выключено и его можно включить
    }

    async assertAutoRefreshDisabledTextIsVisible() {
        await expect(this.autoRefreshDisabledText).toBeVisible(); //проверяет что текст о выключенном автообновлении отображается
    }

    async assertAutoRefreshDisabledTextIsHidden() {
        await expect(this.autoRefreshDisabledText).toBeHidden(); //проверяет что текст о выключенном автообновлении скрыт
    }
}