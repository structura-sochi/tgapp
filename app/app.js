// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Данные товаров
const products = [
    {
        id: 1,
        name: "Мужская футболка",
        price: 1990,
        category: "men",
        image: "👕",
        description: "Хлопковая футболка премиум-качества. 100% хлопок, не садится после стирки.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Мужские джинсы",
        price: 4990,
        category: "men",
        image: "👖",
        description: "Классические прямые джинсы. Удобные и стильные на каждый день.",
        sizes: ["28", "30", "32", "34", "36"]
    },
    {
        id: 3,
        name: "Женское платье",
        price: 3590,
        category: "women",
        image: "👗",
        description: "Элегантное повседневное платье. Идеально для офиса и встреч.",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 4,
        name: "Женская блузка",
        price: 2790,
        category: "women",
        image: "👚",
        description: "Шелковая блузка для офиса. Премиальное качество ткани.",
        sizes: ["S", "M", "L"]
    },
    {
        id: 5,
        name: "Кроссовки мужские",
        price: 5990,
        category: "shoes",
        image: "👟",
        description: "Спортивные кроссовки для бега. Ортопедическая стелька, дышащий материал.",
        sizes: ["40", "41", "42", "43", "44", "45"]
    },
    {
        id: 6,
        name: "Туфли женские",
        price: 4590,
        category: "shoes",
        image: "👠",
        description: "Классические туфли-лодочки. Качественная кожа, удобная колодка.",
        sizes: ["35", "36", "37", "38", "39"]
    },
    {
        id: 7,
        name: "Мужская куртка",
        price: 7990,
        category: "men",
        image: "🧥",
        description: "Демисезонная ветровка. Защита от ветра и воды, стильный дизайн.",
        sizes: ["M", "L", "XL", "XXL"]
    },
    {
        id: 8,
        name: "Женская юбка",
        price: 2290,
        category: "women",
        image: "📏",
        description: "Стильная юбка-карандаш. Подчеркивает фигуру, универсальный цвет.",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 9,
        name: "Кеды унисекс",
        price: 3290,
        category: "shoes",
        image: "👟",
        description: "Универсальные кеды для повседневной носки. Подходят мужчинам и женщинам.",
        sizes: ["38", "39", "40", "41", "42", "43"]
    },
    {
        id: 10,
        name: "Свитшот мужской",
        price: 3890,
        category: "men",
        image: "🧦",
        description: "Теплый свитшот с капюшоном. Мягкая ткань, удобный крой.",
        sizes: ["S", "M", "L", "XL"]
    }
];

// Состояние приложения
let state = {
    currentCategory: 'all',
    cart: [],
    selectedProduct: null,
    selectedSize: null
};

// Инициализация приложения
function init() {
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Устанавливаем цветовую схему Telegram
    applyTelegramTheme();
    
    renderProducts();
    setupCategoryTabs();
    loadCart();
    updateCartCount();
    
    // Настраиваем основную кнопку Telegram
    setupMainButton();
    
    // Обработчики событий Telegram
    setupTelegramEvents();
}

// Применяем тему Telegram
function applyTelegramTheme() {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f8f9fa');
}

// Настройка основной кнопки
function setupMainButton() {
    tg.MainButton.setText(`Корзина (${state.cart.length})`);
    tg.MainButton.show();
    tg.MainButton.onClick(showCartInTelegram);
}

// Настройка событий Telegram
function setupTelegramEvents() {
    // Закрытие приложения при нажатии назад
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Обработка изменений темы
    tg.onEvent('themeChanged', () => {
        applyTelegramTheme();
    });
}

// Рендер товаров
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = state.currentCategory === 'all' 
        ? products 
        : products.filter(product => product.category === state.currentCategory);

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="loading">Товары не найдены</div>';
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">${product.image}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatPrice(product.price)}</div>
        </div>
    `).join('');
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

// Настройка табов категорий
function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentCategory = tab.dataset.category;
            renderProducts();
        });
    });
}

// Открытие модального окна товара
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    state.selectedProduct = product;
    state.selectedSize = null;

    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = formatPrice(product.price);
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalImage').textContent = product.image;

    // Генерация вариантов размеров
    const sizeOptions = document.getElementById('sizeOptions');
    if (product.sizes && product.sizes.length > 0) {
        sizeOptions.innerHTML = product.sizes.map(size => `
            <div class="size-option" onclick="selectSize('${size}')">${size}</div>
        `).join('');
        document.querySelector('.size-selector').style.display = 'block';
    } else {
        document.querySelector('.size-selector').style.display = 'none';
    }

    document.getElementById('productModal').style.display = 'block';
    tg.BackButton.show();
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    state.selectedProduct = null;
    state.selectedSize = null;
    tg.BackButton.hide();
}

// Выбор размера
function selectSize(size) {
    state.selectedSize = size;
    
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent === size) {
            option.classList.add('selected');
        }
    });
    
    // Тактильный отклик при выборе размера
    tg.HapticFeedback.selectionChanged();
}

// Добавление в корзину
function addToCart() {
    if (!state.selectedProduct) return;
    
    if (!state.selectedSize && state.selectedProduct.sizes && state.selectedProduct.sizes.length > 0) {
        tg.showPopup({
            title: 'Выберите размер',
            message: 'Пожалуйста, выберите размер перед добавлением в корзину',
            buttons: [{ type: 'close' }]
        });
        return;
    }

    const cartItem = {
        id: Date.now(),
        product: state.selectedProduct,
        size: state.selectedSize,
        quantity: 1,
        addedAt: new Date().toISOString()
    };

    state.cart.push(cartItem);
    saveCart();
    updateCartCount();
    closeModal();
    
    // Тактильный отклик
    tg.HapticFeedback.impactOccurred('soft');
    
    // Показываем подтверждение
    tg.showPopup({
        title: '✅ Добавлено в корзину',
        message: `${state.selectedProduct.name} ${state.selectedSize ? `(размер: ${state.selectedSize})` : ''}`,
        buttons: [{ type: 'close' }]
    });
}

// Показ корзины в Telegram
function showCartInTelegram() {
    if (state.cart.length === 0) {
        tg.showPopup({
            title: '🛒 Корзина',
            message: 'Ваша корзина пуста\n\nВыберите товары в каталоге',
            buttons: [{ type: 'close' }]
        });
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemsText = state.cart.map((item, index) => 
        `${index + 1}. ${item.product.name} ${item.size ? `(размер: ${item.size})` : ''} - ${formatPrice(item.product.price)}`
    ).join('\n');

    tg.showPopup({
        title: `🛒 Корзина (${state.cart.length} товаров)`,
        message: `${itemsText}\n\n💵 Итого: ${formatPrice(total)}`,
        buttons: [
            {
                type: 'default',
                text: '✅ Оформить заказ',
                id: 'checkout'
            },
            {
                type: 'destructive', 
                text: '🗑️ Очистить корзину',
                id: 'clear'
            },
            {
                type: 'cancel',
                text: '🛍️ Продолжить покупки'
            }
        ]
    });
    
    // Обработка нажатий кнопок в popup
    const popupHandler = (data) => {
        if (data.button_id === 'checkout') {
            processOrder();
        } else if (data.button_id === 'clear') {
            clearCart();
        }
        tg.offEvent('popupClosed', popupHandler);
    };
    
    tg.onEvent('popupClosed', popupHandler);
}

// Обработка заказа
function processOrder() {
    const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderItems = state.cart.map(item => 
        `${item.product.name} ${item.size ? `(размер: ${item.size})` : ''}`
    ).join(', ');
    
    // Формируем данные для отправки
    const orderData = {
        products: state.cart,
        total: total,
        orderId: 'ORD-' + Date.now(),
        user: tg.initDataUnsafe.user || { id: 'anonymous' },
        timestamp: new Date().toISOString()
    };
    
    // В реальном приложении здесь будет отправка на сервер
    // Например: fetch('/api/order', { method: 'POST', body: JSON.stringify(orderData) })
    
    tg.showAlert(`✅ Заказ оформлен!\n\n📦 Товары: ${orderItems}\n💵 Сумма: ${formatPrice(total)}\n\n📞 С вами свяжется менеджер для подтверждения.`);
    
    // Очищаем корзину после заказа
    state.cart = [];
    saveCart();
    updateCartCount();
    
    // Тактильный отклик успеха
    tg.HapticFeedback.notificationOccurred('success');
}

// Очистка корзины
function clearCart() {
    if (state.cart.length === 0) return;
    
    tg.showPopup({
        title: 'Очистить корзину?',
        message: `Вы уверены, что хотите удалить ${state.cart.length} товаров из корзины?`,
        buttons: [
            {
                type: 'destructive',
                text: 'Да, очистить',
                id: 'confirm_clear'
            },
            {
                type: 'cancel',
                text: 'Отмена'
            }
        ]
    });
    
    const clearHandler = (data) => {
        if (data.button_id === 'confirm_clear') {
            state.cart = [];
            saveCart();
            updateCartCount();
            tg.showAlert('Корзина очищена!');
            tg.HapticFeedback.impactOccurred('heavy');
        }
        tg.offEvent('popupClosed', clearHandler);
    };
    
    tg.onEvent('popupClosed', clearHandler);
}

// Обновление счетчика корзины
function updateCartCount() {
    const count = state.cart.length;
    tg.MainButton.setText(`Корзина (${count})`);
    
    // Показываем/скрываем кнопку в зависимости от наличия товаров
    if (count > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Сохранение корзины в localStorage
function saveCart() {
    try {
        localStorage.setItem('fashionStoreCart', JSON.stringify(state.cart));
    } catch (e) {
        console.warn('Не удалось сохранить корзину:', e);
    }
}

// Загрузка корзины из localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('fashionStoreCart');
        if (savedCart) {
            state.cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.warn('Не удалось загрузить корзину:', e);
        state.cart = [];
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', init);

// Глобальные функции для HTML
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.selectSize = selectSize;
window.addToCart = addToCart;
