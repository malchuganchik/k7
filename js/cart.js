document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('cart-content');
    const cartList = document.querySelector('.cart__list');
    const cartTotalEl = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const orderBtn = document.querySelector('.cart__order-button');

    let products = [];
    let discount = 0; // скидка в процентах

    try {
    const res = await fetch('./data/products.json');
        products = await res.json();
    } catch (e) {
        console.error('Не удалось загрузить товары', e);
    }

    function getCart() {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        const cart = getCart();
        cartList.innerHTML = '';

        if (cart.length === 0) {
            container.style.display = 'none';
            cartEmpty.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        cartEmpty.style.display = 'none';

        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;

            const li = document.createElement('li');
            li.className = 'cart__item';
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart__item-img" />
                <div class="cart__item-info">
                    <h3>${item.name}</h3>
                    <p>Цена: ${item.price} ₽</p>
                    <p>Количество: ${item.quantity}</p>
                </div>
                <button class="cart__item-remove" data-id="${item.id}">×</button>
            `;
            cartList.appendChild(li);

            li.querySelector('.cart__item-remove').addEventListener('click', () => {
                removeFromCart(item.id);
            });
        });

        const discountedTotal = total * (1 - discount / 100);
        cartTotalEl.textContent = discountedTotal.toFixed(0) + ' ₽';
    }

    function removeFromCart(id) {
        const cart = getCart().filter(item => item.id != id);
        saveCart(cart);
        renderCart();
    }

    renderCart();

    // ===== Промокод =====
    const promoButton = document.querySelector('.cart__promo-button');
    const promoInput = document.getElementById('promo-code');

    promoButton.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'PGU') {
            discount = 10;
            alert('Промокод применен! Скидка 10%');
        } else {
            discount = 0;
            alert('Неверный промокод');
        }
        renderCart();
    });

    // ===== Модальное окно =====
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="order-modal__content">
            <h2>Спасибо за заказ!</h2>
            <p>Ваш заказ принят. Мы свяжемся с вами по телефону для подтверждения.</p>
            <p>Адрес доставки: <span id="order-address"></span></p>
            <p>Время доставки: на следующий день с 8:00 до 18:00</p>
            <p>Оплата при получении</p>
            <button class="order-modal__close">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = modal.querySelector('.order-modal__close');
    closeModal.addEventListener('click', () => modal.classList.remove('active'));

    orderBtn.addEventListener('click', () => {
        let phone;
        while (true) {
            phone = prompt('Введите ваш номер телефона (9 цифр, без 0 в начале):');
            if (!phone) {
                alert('Номер телефона обязателен.');
                continue;
            }
            phone = phone.trim();
            if (!/^\d{9}$/.test(phone)) {
                alert('Номер телефона должен состоять ровно из 9 цифр.');
                continue;
            }
            if (phone.startsWith('0')) {
                alert('Номер телефона не должен начинаться с 0.');
                continue;
            }
            break;
        }

        const address = prompt('Введите адрес доставки:');

        if (!address) {
            alert('Адрес доставки обязателен.');
            return;
        }

        modal.querySelector('#order-address').textContent = address;
        modal.classList.add('active');

        // Перед очисткой корзины — зарегистрируем покупки для сезонного календаря
        try {
            const cart = getCart();
            if (window.recordPurchase && Array.isArray(cart)) {
                cart.forEach(item => {
                    try { window.recordPurchase(item.id || item.name, item.quantity || 1); } catch (e) {}
                });
            } else if (Array.isArray(cart) && cart.length > 0) {
                // fallback: обновим прямой ключ localStorage seasonPurchases,
                // но запишем покупки только в текущий сезон (по дате пользователя)
                const STORAGE_KEY = 'seasonPurchases';
                let saved = {};
                try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { saved = {}; }

                // Определяем текущий сезон по дате
                function getSeasonKeyFromDate(d = new Date()) {
                    const month = d.getMonth() + 1;
                    if (month === 12 || month === 1 || month === 2) return 'winter';
                    if (month >= 3 && month <= 5) return 'spring';
                    if (month >= 6 && month <= 8) return 'summer';
                    return 'autumn';
                }

                const currentSeason = getSeasonKeyFromDate(new Date());
                if (!saved[currentSeason]) saved[currentSeason] = {};

                cart.forEach(item => {
                    const prod = products.find(p => p.id == item.id) || null;
                    if (!prod) return;
                    saved[currentSeason][prod.name] = (saved[currentSeason][prod.name] || 0) + (item.quantity || 1);
                });

                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { console.error(e); }
            }
        } catch (e) { console.error(e); }

        localStorage.removeItem('cart');
        renderCart();
    });
});
