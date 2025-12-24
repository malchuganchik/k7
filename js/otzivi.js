document.addEventListener("DOMContentLoaded", () => {
    const reviewsList = document.getElementById("reviews-list");
    const reviewForm = document.getElementById("review-form");

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || '1'; // default to 1

    // Загрузка отзывов из localStorage
    let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];

    function renderReviews() {
        reviewsList.innerHTML = "";
        reviews.forEach(r => {
            const div = document.createElement("div");
            div.classList.add("review-item");
            div.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${r.name}</span>
                    <div>
                        <span class="review-rating">${'★'.repeat(r.rating || 5)}</span>
                        <span class="review-date">${r.date}</span>
                    </div>
                </div>
                <div class="review-text">${r.text}</div>
            `;
            reviewsList.appendChild(div);
        });
    }

    renderReviews();

    // Добавление нового отзыва
    reviewForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("review-name").value;
        const text = document.getElementById("review-text").value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
        const date = new Date().toISOString().split("T")[0];

        reviews.unshift({name, text, rating: parseInt(rating), date});
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
        renderReviews();

        reviewForm.reset();
    });
});
