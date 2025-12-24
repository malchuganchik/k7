const cards = document.querySelectorAll('.season-card');

function showCardsOnScroll() {
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            card.style.animationPlayState = "running";
        }
    });
}

window.addEventListener("scroll", showCardsOnScroll);
showCardsOnScroll();

// Сезоны (названия) — основа для динамической сборки
const SEASONS = {
    winter: 'Зима',
    spring: 'Весна',
    summer: 'Лето',
    autumn: 'Осень'
};

// seasonData будет построен динамически из data/products.json.
// Формат: { winter: { title, master: [...all possible product names...], products: [...visible after purchase...], chart: [] }, ... }
let seasonData = {};
let productsIndex = {}; // id -> product
let rawProducts = [];

const modal = document.getElementById("seasonModal");
const modalTitle = document.getElementById("modalTitle");
const productList = document.getElementById("productList");

// Найдём контейнер модалки и добавим кнопку сброса покупок
const modalContent = document.querySelector('.season-modal__content');
let resetBtn = null;
if (modalContent) {
    resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn--secondary season-reset-btn';
    resetBtn.textContent = 'Сбросить покупки';
    resetBtn.style.marginTop = '8px';
    resetBtn.addEventListener('click', () => {
        if (!confirm('Вы действительно хотите удалить все сохранённые покупки? Это действие необратимо.')) return;
        purchaseCounts = {};
        savePurchaseCounts();
        // Очистим видимые продукты в seasonData
        Object.keys(seasonData || {}).forEach(k => { seasonData[k].products = []; });
        updateSeasonBadges();
        if (seasonChart) { seasonChart.destroy(); seasonChart = null; }
        // Обновим список в модалке
        productList.innerHTML = '';
        const li = document.createElement('li'); li.textContent = 'Пока нет покупок в этом сезоне.'; productList.appendChild(li);
    });
    // Вставим кнопку в начало модалки под заголовком
    const titleEl = modalContent.querySelector('#modalTitle');
    if (titleEl && titleEl.parentNode) titleEl.parentNode.insertBefore(resetBtn, titleEl.nextSibling);
}

let seasonChart = null;
let currentModalSeason = null;

// Получить ключ сезона по текущей дате (использует месяцы)
function getSeasonKeyFromDate(d = new Date()) {
    const month = d.getMonth() + 1; // 1-12
    if (month === 12 || month === 1 || month === 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'autumn';
}

// Лениво загружает products.json и строит индекс по id
async function ensureProductsIndex() {
    if (Object.keys(productsIndex).length > 0 && rawProducts.length > 0) return;
    try {
        const res = await fetch('./data/products.json');
        rawProducts = await res.json();
        productsIndex = {};
        rawProducts.forEach(p => { productsIndex[p.id] = p; });
    } catch (e) {
        console.error('calendar: не удалось загрузить data/products.json', e);
        rawProducts = [];
        productsIndex = {};
    }
}

    // Построить seasonData.master из rawProducts и восстановить видимые продукты из purchaseCounts
    async function buildSeasonDataFromProducts() {
        await ensureProductsIndex();
        // Инициализация сезонов
        seasonData = {};
        Object.keys(SEASONS).forEach(k => { seasonData[k] = { title: SEASONS[k], master: [], products: [], chart: [] }; });

        rawProducts.forEach(p => {
            if (!Array.isArray(p.season)) return;
            p.season.forEach(se => {
                const normalized = (se||'').toString().toLowerCase();
                const map = { 'зима':'winter','весна':'spring','лето':'summer','осень':'autumn' };
                const key = map[normalized];
                if (!key) return;
                seasonData[key].master.push(p.name);
            });
        });

        Object.keys(seasonData).forEach(k => {
            seasonData[k].master = Array.from(new Set(seasonData[k].master)).sort();
            seasonData[k].products = [];
            seasonData[k].chart = [];
        });

        // Восстановим видимые продукты из purchaseCounts
        Object.keys(purchaseCounts || {}).forEach(season => {
            if (!seasonData[season]) seasonData[season] = { title: SEASONS[season] || season, master: [], products: [], chart: [] };
            Object.keys(purchaseCounts[season] || {}).forEach(prodName => {
                if (!seasonData[season].master.includes(prodName)) seasonData[season].master.push(prodName);
                if (!seasonData[season].products.includes(prodName)) seasonData[season].products.push(prodName);
            });
        });
    }

// Загружаем сохранённые покупки по сезонам из localStorage
const STORAGE_KEY = 'seasonPurchases';
let purchaseCounts = {};

function loadPurchaseCounts() {
    try {
        purchaseCounts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        purchaseCounts = {};
    }
}

function savePurchaseCounts() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseCounts)); } catch (e) {}
}

loadPurchaseCounts();

// Обновляем бейджи на карточках сезонов
function updateSeasonBadges() {
    document.querySelectorAll('.season-card').forEach(card => {
        const season = card.dataset.season;
        const total = Object.values(purchaseCounts[season] || {}).reduce((a,b)=>a+(b||0),0);
        let badge = card.querySelector('.season-card__badge');
        if (!badge && total > 0) {
            badge = document.createElement('span');
            badge.className = 'season-card__badge';
            card.appendChild(badge);
        }
        if (badge) {
            badge.textContent = total > 0 ? `Покупок: ${total}` : '';
            badge.style.display = total > 0 ? 'inline-block' : 'none';
        }
    });
}

updateSeasonBadges();

// Клик по сезону
document.querySelectorAll(".season-card").forEach(card => {
    card.addEventListener("click", async () => {
        const season = card.dataset.season;
        // Защита: если seasonData ещё не построен — попытаемся построить
        if (!seasonData || Object.keys(seasonData).length === 0) {
            try { await buildSeasonDataFromProducts(); } catch (e) { /* игнорируем */ }
        }

        let data = seasonData[season];
        if (!data) {
            // fallback — пустой набор, но модалка всё равно откроется
            data = { title: SEASONS[season] || season, products: [], chart: [] };
        }

        currentModalSeason = season;
        modalTitle.textContent = data.title || '';
        productList.innerHTML = "";

        if (!data.products || data.products.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Пока нет покупок в этом сезоне.';
            productList.appendChild(li);
        } else {
            data.products.forEach(p => {
                const li = document.createElement("li");
                const qty = (purchaseCounts[season] && purchaseCounts[season][p]) || 0;
                li.textContent = `${p} — куплено: ${qty}`;
                productList.appendChild(li);
            });
        }

        modal.style.display = "flex";
        renderChart(data, season);
    });
});

// Закрытие модалки
document.querySelector(".close-modal").onclick = () => {
    modal.style.display = "none";
};

// Клик вне окна
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

// Чарт
function renderChart(data, seasonKey) {
    const canvas = document.getElementById("seasonChart");
    const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

    // Если data не содержит видимых продуктов, попробуем взять данные из purchaseCounts
    let labels = [];
    let values = [];

    if (data && data.products && data.products.length > 0) {
        labels = data.products.slice();
        values = labels.map(l => (purchaseCounts[seasonKey] && purchaseCounts[seasonKey][l]) || 0);
    } else {
        const saved = purchaseCounts[seasonKey] || {};
        labels = Object.keys(saved || {});
        values = labels.map(l => saved[l] || 0);
    }

    if (!ctx) return; // canvas отсутствует

    if (seasonChart) seasonChart.destroy();

    // Если нет меток/значений — очищаем canvas и выходим
    if (!labels || labels.length === 0) {
        try { ctx.clearRect(0,0,canvas.width, canvas.height); } catch (e) {}
        return;
    }

    seasonChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: labels.map((_,i)=>['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#8DD17E','#E76F51'][i%8]) }]
        },
        options: { plugins: { legend: { position: 'right' } } }
    });
}

// Функция для записи покупки — доступна глобально
window.recordPurchase = async function(productIdentifier, qty = 1) {
    if (productIdentifier == null) return;

    // Убедимся, что у нас есть индекс продуктов
    await ensureProductsIndex();

    // Определим имя продукта
    let productName = null;
    if (typeof productIdentifier === 'number' || (!isNaN(productIdentifier) && productsIndex[Number(productIdentifier)])) {
        const id = Number(productIdentifier);
        const prod = productsIndex[id];
        if (prod) productName = prod.name;
    }
    if (!productName) productName = String(productIdentifier);

    // Найдём текущий сезон по дате пользователя
    const seasonKey = getSeasonKeyFromDate(new Date());

    // Проверим, принадлежит ли продукт этому сезону по метаданным (если есть)
    let belongs = false;
    const prodObj = rawProducts.find(p => (p.id == productIdentifier) || (p.name && p.name === productName));
    if (prodObj && Array.isArray(prodObj.season)) {
        const normalized = prodObj.season.map(s => (s||'').toString().toLowerCase());
        const map = { 'зима':'winter','весна':'spring','лето':'summer','осень':'autumn' };
        if (normalized.some(s => map[s] === seasonKey)) belongs = true;
    }

    // Если метаданные отсутствуют или продукт не отмечен для этого сезона — всё равно записываем в текущий сезон
    if (!purchaseCounts[seasonKey]) purchaseCounts[seasonKey] = {};
    purchaseCounts[seasonKey][productName] = (purchaseCounts[seasonKey][productName] || 0) + (qty || 1);

    // Убедимся, что seasonData содержит этот продукт в видимых списках, чтобы модал мог показать его
    if (!seasonData[seasonKey]) seasonData[seasonKey] = { title: SEASONS[seasonKey] || seasonKey, master: [], products: [], chart: [] };
    if (!seasonData[seasonKey].master) seasonData[seasonKey].master = [];
    if (!seasonData[seasonKey].master.includes(productName)) seasonData[seasonKey].master.push(productName);
    if (!seasonData[seasonKey].products) seasonData[seasonKey].products = [];
    if (!seasonData[seasonKey].products.includes(productName)) seasonData[seasonKey].products.push(productName);

    savePurchaseCounts();
    updateSeasonBadges();

    // Если открыт модал этого сезона — обновим список и чарт
    if (currentModalSeason === seasonKey) {
        const data = seasonData[seasonKey];
        productList.innerHTML = '';
        if (!data.products || data.products.length === 0) {
            const li = document.createElement('li'); li.textContent = 'Пока нет покупок в этом сезоне.'; productList.appendChild(li);
        } else {
            data.products.forEach(p => {
                const li = document.createElement('li');
                const q = (purchaseCounts[seasonKey] && purchaseCounts[seasonKey][p]) || 0;
                li.textContent = `${p} — куплено: ${q}`;
                productList.appendChild(li);
            });
        }
        renderChart(data, seasonKey);
    }
};
// Анимация появления при прокрутке
