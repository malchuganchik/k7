document.addEventListener('DOMContentLoaded', () => {
const burgerBtn = document.getElementById('burger-btn');
const nav = document.querySelector('.nav');
// Открытие/закрытие меню при клике на бургер
burgerBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    burgerBtn.classList.toggle('open');
});

// Закрытие меню при клике на любую ссылку навигации (опционально)
const navLinks = document.querySelectorAll('.nav__link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(nav.classList.contains('active')) {
            nav.classList.remove('active');
            burgerBtn.classList.remove('open');
        }
    });
});
});