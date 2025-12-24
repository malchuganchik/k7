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

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    const img = document.getElementById('product-img');
    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const seasonEl = document.getElementById('product-season');
    const farmerEl = document.getElementById('product-farmer');
    const storageEl = document.getElementById('product-storage');
    const shelfLifeEl = document.getElementById('product-shelf-life');
    const cookingEl = document.getElementById('product-cooking');

    const modal = document.getElementById('farmer-modal');
    const modalClose = document.getElementById('close-modal');
    const modalOpen = document.getElementById('open-farmer-modal');
    const modalName = document.getElementById('farmer-modal-name');
    const modalInfo = document.getElementById('farmer-modal-info');

    const addToCartBtn = document.getElementById('add-to-cart');

    fetch('./data/products.json')
    .then(res => res.json())
    .then(products => {
        // если id не передан в URL, берём первый товар как дефолт
        if (!productId && products.length > 0) {
            productId = products[0].id;
        }

        const product = products.find(p => p.id == productId);
        if(!product) {
            document.body.innerHTML = '<h2>Товар не найден</h2>';
            return;
        }

        // Заполняем данные товара
    img.src = "../" + product.image;
        nameEl.textContent = product.name;
        priceEl.textContent = product.price + '₽';
        seasonEl.textContent = isProductInSeason(product) ? 'Да' : 'Нет';
        farmerEl.textContent = product.farmer;
        storageEl.textContent = product.storage;
        shelfLifeEl.textContent = product.shelf_life || '7 дней';
        cookingEl.textContent = product.cooking;

        // Модалка фермера
        modalOpen.addEventListener('click', () => {
            showFarmerDetails(product.farmer);
        });

        // ====== Добавление в корзину ======
        addToCartBtn.addEventListener('click', () => {
            let cart = [];
            try {
                cart = JSON.parse(localStorage.getItem('cart')) || [];
            } catch { cart = []; }

            const existing = cart.find(item => item.id == product.id);
            if(existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: "../" + product.image,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Товар добавлен в корзину!');
        });
    });
});

// Функция для показа подробностей фермера
function showFarmerDetails(farmerName) {
    fetch('../data/farmers.json')
        .then(res => res.json())
        .then(farmers => {
            const farmer = farmers.find(f => f.name === farmerName);
            if (farmer) {
                // Создаем модальное окно
                const modal = document.createElement('div');
                modal.className = 'details-modal';
                modal.innerHTML = `
                    <div class="details-modal__overlay"></div>
                    <div class="details-modal__content">
                        <button class="details-modal__close">&times;</button>
                        <h2>Подробная информация</h2>
                        <div class="details-modal__body">
                            <div class="details-modal__header">
                                <div class="details-modal__photo">
                                    <img src="../${farmer.image}" alt="${farmer.name}">
                                </div>
                                <div class="details-modal__info">
                                    <h3>${farmer.name}</h3>
                                    <p><strong>Опыт:</strong> ${farmer.experience}</p>
                                    <p><strong>Регион:</strong> ${farmer.location}</p>
                                    <p><strong>Телефон:</strong> ${farmer.phone}</p>
                                    <p><strong>Email:</strong> ${farmer.email}</p>
                                </div>
                            </div>
                            <div class="details-modal__description">
                                <h4>О фермере</h4>
                                <p>${farmer.detailed_description}</p>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                // Показываем модальное окно
                setTimeout(() => modal.classList.add('active'), 10);

                // Закрытие модального окна
                const closeBtn = modal.querySelector('.details-modal__close');
                const overlay = modal.querySelector('.details-modal__overlay');

                const closeModal = () => {
                    modal.classList.remove('active');
                    setTimeout(() => modal.remove(), 300);
                };

                closeBtn.addEventListener('click', closeModal);
                overlay.addEventListener('click', closeModal);

                // Закрытие по клавише Escape
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        closeModal();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.addEventListener('keydown', handleEscape);
            }
        })
        .catch(err => console.error("Ошибка загрузки данных фермера:", err));
}
