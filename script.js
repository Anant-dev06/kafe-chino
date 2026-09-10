/* ================= CART ================= */

let cart = [];


/* ADD TO CART */

function addToCart(name, price) {

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

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

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

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

                    <button onclick="changeQuantity(${index}, -1)">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button onclick="changeQuantity(${index}, 1)">
                        +
                    </button>

                    <button
                        class="remove"
                        onclick="removeItem(${index})"
                    >
                        ✕
                    </button>

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

    document
        .getElementById("cart-sidebar")
        .classList.add("open");

    document
        .getElementById("cart-overlay")
        .classList.add("show");

}


function closeCart() {

    document
        .getElementById("cart-sidebar")
        .classList.remove("open");

    document
        .getElementById("cart-overlay")
        .classList.remove("show");

}


/* ================= MENU FILTER ================= */

function filterMenu(category, button) {

    const cards = document.querySelectorAll(".food-card");

    const buttons = document.querySelectorAll(".category");


    buttons.forEach(btn => {

        btn.classList.remove("active");

    });


    button.classList.add("active");


    cards.forEach(card => {

        if (
            category === "all" ||
            card.dataset.category === category
        ) {

            card.classList.remove("hidden");

        } else {

            card.classList.add("hidden");

        }

    });

}


/* ================= SEARCH ================= */

function searchMenu() {

    const searchValue =
        document
            .getElementById("search")
            .value
            .toLowerCase();


    const cards =
        document.querySelectorAll(".food-card");


    cards.forEach(card => {

        const text =
            card.innerText.toLowerCase();


        if (text.includes(searchValue)) {

            card.classList.remove("hidden");

        } else {

            card.classList.add("hidden");

        }

    });

}


/* ================= MOBILE MENU ================= */

function toggleMenu() {

    document
        .getElementById("navbar")
        .classList.toggle("show");

}


/* ================= CHECKOUT ================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;

    }


    let total = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;

    });


    alert(
        "Thank you for your order! ☕\n\n" +
        "Your total is ₹" + total +
        "\n\nThis is a demo checkout."
    );


    cart = [];

    updateCart();

    closeCart();

}


/* ================= CONTACT FORM ================= */

function submitForm(event) {

    event.preventDefault();

    alert(
        "Thank you for contacting Brew & Bite! ❤️"
    );

    event.target.reset();

}