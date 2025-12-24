document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("farmers-list");

    fetch("./data/farmers.json")
        .then(res => res.json())
        .then(farmers => {
            farmers.forEach(farmer => {
                const card = document.createElement("div");
                card.classList.add("farmer-card");

                card.innerHTML = `
                    <div class="farmer-card__photo">
                        <img src="./${farmer.image}" alt="${farmer.name}">
                    </div>

                    <div class="farmer-card__content">
                        <h3 class="farmer-card__name">${farmer.name}</h3>
                        <p class="farmer-card__description">${farmer.description}</p>
                        <div class="farmer-card__info">
                            <p class="farmer-card__info-item"><i class="fas fa-clock"></i><strong>Опыт:</strong> ${farmer.experience}</p>
                            <p class="farmer-card__info-item"><i class="fas fa-map-marker-alt"></i><strong>Регион:</strong> ${farmer.location}</p>
                            <p class="farmer-card__info-item"><i class="fas fa-phone"></i><strong>Телефон:</strong> ${farmer.phone}</p>
                        </div>

                        <div class="farmer-card__products">
                            <h4>Продукция:</h4>
                            <div class="farmer-card__product-tags">
                                ${farmer.products.map(p => `<span class="farmer-card__product-tag">${p}</span>`).join("")}
                            </div>
                        </div>

                        <button class="farmer-card__details-btn" data-farmer="${farmer.name}">
                            Подробнее о фермере
                        </button>
                    </div>
                `;

                container.appendChild(card);
            });

            // Обработчик для кнопки подробнее
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('farmer-card__details-btn')) {
                    const farmerName = e.target.dataset.farmer;
                    showFarmerDetails(farmerName);
                }
            });
        })
        .catch(err => console.error("Ошибка загрузки фермеров:", err));

// Функция для показа подробностей фермера
function showFarmerDetails(farmerName) {
    fetch('./data/farmers.json')
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
                                    <img src="./${farmer.image}" alt="${farmer.name}">
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
});