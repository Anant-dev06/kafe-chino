const ORDERS_KEY = "kc_orders";
const MENU_EXTRA_KEY = "kc_menu_extra";

/* ===================== STORAGE HELPERS ===================== */

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getMenuExtra() {
    try {
        return JSON.parse(localStorage.getItem(MENU_EXTRA_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveMenuExtra(items) {
    localStorage.setItem(MENU_EXTRA_KEY, JSON.stringify(items));
}

/* ===================== SIDEBAR NAVIGATION ===================== */

const pageTitles = { dashboard: "Dashboard", orders: "Orders", menu: "Menu Items" };

document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
        item.classList.add("active");

        const page = item.dataset.page;
        document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
        document.getElementById(`page-${page}`).classList.add("active");
        document.getElementById("pageTitle").textContent = pageTitles[page];

        closeSidebar();
    });
});

/* ===================== MOBILE SIDEBAR ===================== */

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuToggle = document.getElementById("menuToggle");

function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("show"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); }

menuToggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});
overlay.addEventListener("click", closeSidebar);

/* ===================== RENDER DASHBOARD ===================== */

function renderDashboard() {
    const orders = getOrders();
    const menuExtra = getMenuExtra();

    const totalRevenue = orders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + o.total, 0);

    const pending = orders.filter((o) => !["Completed", "Cancelled"].includes(o.status)).length;

    document.getElementById("statTotalOrders").textContent = orders.length;
    document.getElementById("statRevenue").textContent = "₹" + totalRevenue.toLocaleString("en-IN");
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statMenuCount").textContent = 25 + menuExtra.length; // 25 base items + admin-added

    // Recent orders (latest 5)
    const recentBody = document.getElementById("recentOrdersBody");
    const recentEmpty = document.getElementById("recentOrdersEmpty");
    const recent = orders.slice(0, 5);

    if (recent.length === 0) {
        recentBody.innerHTML = "";
        recentEmpty.hidden = false;
    } else {
        recentEmpty.hidden = true;
        recentBody.innerHTML = recent.map((o) => orderRowHtml(o, false)).join("");
    }

    // Top selling items
    const itemCounts = {};
    orders.forEach((o) => {
        o.items.forEach((item) => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topList = document.getElementById("topItemsList");
    const topEmpty = document.getElementById("topItemsEmpty");

    if (topItems.length === 0) {
        topList.innerHTML = "";
        topEmpty.hidden = false;
    } else {
        topEmpty.hidden = true;
        const max = topItems[0][1];
        topList.innerHTML = topItems.map(([name, count], i) => `
            <div class="popular-row">
                <div class="popular-rank">${i + 1}</div>
                <div class="popular-info">
                    <div class="popular-top">
                        <strong>${name}</strong>
                        <span>${count} sold</span>
                    </div>
                    <div class="popular-bar-track">
                        <div class="popular-bar-fill" style="width:${(count / max) * 100}%"></div>
                    </div>
                </div>
            </div>
        `).join("");
    }
}

function orderRowHtml(order, showSelect) {
    const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
    const timeStr = new Date(order.time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

    const statusCell = showSelect
        ? `<select class="status-select status-${order.status}" data-id="${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
               ${["New", "Preparing", "Ready", "Completed", "Cancelled"].map(s => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`).join("")}
           </select>`
        : `<span class="status-select status-${order.status}">${order.status}</span>`;

    if (showSelect) {
        return `
            <tr>
                <td class="order-id">#${String(order.id).slice(-5)}</td>
                <td>${itemsSummary}</td>
                <td>₹${order.total}</td>
                <td>${timeStr}</td>
                <td>${statusCell}</td>
            </tr>
        `;
    }

    return `
        <tr>
            <td class="order-id">#${String(order.id).slice(-5)}</td>
            <td>${itemsSummary}</td>
            <td>₹${order.total}</td>
            <td>${statusCell}</td>
            <td>${timeStr}</td>
        </tr>
    `;
}

/* ===================== ORDERS PAGE ===================== */

function renderOrdersPage() {
    const filter = document.getElementById("statusFilter").value;
    const orders = getOrders().filter((o) => filter === "all" || o.status === filter);

    const body = document.getElementById("allOrdersBody");
    const empty = document.getElementById("allOrdersEmpty");

    if (orders.length === 0) {
        body.innerHTML = "";
        empty.hidden = false;
    } else {
        empty.hidden = true;
        body.innerHTML = orders.map((o) => orderRowHtml(o, true)).join("");
    }
}

function updateOrderStatus(id, newStatus) {
    const orders = getOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
        order.status = newStatus;
        saveOrders(orders);
    }
    renderAll();
}

document.getElementById("statusFilter").addEventListener("change", renderOrdersPage);

/* ===================== MENU PAGE ===================== */

function renderMenuPage() {
    const items = getMenuExtra();
    const list = document.getElementById("adminItemsList");
    const empty = document.getElementById("adminItemsEmpty");

    if (items.length === 0) {
        list.innerHTML = "";
        empty.hidden = false;
    } else {
        empty.hidden = true;
        list.innerHTML = items.map((item) => `
            <div class="admin-item-row">
                <div class="admin-item-info">
                    <span class="admin-item-emoji">${item.emoji || "🍽️"}</span>
                    <div>
                        <p class="admin-item-name">${item.name}</p>
                        <p class="admin-item-meta">${item.category} · ₹${item.price}</p>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteMenuItem(${item.id})">Remove</button>
            </div>
        `).join("");
    }
}

document.getElementById("menuForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const newItem = {
        id: Date.now(),
        name: document.getElementById("itemName").value.trim(),
        price: Number(document.getElementById("itemPrice").value),
        category: document.getElementById("itemCategory").value,
        tag: document.getElementById("itemTag").value.trim(),
        description: document.getElementById("itemDesc").value.trim(),
        emoji: document.getElementById("itemEmoji").value.trim() || "🍽️"
    };

    const items = getMenuExtra();
    items.push(newItem);
    saveMenuExtra(items);

    e.target.reset();
    renderAll();
    alert(`"${newItem.name}" added — it will appear on the live site's menu.`);
});

function deleteMenuItem(id) {
    const items = getMenuExtra().filter((item) => item.id !== id);
    saveMenuExtra(items);
    renderAll();
}

/* ===================== RENDER ALL + LIVE UPDATES ===================== */

function renderAll() {
    renderDashboard();
    renderOrdersPage();
    renderMenuPage();
}

renderAll();

// Live update when the customer site (open in another tab) places an order
// or when another admin tab changes something
window.addEventListener("storage", (e) => {
    if (e.key === ORDERS_KEY || e.key === MENU_EXTRA_KEY) {
        renderAll();
    }
});


document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("kc_auth_role") !== "admin") {
        window.location.replace("index.html");
    }
});
