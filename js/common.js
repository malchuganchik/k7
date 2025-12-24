// Общие функции для всех страниц

document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    const burgerBtn = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    
    if (burgerBtn && nav) {
        burgerBtn.addEventListener('click', () => {
            nav.classList.toggle('header__nav--active');
            burgerBtn.classList.toggle('header__burger--active');
            document.body.classList.toggle('no-scroll');
        });
        
        // Закрытие меню при клике на ссылку
        nav.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('header__nav--active');
                burgerBtn.classList.remove('header__burger--active');
                document.body.classList.remove('no-scroll');
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !burgerBtn.contains(e.target) && nav.classList.contains('header__nav--active')) {
                nav.classList.remove('header__nav--active');
                burgerBtn.classList.remove('header__burger--active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    // Поиск (базовая функциональность)
    const searchInput = document.getElementById('header-search');
    const searchBtn = document.querySelector('.header__search-btn');

    if (searchInput && searchBtn) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Обработчик формы обратной связи
    const feedbackForm = document.querySelector('.feedback__form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвратить отправку формы
            alert('Спасибо за то что помогаете нам!');
            window.location.href = 'index.html'; // Перенаправление на главную
        });
    }
});

// Theme switcher: сохраняет выбор в localStorage и ставит класс на body
(function(){
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const KEY = 'siteTheme';
    const saved = localStorage.getItem(KEY);
    if (saved === 'alt') document.body.classList.add('theme-alt');

    btn.addEventListener('click', () => {
        const isAlt = document.body.classList.toggle('theme-alt');
        localStorage.setItem(KEY, isAlt ? 'alt' : 'default');
    });
})();

// Scroll Animations Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate once
        }
    });
}, observerOptions);

// Function to observe elements
window.observeElements = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
};

// Observe initial elements
window.observeElements();

// Auto-add class to common sections if not manually added
document.querySelectorAll('.section-title, .hero__content, .category-card, .advantage-card, .product-card, .farmer-card').forEach(el => {
    el.classList.add('animate-on-scroll');
});
// Re-run observation for newly added classes
window.observeElements();




