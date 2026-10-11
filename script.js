/* ================= STORAGE KEYS ================= */

const ORDERS_KEY = "kc_orders";
const MENU_EXTRA_KEY = "kc_menu_extra";


/* ================= CART ================= */

let cart = [];


/* ADD TO CART */

function addToCart(name, price) {

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }

    updateCart();
    openCart();
}


/* UPDATE CART */

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    } else {
        cartItems.innerHTML = "";

        cart.forEach((item, index) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");

            cartItem.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="quantity">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                    <button class="remove" onclick="removeItem(${index})">✕</button>
                </div>
            `;

            cartItems.appendChild(cartItem);
        });
    }

    cartCount.innerText = totalItems;
    cartTotal.innerText = totalPrice;
}


/* CHANGE QUANTITY */

function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}


/* REMOVE ITEM */

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}


/* ================= CART SIDEBAR ================= */

function openCart() {
    document.getElementById("cart-sidebar").classList.add("open");
    document.getElementById("cart-overlay").classList.add("show");
}

function closeCart() {
    document.getElementById("cart-sidebar").classList.remove("open");
    document.getElementById("cart-overlay").classList.remove("show");
}


/* ================= MENU FILTER ================= */

function filterMenu(category, button) {
    const cards = document.querySelectorAll(".food-card");
    const buttons = document.querySelectorAll(".category");

    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    cards.forEach(card => {
        if (category === "all" || card.dataset.category === category) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
}


/* ================= SEARCH ================= */

function searchMenu() {
    const searchValue = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".food-card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(searchValue)) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
}


/* ================= MOBILE MENU ================= */

function toggleMenu() {
    document.getElementById("navbar").classList.toggle("show");
}

document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('nav').classList.toggle('nav-open');
});


/* ================= CHECKOUT (now saves order for admin panel) ================= */

function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    // Build an order record and save it so the admin panel can see it
    const order = {
        id: Date.now(),
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total: total,
        time: new Date().toISOString(),
        status: "New"
    };

    saveOrder(order);

    alert(
        "Thank you for your order! ☕\n\n" +
        "Your total is ₹" + total +
        "\n\nThis is a demo checkout. Order sent to admin panel."
    );

    cart = [];
    updateCart();
    closeCart();
}

function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order); // newest first
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
        return [];
    }
}


/* ================= EXTRA MENU ITEMS ADDED FROM ADMIN PANEL ================= */

function getExtraMenuItems() {
    try {
        return JSON.parse(localStorage.getItem(MENU_EXTRA_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function renderExtraMenuItems() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    // Remove any previously injected admin items so we don't duplicate on refresh
    grid.querySelectorAll('[data-admin-item="true"]').forEach(el => el.remove());

    const items = getExtraMenuItems();

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "food-card";
        card.dataset.category = item.category;
        card.dataset.adminItem = "true";

        card.innerHTML = `
            <div class="food-image">
                ${item.image
                ? `<img src="${item.image}">`
                : `<span style="font-size:60px">${item.emoji || "🍽️"}</span>`}
            </div>
            <div class="food-info">
                <span class="tag">${item.tag || "New"}</span>
                <h3>${item.name}</h3>
                <p>${item.description || "Freshly added to our menu."}</p>
                <div class="food-bottom">
                    <strong>₹${item.price}</strong>
                    <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">Add +</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}


/* ================= CONTACT FORM ================= */

/* ================= CONTACT FORM (sends real email via EmailJS) ================= */

(function () {
    emailjs.init("BxLmmwZ7kfDVrfj0j"); // from Account → API Keys
})();

function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector(".primary-btn");
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    const templateParams = {
        name: form.name.value,
        message: form.message.value,
        title: "New message from Kafe-chino website",
        time: new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        })
    };

    emailjs.send("service_tyw468q", "template_me5xv9e", templateParams)
        .then(() => {
            alert("Thank you for contacting Kafe-chino! ❤️ We'll get back to you soon.");
            form.reset();
        })
        .catch((error) => {
            alert("Sorry, something went wrong sending your message. Please try again or call us directly.");
            console.error("EmailJS error:", error);
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    renderExtraMenuItems();
});

// If the admin panel (open in another tab) adds a menu item, reflect it here live
window.addEventListener("storage", (e) => {
    if (e.key === MENU_EXTRA_KEY) {
        renderExtraMenuItems();
    }
});


// user view control
/* ================= ADMIN AUTH ================= */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "kafechino2026"; // ⚠️ change this to your own
const AUTH_KEY = "kc_admin_auth";

function checkAuthUI() {
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === "true";
    document.getElementById("adminLink").style.display = isLoggedIn ? "inline-block" : "none";
    document.getElementById("loginLink").style.display = isLoggedIn ? "none" : "inline-block";
    document.getElementById("logoutLink").style.display = isLoggedIn ? "inline-block" : "none";
}

function openLogin(event) {
    event.preventDefault();
    document.getElementById("login-overlay").classList.add("show");
    document.getElementById("login-box").classList.add("open");
}

function closeLogin() {
    document.getElementById("login-overlay").classList.remove("show");
    document.getElementById("login-box").classList.remove("open");
    document.getElementById("loginError").hidden = true;
    document.getElementById("loginForm").reset();
}

function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem(AUTH_KEY, "true");
        checkAuthUI();
        closeLogin();
        alert("Welcome back! You now have access to the Admin panel.");
    } else {
        document.getElementById("loginError").hidden = false;
    }
}

function logoutUser(event) {
    event.preventDefault();
    localStorage.removeItem(AUTH_KEY);
    checkAuthUI();
    alert("You have been logged out.");
}

// 
document.addEventListener("DOMContentLoaded", () => {
    renderExtraMenuItems();
    checkAuthUI();
});