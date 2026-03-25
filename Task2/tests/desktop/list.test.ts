import { test, expect } from "@playwright/test";
import { ListPage } from "../../pages/listPage";
import {
    MIN_PRICE,
    MAX_PRICE,
    CATEGORY_REAL_ESTATE,
    ALL_CATEGORIES,
} from "../../utils/testdata";

test.describe("Страница объявлений — фильтры и сортировка", () => {
    let listPage: ListPage;

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        await listPage.openListPage();
    });

    test.describe("Цена", () => {
        test("E2E-PRICE-001: фильтрация по диапазону цен работает корректно", async () => {
            await listPage.fillPriceRange(String(MIN_PRICE), String(MAX_PRICE)); //проверка что минимальный прайс работает корректно
            await listPage.applyPriceSortAsc();
            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE);

            await listPage.applyPriceSortDesc();
            await listPage.assertAllAdPricesAreLessThanOrEqual(MAX_PRICE); //проверка что "До" работает корректно
        });

        test("E2E-PRICE-002: фильтрация только по минимальной цене работает корректно", async () => {
            await listPage.fillMinPrice(String(MIN_PRICE));
            await listPage.applyPriceSortAsc();

            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE);
        });

        test("E2E-PRICE-003: фильтрация только по максимальной цене работает корректно", async () => {
            await listPage.fillMaxPrice(String(MAX_PRICE));
            await listPage.applyPriceSortDesc();

            await listPage.assertAllAdPricesAreLessThanOrEqual(MAX_PRICE);
        });

        test("E2E-PRICE-004: фильтр цены совместно с категорией работает корректно", async () => {
            await listPage.selectCategoryByLabel(CATEGORY_REAL_ESTATE);
            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE);
            await listPage.applyPriceSortAsc();

            await listPage.assertCardsAreDisplayed();
            await listPage.assertAllAdsHaveSelectedCategory(CATEGORY_REAL_ESTATE);
            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE);
        });

        test("E2E-PRICE-005: отрицательное значение не должно приниматься в поле 'От'", async () => {
            await listPage.fillMinPrice("-5000");

            await listPage.assertMinPriceValueIsNot("-5000");
        });

        test("E2E-PRICE-006: отрицательное значение не должно приниматься в поле 'До'", async () => {
            await listPage.fillMaxPrice("-1000");

            await listPage.assertMaxPriceValueIsNot("-1000");
        });

        test("E2E-PRICE-007: система не должна принимать невалидный диапазон, где 'От' больше 'До'", async () => {
            await listPage.fillPriceRange(String(MAX_PRICE), String(MIN_PRICE));

            await expect(listPage.minPriceInput).not.toHaveValue(String(MAX_PRICE));
            await expect(listPage.maxPriceInput).not.toHaveValue(String(MIN_PRICE));
        });
    });

    test.describe("Сортировка", () => {
        test("E2E-SORT-004: сортировка по цене по возрастанию работает корректно", async () => {
            await listPage.applyPriceSortAsc();

            await listPage.assertPricesSortedAsc();
        });

        test("E2E-SORT-005: сортировка по цене по убыванию работает корректно", async () => {
            await listPage.applyPriceSortDesc();

            await listPage.assertPricesSortedDesc();
        });

        test("E2E-SORT-006: переключение сортировки с asc на desc работает корректно", async () => {
            await listPage.applyPriceSortAsc();
            await listPage.assertPricesSortedAsc();

            await listPage.applyPriceSortDesc();
            await listPage.assertPricesSortedDesc();
        });

        test("E2E-SORT-014: сортировка по цене корректна после применения категории", async () => {
            await listPage.selectCategoryByLabel(CATEGORY_REAL_ESTATE);
            await listPage.applyPriceSortAsc();

            await listPage.assertCardsAreDisplayed();
            await listPage.assertAllAdsHaveSelectedCategory(CATEGORY_REAL_ESTATE);
            await listPage.assertPricesSortedAsc();
        });
    });

    test.describe("Категория", () => {
        test("E2E-CATEGORY-001: фильтрация по всем категориям работает корректно", async () => {
            for (const category of ALL_CATEGORIES) {
                await listPage.clickResetFiltersButton();
                await listPage.selectCategoryByLabel(category);

                await listPage.assertCardsAreDisplayed();
                await listPage.assertAllAdsHaveSelectedCategory(category);
            }
        });
    });

    test.describe('Фильтр "Только срочные"', () => {
        test('E2E-URGENT-010: при включении фильтра "Только срочные" отображаются только срочные карточки', async () => {
            await listPage.enableUrgentOnly();

            await listPage.assertUrgentToggleIsEnabled();
            await listPage.assertOnlyUrgentAdsAreDisplayed();
        });

        test('E2E-URGENT-011: при выключении фильтра "Только срочные" отображаются не только срочные карточки', async () => {
            // arrange
            await listPage.enableUrgentOnly();

            // act
            await listPage.disableUrgentOnly();

            // assert
            await listPage.assertUrgentToggleIsDisabled();
            await listPage.assertNotOnlyUrgentAdsAreDisplayed();
        });

        test('E2E-URGENT-013: фильтр "Только срочные" корректно работает совместно с диапазоном цен', async () => {
            await listPage.enableUrgentOnly();
            await listPage.fillMinPrice(String(MIN_PRICE));
            await listPage.applyPriceSortAsc();

            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE)

            await listPage.assertUrgentToggleIsEnabled();
            await listPage.assertOnlyUrgentAdsAreDisplayed();
            await listPage.assertAllAdPricesAreGreaterThanOrEqual(MIN_PRICE);
        });
    });

    test.describe("Сброс фильтров", () => {
        test("E2E-RESET-015: кнопка сброса корректно сбрасывает все выбранные фильтры и сортировку", async () => {
            // arrange
            await listPage.fillPriceRange(String(MIN_PRICE), String(MAX_PRICE));
            await listPage.selectCategoryByLabel(CATEGORY_REAL_ESTATE);
            await listPage.enableUrgentOnly();
            await listPage.applyPriceSortDesc();

            // act
            await listPage.clickResetFiltersButton();

            // assert
            await listPage.assertFiltersAndSortAreReset();
        });
    });
});