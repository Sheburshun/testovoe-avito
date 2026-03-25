import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../pages/basePage";
import { parsePrices } from "../utils/priceParseHelper";

export class ListPage extends BasePage {
    protected pageName = "Объявления";

    readonly cardsContainer: Locator; //контейнер со всеми карточками объявлений
    readonly advertisementCard: Locator; //отдельная карточка объявления
    readonly adCardPrice: Locator; //цена внутри карточки
    readonly adCardCategory: Locator; //категория внутри карточки
    readonly adCardUrgentBadge: Locator; //бейдж срочного объявления

    readonly minPriceInput: Locator; //поле минимальной цены
    readonly maxPriceInput: Locator; //поле максимальной цены
    readonly categorySelect: Locator; //селект выбора категории
    readonly urgentToggle: Locator; //чекбокс фильтра срочных объявлений
    readonly sortBySelect: Locator; //селект сортировки по полю
    readonly sortOrderSelect: Locator; //селект направления сортировки
    readonly resetFiltersButton: Locator; //кнопка сброса фильтров
    readonly urgentToggleLabel: Locator; //лейбл тоггла срочных объявлений
    readonly urgentToggleInput: Locator; //инпут тоггла срочных объявлений

    constructor(page: Page) {
        super(page);

        this.cardsContainer = page.locator('main div[class*="_cards_"]');
        this.advertisementCard = page.locator('main div[class*="_cards_"] > div[class*="_card_"]');
        this.adCardPrice = this.advertisementCard.locator('div[class*="_card__price_"]');
        this.adCardCategory = this.advertisementCard.locator('div[class*="_card__category_"]');
        this.adCardUrgentBadge = this.advertisementCard.locator('span[class*="_card__priority_"]');

        this.minPriceInput = page.getByPlaceholder("От");
        this.maxPriceInput = page.getByPlaceholder("До");
        this.categorySelect = page.locator("aside select").nth(0);
        this.urgentToggle = page.locator('label[class*="_urgentToggle_"] input[type="checkbox"]');
        this.sortBySelect = page.locator('div[class*="_filtersBar__sort_"] select').nth(0);
        this.sortOrderSelect = page.locator('div[class*="_filtersBar__sort_"] select').nth(1);
        this.resetFiltersButton = page.getByTitle("Сбросить все фильтры");

        this.urgentToggleLabel = page.locator('label[class*="_urgentToggle_"]');
        this.urgentToggleInput = page.locator('label[class*="_urgentToggle_"] input[type="checkbox"]'); 
    }

    protected root(): Locator {
        return this.cardsContainer; //возвращает корневой элемент страницы для проверки открытия
    }

    //методы навигации и открытия страницы

    async openListPage() {
        await this.step("Открыть страницу объявлений", async () => {
            await this.page.goto("/"); //открывает страницу объявлений по базовому урлу
            await this.waitForOpen(); //ждет пока страница откроется
            await this.waitForUiUpdate(); //ждет обновление интерфейса после открытия
        });
    }

    //методы действий пользователя с фильтрами и сортировкой

    async fillMinPrice(minValue: string) {
        await this.step(`Ввести минимальную цену: ${minValue}`, async () => {
            await this.minPriceInput.fill(minValue); //вводит значение в поле минимальной цены
            await this.waitForUiUpdate();
        });
    }

    async fillMaxPrice(maxValue: string) {
        await this.step(`Ввести максимальную цену: ${maxValue}`, async () => {
            await this.maxPriceInput.fill(maxValue); //вводит значение в поле максимальной цены
            await this.waitForUiUpdate(); 
        });
    }

    async fillPriceRange(minValue: string, maxValue: string) {
        await this.step(`Установить диапазон цен: от ${minValue} до ${maxValue}`, async () => {
            await this.minPriceInput.fill(minValue); //вводит нижнюю границу цены
            await this.maxPriceInput.fill(maxValue); //вводит верхнюю границу цены
            await this.waitForUiUpdate();
        });
    }

    async selectCategoryByLabel(label: string) {
        await this.step(`Выбрать категорию: ${label}`, async () => {
            await this.categorySelect.selectOption({ label }); //выбирает категорию по тексту опции
            await this.waitForUiUpdate();
        });
    }

    async applyPriceSortAsc() {
        await this.step("Применить сортировку по цене по возрастанию", async () => {
            await this.sortBySelect.selectOption("price"); //выбирает сортировку по цене
            await this.sortOrderSelect.selectOption("asc"); //выбирает направление по возрастанию
            await this.waitForUiUpdate();
        });
    }

    async applyPriceSortDesc() {
        await this.step("Применить сортировку по цене по убыванию", async () => {
            await this.sortBySelect.selectOption("price"); //выбирает сортировку по цене
            await this.sortOrderSelect.selectOption("desc"); //выбирает направление по убыванию
            await this.waitForUiUpdate();
        });
    }

    async enableUrgentOnly() {
        await this.step('Включить фильтр "Только срочные"', async () => {
            if (!(await this.urgentToggleInput.isChecked())) { //проверяет что фильтр еще не включен
                await this.urgentToggleLabel.click(); //включает фильтр срочных объявлений
                await this.waitForUiUpdate();
            }
        });
    }

    async disableUrgentOnly() {
        await this.step('Выключить фильтр "Только срочные"', async () => {
            if (await this.urgentToggleInput.isChecked()) { //проверяет что фильтр сейчас включен
                await this.urgentToggleLabel.click(); //выключает фильтр срочных объявлений
                await this.waitForUiUpdate();
            }
        });
    }

    async clickResetFiltersButton() {
        await this.step("Сбросить все фильтры", async () => {
            await this.resetFiltersButton.click(); //нажимает кнопку сброса фильтров
            await this.waitForUiUpdate();
        });
    }

    //ассерты корректности выдачи и фильтрации

    async assertCardsAreDisplayed() {
        await this.step("Проверить, что карточки отображаются", async () => {
            const cardsCount = await this.countAdvertisementCards(); //считает количество карточек
            expect(cardsCount, "После фильтрации не найдено ни одной карточки").toBeGreaterThan(0); //проверяет что выдача не пустая
        });
    }

    async assertAllAdPricesAreWithinRange(minPrice: number, maxPrice: number) {
        await this.step(`Проверить, что все цены находятся в диапазоне от ${minPrice} до ${maxPrice}`, async () => {
            const prices = await this.getAdPrices(); //получает все цены карточек
            expect(prices.length).toBeGreaterThan(0); //проверяет что цены вообще есть

            for (const price of prices) {
                expect(price, `Цена карточки ${price} меньше ${minPrice}`).toBeGreaterThanOrEqual(minPrice); //проверяет нижнюю границу диапазона
                expect(price, `Цена карточки ${price} больше ${maxPrice}`).toBeLessThanOrEqual(maxPrice); //проверяет верхнюю границу диапазона
            }
        });
    }

    async assertAllAdPricesAreGreaterThanOrEqual(minPrice: number) {
        await this.step(`Проверить, что все цены не меньше ${minPrice}`, async () => {
            const prices = await this.getAdPrices(); //получает все цены карточек
            expect(prices.length).toBeGreaterThan(0); //проверяет что цены присутствуют

            for (const price of prices) {
                expect(price, `Цена карточки ${price} меньше ${minPrice}`).toBeGreaterThanOrEqual(minPrice); //проверяет минимальную границу
            }
        });
    }

    async assertAllAdPricesAreLessThanOrEqual(maxPrice: number) {
        await this.step(`Проверить, что все цены не больше ${maxPrice}`, async () => {
            const prices = await this.getAdPrices(); //получает все цены карточек
            expect(prices.length).toBeGreaterThan(0); //проверяет что цены присутствуют

            for (const price of prices) {
                expect(price, `Цена карточки ${price} больше ${maxPrice}`).toBeLessThanOrEqual(maxPrice); //проверяет максимальную границу
            }
        });
    }

    async assertPricesSortedAsc() {
        await this.step("Проверить сортировку цен по возрастанию", async () => {
            const actualPrices = await this.getFirstTenAdPrices(); //получает цены первых карточек из выдачи
            expect(actualPrices.length).toBeGreaterThan(1); //проверяет что карточек достаточно для сравнения

            const expectedPrices = [...actualPrices].sort((a, b) => a - b); //строит ожидаемый порядок по возрастанию 
            expect(actualPrices, "Карточки не отсортированы по цене по возрастанию").toEqual(expectedPrices); //сравнивает фактический и ожидаемый порядок
        });
    }

    async assertPricesSortedDesc() {
        await this.step("Проверить сортировку цен по убыванию", async () => {
            const actualPrices = await this.getFirstTenAdPrices(); //получает цены первых карточек из выдачи
            expect(actualPrices.length).toBeGreaterThan(1); //проверяет что карточек достаточно для сравнения

            const expectedPrices = [...actualPrices].sort((a, b) => b - a); //строит ожидаемый порядок по убыванию
            expect(actualPrices, "Карточки не отсортированы по цене по убыванию").toEqual(expectedPrices); //сравнивает фактический и ожидаемый порядок
        });
    }

    async assertAllAdsHaveSelectedCategory(expectedCategory: string) {
        await this.step(
            `Проверить, что все карточки относятся к категории "${expectedCategory}"`,
            async () => {
                const categories = await this.getAdCategories(); //получает категории всех карточек

                expect(categories.length).toBeGreaterThan(0); //проверяет что категории найдены

                const invalidCategories = categories.filter(
                    cat => !cat.includes(expectedCategory) //оставляет карточки с неподходящей категорией
                );

                expect(
                    invalidCategories,
                    `Найдены карточки с неверными категориями: ${invalidCategories.join(", ")}`
                ).toEqual([]); //проверяет что все карточки соответствуют выбранной категории
            });
    }

    async assertUrgentToggleIsEnabled() {
        await this.step('Проверить, что фильтр "Только срочные" включен', async () => {
            await expect(this.urgentToggleInput).toBeChecked(); //проверяет что чекбокс срочности включен
        });
    }

    async assertUrgentToggleIsDisabled() {
        await this.step('Проверить, что фильтр "Только срочные" выключен', async () => {
            await expect(this.urgentToggleInput).not.toBeChecked(); //проверяет что чекбокс срочности выключен
        });
    }

    async assertNotOnlyUrgentAdsAreDisplayed() {
        await this.step('Проверить, что после снятия фильтра отображаются не только срочные объявления', async () => {
            const cardsCount = await this.advertisementCard.count(); //считает количество карточек в выдаче

            expect(cardsCount).toBeGreaterThan(0); //проверяет что карточки есть

            let foundCardWithoutUrgentBadge = false; //флаг что найдена карточка без бейджа срочности

            for (let i = 0; i < cardsCount; i++) {
                const card = this.advertisementCard.nth(i); //берет карточку по индексу
                const urgentBadgeCount = await card.locator('span[class*="_card__priority_"]').count(); //считает бейджи срочности внутри карточки

                if (urgentBadgeCount === 0) {
                    foundCardWithoutUrgentBadge = true; //фиксирует что найдена обычная карточка
                    break;
                }
            }

            expect.soft(
                foundCardWithoutUrgentBadge,
                'После снятия фильтра отображаются только срочные объявления'
            ).toBeTruthy(); //проверяет что после снятия фильтра есть хотя бы одна несрочная карточка
        });
    }

    async assertOnlyUrgentAdsAreDisplayed() {
        await this.step('Проверить, что у каждой карточки есть бейдж "Срочно"', async () => {
            const cardsCount = await this.advertisementCard.count(); //считает количество карточек в выдаче

            expect(cardsCount, "После включения фильтра не найдено ни одной карточки").toBeGreaterThan(0); //проверяет что после фильтра выдача не пустая

            for (let i = 0; i < cardsCount; i++) {
                const card = this.advertisementCard.nth(i); //берет карточку по индексу
                await expect.soft(
                    card.locator('span[class*="_card__priority_"]'),
                    `Карточка с индексом ${i} отображается без бейджа "Срочно"`
                ).toBeVisible(); //проверяет что у каждой карточки есть бейдж срочности
            }
        });
    }

    async assertFiltersAndSortAreReset() {
        await this.step("Проверить, что все фильтры и сортировка сброшены", async () => {
            await expect(this.minPriceInput).toHaveValue(""); //проверяет что минимальная цена очищена
            await expect(this.maxPriceInput).toHaveValue(""); //проверяет что максимальная цена очищена
            await expect(this.categorySelect).toHaveValue(""); //проверяет что категория сброшена
            await expect(this.urgentToggleInput).not.toBeChecked(); //проверяет что фильтр срочности выключен
            await expect(this.sortBySelect).toHaveValue(""); //проверяет что поле сортировки сброшено
            await expect(this.sortOrderSelect).toHaveValue(""); //проверяет что направление сортировки сброшено
        });
    }

    async assertMinPriceValueIsNot(unexpectedValue: string) {
        await this.step(`Проверить, что поле минимальной цены не содержит значение ${unexpectedValue}`, async () => {
            await expect(this.minPriceInput).not.toHaveValue(unexpectedValue); //проверяет что в поле нет нежелательного значения
        });
    }

    async assertMaxPriceValueIsNot(unexpectedValue: string) {
        await this.step(`Проверить, что поле максимальной цены не содержит значение ${unexpectedValue}`, async () => {
            await expect(this.maxPriceInput).not.toHaveValue(unexpectedValue); //проверяет что в поле нет нежелательного значения
        });
    }

    //хелперы для ожиданий и получения данных со страницы

    async countAdvertisementCards(): Promise<number> {
        return await this.advertisementCard.count(); //возвращает количество карточек объявлений
    }

    async getAdPrices(): Promise<number[]> {
        const priceTexts = await this.adCardPrice.allInnerTexts(); //собирает тексты всех цен
        return parsePrices(priceTexts); //преобразует тексты цен в числа
    }

    async getFirstTenAdPrices(): Promise<number[]> {
        const priceTexts = await this.adCardPrice.allInnerTexts(); //собирает тексты всех цен
        return parsePrices(priceTexts.slice(0, 10)); //берет первые десять цен и преобразует их в числа
    }

    async getAdCategories(): Promise<string[]> {
        const categoryTexts = await this.adCardCategory.allInnerTexts(); //собирает тексты всех категорий
        return categoryTexts.map((text) => text.trim()); //убирает лишние пробелы у названий категорий
    }

    async countUrgentBadges(): Promise<number> {
        return await this.adCardUrgentBadge.count(); //возвращает количество бейджей срочности
    }
}