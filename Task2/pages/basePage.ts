import { expect, Locator, Page, test } from "@playwright/test";

export abstract class BasePage {
    protected readonly page: Page;
    protected abstract root(): Locator;
    protected abstract pageName: string;

    readonly themeToggleButton: Locator;
    readonly htmlRoot: Locator;

    constructor(page: Page) {
        this.page = page;

        this.themeToggleButton = page.getByRole("button", {
            name: /Switch to .* theme/i,
        });
        this.htmlRoot = page.locator("html");
    }

    protected async step<T>(title: string, action: () => Promise<T>): Promise<T> {
        return test.step(title, action);
    }

    //методы открытия страницы и переходов

    async waitForOpen() {
        await this.step(`Проверить, что страница "${this.pageName}" открыта`, async () => {
            await expect(
                this.root(),
                `Страница ${this.pageName} не открылась`
            ).toBeVisible();
        });
    }

    async waitForUrl(re: RegExp) {
        await this.step(`Проверить URL страницы "${this.pageName}"`, async () => {
            await expect(this.page).toHaveURL(re);
        });
    }

    async clickAndWaitForUrl(
        clickTarget: Locator,
        re: RegExp,
        stepTitle = "Кликнуть по элементу и дождаться перехода"
    ) {
        await this.step(stepTitle, async () => {
            await Promise.all([
                this.waitForUrl(re),
                clickTarget.click(),
            ]);
        });
    }

    //базовые действия с элементами

    async fill(
        locator: Locator,
        value: string,
        stepTitle = `Заполнить поле значением "${value}"`
    ) {
        await this.step(stepTitle, async () => {
            await locator.fill(value);
        });
    }

    async click(locator: Locator, stepTitle = "Кликнуть по элементу") {
        await this.step(stepTitle, async () => {
            await locator.click();
        });
    }

    //базовые ассерты

    async expectVisible(locator: Locator, stepTitle = "Проверить, что элемент отображается") {
        await this.step(stepTitle, async () => {
            await expect(locator).toBeVisible();
        });
    }

    async expectHidden(locator: Locator, stepTitle = "Проверить, что элемент скрыт") {
        await this.step(stepTitle, async () => {
            await expect(locator).toBeHidden();
        });
    }

    async expectEnabled(locator: Locator, stepTitle = "Проверить, что элемент активен") {
        await this.step(stepTitle, async () => {
            await expect(locator).toBeEnabled();
        });
    }

    async expectDisabled(locator: Locator, stepTitle = "Проверить, что элемент неактивен") {
        await this.step(stepTitle, async () => {
            await expect(locator).toBeDisabled();
        });
    }

    //хелпер ожидания обновления интерфейса

    async waitForUiUpdate() {
        await this.page.waitForTimeout(700);
    }

    //методы переключения темы

    async clickThemeToggleButton() {
        await this.step("Переключить тему", async () => {
            await this.themeToggleButton.click();
            await this.waitForUiUpdate();
        });
    }

    async assertDarkThemeEnabled() {
        await this.step("Проверить, что включена тёмная тема", async () => {
            await expect(this.htmlRoot).toHaveAttribute("data-theme", "dark");
            await expect(this.themeToggleButton).toHaveAttribute(
                "aria-label",
                /Switch to light theme/i
            );
        });
    }

    async assertLightThemeEnabled() {
        await this.step("Проверить, что включена светлая тема", async () => {
            await expect(this.htmlRoot).toHaveAttribute("data-theme", "light");
            await expect(this.themeToggleButton).toHaveAttribute(
                "aria-label",
                /Switch to dark theme/i
            );
        });
    }
}