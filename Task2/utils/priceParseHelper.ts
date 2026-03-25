// Хелпер для парсинга цены из текста карточки объявления
export function parsePrice(priceText?: string): number {
    if (!priceText) {
        throw new Error("parsePrice: пустая строка");
    }

    const normalizedText = priceText.trim();

    if (normalizedText === "Бесплатно") {
        return 0;
    }

    // Берём только целую часть до точки или запятой
    const integerPart = normalizedText.split(/[.,]/)[0];

    // Убираем всё, кроме цифр
    const cleaned = integerPart.replace(/[^0-9]/g, "");

    if (cleaned === "") {
        throw new Error(`parsePrice: не удалось распарсить цену из "${priceText}"`);
    }

    const parsedPrice = Number(cleaned);

    if (!Number.isFinite(parsedPrice)) {
        throw new Error(`parsePrice: не удалось распарсить цену из "${priceText}" -> "${cleaned}"`);
    }

    return parsedPrice;
}

// Хелпер для парсинга массива цен
export function parsePrices(priceTexts: string[]): number[] {
    return priceTexts.map((priceText) => parsePrice(priceText));
}