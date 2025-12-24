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

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('catalog-grid');
  let products = [];

  try {
  const res = await fetch('../data/products.json');
  products = await res.json();
    
    // Проверка URL параметра поиска перед рендером
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
      filterBySearch(searchQuery.toLowerCase());
    } else {
      renderProducts(products);
    }
  } catch (e) {
    container.innerHTML = '<p>Товары недоступны</p>';
    console.error(e);
  }
  
  function filterBySearch(query) {
    if (!products || products.length === 0) return;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filtered = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const farmer = (p.farmer || '').toLowerCase();
      const type = (p.type || '').toLowerCase();
      
      // Проверяем каждое слово запроса
      return searchTerms.some(term => 
        name.includes(term) || 
        farmer.includes(term) || 
        type.includes(term)
      );
    });
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 18px; color: #666; margin-bottom: 20px;">Товары по запросу "${query}" не найдены</p>
          <button onclick="document.getElementById('reset-filters').click()" style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Показать все товары</button>
        </div>
      `;
    } else {
      renderProducts(filtered);
    }
  }

  function renderProducts(list) {
    container.innerHTML = '';
    
    // Обновляем счетчик товаров
    const countElement = document.getElementById('products-count');
    if (countElement) {
      countElement.textContent = list.length;
    }
    
    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 18px; color: #666; margin-bottom: 20px;">Товары не найдены</p>
        </div>
      `;
      return;
    }
    
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
  const inSeason = isProductInSeason(p);
  const imageSrc = '../' + p.image;

      card.innerHTML = `
        <div class="product-card__media">
            <img src="${imageSrc}" alt="${p.name}">
            <div class="product-card__badges">
                 ${inSeason ? `<span class="product-card__badge">В сезоне</span>` : ''}
            </div>
        </div>
        
        <div class="product-card__content">
            <div class="product-card__info">
                <h3 class="product-card__name">${p.name}</h3>
                <div class="product-card__farmer">
                    <i class="fas fa-tractor"></i>
                    <span>${p.farmer || 'Фермер'}</span>
                </div>
            </div>
            
            <div class="product-card__bottom">
                <div class="product-card__price">${p.price} ₽</div>
                <button class="product-card__add-btn btn-add" data-id="${p.id}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <a href="product.html?id=${p.id}" class="product-card__link-overlay"></a>
        </div>
      `;

      // Добавляем обработчики отдельно — чтобы кнопка не наследовала поведение карточки
      const btnAdd = card.querySelector('.btn-add');

      if (btnAdd) {
        btnAdd.addEventListener('click', (ev) => {
          ev.stopPropagation(); // Предотвращаем клик по карточке
          addToCartById(p.id);
          showToast(`${p.name} добавлен(а) в корзину`);
        });
      }

      // Клик по карточке для перехода на страницу продукта
      card.addEventListener('click', () => {
        window.location.href = `product.html?id=${p.id}`;
      });

      container.appendChild(card);
    });

    if (window.observeElements) window.observeElements();
  }

  // ======= Cart helpers (localStorage) =======
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

      function addToCartById(id) {
    const product = products.find(p => p.id == id);
    if (!product) return;

  const cart = getCart();
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image: '../' + product.image, quantity: 1 });
    }
    saveCart(cart);
    // Сообщаем календарю о покупке (если функция доступна)
  }
    // previously we recorded purchases on add-to-cart; now purchases are recorded only when order is confirmed

  // Простое уведомление (toast)
  function showToast(text) {
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
    }, 1400);
  }

  // ========== Filters logic ==========
  const typeCheckboxes = document.querySelectorAll('input[name="type"]');
  const methodCheckboxes = document.querySelectorAll('input[name="method"]');
  const seasonButton = document.getElementById('season-filter');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters');

  let seasonFilterActive = false;

  resetBtn.addEventListener('click', () => {
    typeCheckboxes.forEach(c => c.checked = false);
    methodCheckboxes.forEach(c => c.checked = false);
    seasonFilterActive = false;
    seasonButton.classList.remove('active');
    sortSelect.value = 'default';
    renderProducts(products);
  });

  // Проверка URL параметра type для автоматического выбора категории
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  
  if (typeParam) {
    // Автоматически выбираем чекбокс категории
    const typeCheckbox = document.querySelector(`input[name="type"][value="${typeParam}"]`);
    if (typeCheckbox) {
      typeCheckbox.checked = true;
    }
  }

  [...typeCheckboxes, ...methodCheckboxes].forEach(ch => ch.addEventListener('change', applyFilters));
  sortSelect.addEventListener('change', applyFilters);

  seasonButton.addEventListener('click', () => {
    seasonFilterActive = !seasonFilterActive;
    seasonButton.classList.toggle('active');
    applyFilters();
  });

  function applyFilters() {
    const typesChecked = Array.from(typeCheckboxes).filter(c => c.checked).map(c => c.value);
    const methodsChecked = Array.from(methodCheckboxes).filter(c => c.checked).map(c => c.value);

    let filtered = products.filter(p => {
      const typeMatch = typesChecked.length ? typesChecked.includes(p.type) : true;
      const methodMatch = methodsChecked.length ? methodsChecked.includes(p.method) : true;
      const seasonMatch = seasonFilterActive ? isProductInSeason(p) : true;
      return typeMatch && methodMatch && seasonMatch;
    });

    switch (sortSelect.value) {
      case 'price-asc': filtered.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': filtered.sort((a,b)=>b.price-a.price); break;
      case 'alpha-asc': filtered.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'alpha-desc': filtered.sort((a,b)=>b.name.localeCompare(a.name)); break;
      case 'location-asc': filtered.sort((a,b)=>a.location.localeCompare(b.location)); break;
      case 'location-desc': filtered.sort((a,b)=>b.location.localeCompare(a.location)); break;
    }

    renderProducts(filtered);
  }
  
  // Если есть параметр type в URL, применяем фильтры сразу
  if (typeParam) {
    applyFilters();
  }
  
  // Поиск
  const searchInput = document.getElementById('header-search');
  const searchBtn = document.querySelector('.header__search-btn');
  
  if (searchInput && searchBtn) {
    // Устанавливаем значение из URL если есть
    const urlParamsForSearch = new URLSearchParams(window.location.search);
    const searchQuery = urlParamsForSearch.get('search');
    if (searchQuery) {
      searchInput.value = searchQuery;
    }
    
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        // Обновляем URL без перезагрузки страницы
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('search', query);
        window.history.pushState({}, '', newUrl);
        filterBySearch(query.toLowerCase());
      } else {
        // Удаляем параметр поиска из URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('search');
        window.history.pushState({}, '', newUrl);
        renderProducts(products);
      }
    };
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
    
    // Поиск при вводе (debounce)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (e.target.value.trim()) {
          handleSearch();
        } else if (e.target.value.trim() === '') {
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('search');
          window.history.pushState({}, '', newUrl);
          renderProducts(products);
        }
      }, 500);
    });
  }
});
