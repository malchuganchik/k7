// Функция для определения текущего сезона
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    if (month === 12 || month === 1 || month === 2) return "Зима";
    if (month >= 3 && month <= 5) return "Весна";
    if (month >= 6 && month <= 8) return "Лето";
    return "Осень";
}

// Функция для проверки, в сезоне ли продукт
function isProductInSeason(product) {
    if (!product.season || !Array.isArray(product.season)) return false;
    const currentSeason = getCurrentSeason();
    return product.season.includes(currentSeason);
}

document.addEventListener("DOMContentLoaded", () => {
    // Загрузка популярных товаров
    (async () => {
        try {
            const response = await fetch("../data/products.json");
            const products = await response.json();

            const container = document.querySelector(".products__grid");

            const popularNames = [
                "Молоко",
                "Картофель",
                "Яйца 10 шт.",
                "Куриное мясо",
                "Говядина",
                "Огурцы",
                "Помидоры",
                "Капуста", 
            ];

            const popularProducts = products.filter(product => popularNames.includes(product.name));

            popularProducts.forEach((product, index) => {
                const card = document.createElement("div");
                card.classList.add("product-card", "animate-on-scroll");
                // Stagger animations for first few items
                if (index < 6) card.style.transitionDelay = `${index * 0.1}s`;
                const inSeason = isProductInSeason(product);
                const seasonClass = inSeason 
                    ? "product-card__season" 
                    : "product-card__season product-card__season--placeholder";
                const imageSrc = "../" + product.image;

                card.innerHTML = `
                    <div class="product-card__media">
                        <img src="${imageSrc}" alt="${product.name}">
                        <div class="product-card__badges">
                            ${inSeason ? `<span class="product-card__badge badge-season">В сезоне</span>` : ``}
                        </div>
                    </div>
                    
                    <div class="product-card__content">
                        <div class="product-card__info">
                            <h3 class="product-card__name">${product.name}</h3>
                            <div class="product-card__farmer">
                                <i class="fas fa-tractor"></i>
                                <span>${product.farmer}</span>
                            </div>
                        </div>
                        
                        <div class="product-card__bottom">
                            <div class="product-card__price">${product.price} ₽</div>
                            <button class="product-card__add-btn btn-add" data-id="${product.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <a href="product.html?id=${product.id}" class="product-card__link-overlay"></a>
                    </div>
                `;

                container.appendChild(card);
                // Добавляем обработчик кнопки добавления для популярных карточек
                const btnAdd = card.querySelector('.btn-add');
                if (btnAdd) {
                    btnAdd.addEventListener('click', (ev) => {
                        ev.stopPropagation();

                        // Простая логика корзины (локальное хранилище)
                        function getCartLocal() {
                            try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
                        }
                        function saveCartLocal(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

                        const cart = getCartLocal();
                        const existing = cart.find(item => item.id == product.id);
                        if (existing) existing.quantity = (existing.quantity || 1) + 1;
                        else cart.push({ id: product.id, name: product.name, price: product.price, image: '../' + product.image, quantity: 1 });
                        saveCartLocal(cart);

                        // Показываем простой toast
                        (function showToast(text){
                            const toast = document.createElement('div');
                            toast.textContent = text;
                            toast.style.position = 'fixed';
                            toast.style.right = '20px';
                            toast.style.bottom = '20px';
                            toast.style.background = 'rgba(0,0,0,0.8)';
                            toast.style.color = '#fff';
                            toast.style.padding = '10px 14px';
                            toast.style.borderRadius = '8px';
                            toast.style.zIndex = 9999;
                            toast.style.fontSize = '14px';
                            toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
                            document.body.appendChild(toast);
                            setTimeout(() => {
                                toast.style.transition = 'opacity .3s';
                                toast.style.opacity = 0;
                                setTimeout(() => toast.remove(), 300);
                            }, 1200);
                        })(`${product.name} добавлен(а) в корзину`);
                    });
                }
            });

            // Trigger animations for dynamically added elements
            if (window.observeElements) window.observeElements();
        } catch (err) {
            console.error("Ошибка загрузки товаров:", err);
        }
    })();

    // Загрузка фермеров
    fetch("../data/farmers.json")
        .then(res => res.json())
        .then(farmers => {
            const container = document.querySelector(".farmers__grid");

            // Показать первых 3 фермеров
            const featuredFarmers = farmers.slice(0, 3);

            featuredFarmers.forEach(farmer => {
                const card = document.createElement("div");
                card.classList.add("farmer-card", "animate-on-scroll");

                card.innerHTML = `
                    <div class="farmer-card__photo">
                        <img src="../${farmer.image}" alt="${farmer.name}">
                    </div>
                    <div class="farmer-card__content">
                        <h3 class="farmer-card__name">${farmer.name}</h3>
                        <p class="farmer-card__description">${farmer.description}</p>
                        <div class="farmer-card__info">
                            <p class="farmer-card__info-item"><i class="fas fa-clock"></i><strong>Опыт:</strong> ${farmer.experience}</p>
                            <p class="farmer-card__info-item"><i class="fas fa-map-marker-alt"></i><strong>Регион:</strong> ${farmer.location}</p>
                        </div>
                        <a href="farmers.html" class="farmer-card__link">Подробнее о фермере</a>
                    </div>
                `;

                container.appendChild(card);
            });

            // Trigger animations
            if (window.observeElements) window.observeElements();
        })
        .catch(err => console.error("Ошибка загрузки фермеров:", err));
});

