// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Данные товаров
const products = [
    {
        id: 1,
        name: "Мужская футболка",
        price: 1990,
        category: "men",
        image: "Футболка",
        description: "Хлопковая футболка премиум-качества",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Мужские джинсы",
        price: 4990,
        category: "men",
        image: "Джинсы",
        description: "Классические прямые джинсы",
        sizes: ["28", "30", "32", "34", "36"]
    },
    {
        id: 3,
        name: "Женское платье",
        price: 3590,
        category: "women",
        image: "Платье",
        description: "Элегантное повседневное платье",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 4,
        name: "Женская блузка",
        price: 2790,
        category: "women",
        image: "Блузка",
        description: "Шелковая блузка для офиса",
        sizes: ["S", "M", "L"]
    },
    {
        id: 5,
        name: "Кроссовки мужские",
        price: 5990,
        category: "shoes",
        image: "Кроссовки",
        description: "Спортивные кроссовки для бега",
        sizes: ["40", "41", "42", "43", "44", "45"]
    },
    {
        id: 6,
        name: "Туфли женские",
        price: 4590,
        category: "shoes",
        image: "Туфли",
        description: "Классические туфли-лодочки",
        sizes: ["35", "36", "37", "38", "39"]
    },
    {
        id: 7,
        name: "Мужская куртка",
        price: 7990,
        category: "men",
        image: "Куртка",
        description: "Демисезонная ветровка",
        sizes: ["M", "L", "XL", "XXL"]
    },
    {
        id: 8,
        name: "Женская юбка",
        price: 2290,
        category: "women",
        image: "Юбка",
        description: "Стильная юбка-карандаш",
        sizes: ["XS", "S", "M", "L"]
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
    renderProducts();
    setupCategoryTabs();
    loadCart();
    updateCartCount();
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
            <div class="product-price">${product.price} ₽</div>
        </div>
    `).join('');
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
    document.getElementById('modalPrice').textContent = `${product.price} ₽`;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalImage').textContent = product.image;

    // Генерация вариантов размеров
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = product.sizes.map(size => `
        <div class="size-option ${state.selectedSize === size ? 'selected' : ''}" 
             onclick="selectSize('${size}')">${size}</div>
    `).join('');

    document.getElementById('productModal').style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    state.selectedProduct = null;
    state.selectedSize = null;
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
}

// Добавление в корзину
function addToCart() {
    if (!state.selectedProduct) return;

    if (!state.selectedSize && state.selectedProduct.sizes.length > 0) {
        alert('Пожалуйста, выберите размер');
        return;
    }

    const cartItem = {
        id: Date.now(),
        product: state.selectedProduct,
        size: state.selectedSize,
        quantity: 1
    };

    state.cart.push(cartItem);
    saveCart();
    updateCartCount();
    closeModal();

    tg.HapticFeedback.impactOccurred('soft');
    showNotification('Товар добавлен в корзину!');
}

// Показать уведомление
function showNotification(message) {
    tg.showPopup({
        title: 'Успешно',
        message: message,
        buttons: [{ type: 'ok' }]
    });
}

// Просмотр корзины
function viewCart() {
    if (state.cart.length === 0) {
        tg.showPopup({
            title: 'Корзина',
            message: 'Ваша корзина пуста',
            buttons: [{ type: 'ok' }]
        });
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemsText = state.cart.map(item =>
        `• ${item.product.name} ${item.size ? `(размер: ${item.size})` : ''} - ${item.product.price} ₽`
    ).join('\n');

    tg.showPopup({
        title: 'Корзина',
        message: `${itemsText}\n\nИтого: ${total} ₽`,
        buttons: [
            {
                type: 'ok',
                text: 'Оформить заказ'
            },
            {
                type: 'cancel',
                text: 'Продолжить покупки'
            }
        ]
    });
}

// Обновление счетчика корзины
function updateCartCount() {
    document.getElementById('cartCount').textContent = state.cart.length;
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('fashionStoreCart', JSON.stringify(state.cart));
}

// Загрузка корзины из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('fashionStoreCart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
    }
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', init);
