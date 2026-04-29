import { test, expect } from '@playwright/test';

test.describe('Смоук-тесты сайта Granelle', () => {
  // Перед каждым тестом - переход на главную страницу каталога
  test.beforeEach(async ({ page, context }) => {
    await page.goto('https://granelle.ru');
    await context.grantPermissions(['geolocation']);
  });

  test('1. Проверка навигации из шапки, на главной странице', async ({ page }) => {
    // 1. Поиск ссылки "Ипотека" по тексту.
    const mortgageLink = page.getByRole('link', { name: 'Ипотека' });

    // 2. Клик по ссылке
    await mortgageLink.first().click();

    // 3. Проверка, что URL изменился на нужный
    await expect(page).toHaveURL(/.*mortgage/);

    // 4. Проверка наличия заголовка на новой странице, чтобы убедиться, что контент загрузился
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('2. Соответствие количества карточек проектов на главной 22', async ({ page }) => {
    // 2. Ожидание, пока загрузятся данные с сервера
    await page.waitForLoadState('networkidle');

    // 3. Создание локатора для карточек проектов
    const projectCards = page.locator('.card_ud9Wd');

    // 4. Ожидание, чтобы элементы стали видимыми
    await projectCards.first().waitFor({ state: 'visible' });

    // 5. Проверка, что количество найденных элементов ровно 22
    await expect(projectCards).toHaveCount(22);

    // Вывод в консоль для наглядности
    const count = await projectCards.count();
    console.log(`Найдено карточек: ${count}`);
  });

  test('3. Добавление и удаление из избранного на странице подбора', async ({ page, context }) => {
    // Переход на страницу каталога квартир и отключение геолокации
    await page.goto('https://granelle.ru/flats');
    await context.grantPermissions(['geolocation']);

    // 1. Поиск кнопки избранного внутри первой карточки
    const favoriteButton = page.locator('[class*="buttonWrapper"]').first();

    // 2. Клик по кнопке избранного
    await favoriteButton.click();

    // 3. Поиск счетчика товаров в шапке
    const counter = page.locator('.collection_DBpfG .topNote_XSwBF');

    // 4. Проверка, что значение счетчика равно 1
    await expect(counter).toHaveText('1', { timeout: 15000 });

    // 5. Удаление (второй клик) и проверка, что счетчик равен 0
    await favoriteButton.click();
    await expect(counter).toHaveText('0', { timeout: 15000 });
  });

  test('4. Соответствие количества карточек квартир на подборе 22', async ({ page }) => {
    // 1. Переход на страницу поиска квартир
    await page.goto('https://granelle.ru/flats'); // Открываем целевой URL

    // 2. Ожидание, пока загрузятся данные с сервера
    await page.waitForLoadState('networkidle');

    // 3. Создание локатора для карточек квартир
    const cards = page.locator('.FlatsGridCard_foyqI ');

    // 4. Ожидание, чтобы элементы стали видимыми
    await cards.first().waitFor({ state: 'visible' });

    // 5. Проверка, что количество найденных элементов ровно 22
    await expect(cards).toHaveCount(22);

    // Вывод в консоль для наглядности
    const count = await cards.count();
    console.log(`Найдено карточек: ${count}`);
  });

  test('5. Переход в карточку квартиры и проверка кнопки бронирования', async ({ page }) => {
    // 1. Переход на страницу поиска квартир
    await page.goto('https://granelle.ru/flats');

    // 2. Создание обещания, которое будет ждать открытия новой страницы
    const pagePromise = page.context().waitForEvent('page');

    // 3. Поиск первой карточки и клик по ней
    const firstFlat = page.locator('a[href^="/flats/"]').first();
    await firstFlat.waitFor({ state: 'visible' });
    await firstFlat.click();

    // 4. Ожидание, пока новая вкладка реально откроется, и переключение на неё управления
    const newPage = await pagePromise;

    // 5. Ожидание загрузки новой страницы
    await newPage.waitForLoadState();

    // 6. Проверка, что кнопка "Забронировать" видима
    await expect(newPage.getByRole('button', { name: /Забронировать/i })).toBeVisible({
      timeout: 15000,
    });

    // 7. Проверка, что кнопка "Забронировать" активна
    await expect(newPage.getByRole('button', { name: /Забронировать/i })).toBeEnabled({
      timeout: 15000,
    });

    // 8. Проверка, что новый URL не является страницей общего списка
    await expect(newPage).not.toHaveURL('https://granelle.ru/flats');
  });
});
