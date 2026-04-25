const API = "http://127.0.0.1:5524";

let signup = false;
let menuData = [];
let selectedItems = [];
let total = 0;

// TOGGLE
function toggle() {
    signup = !signup;

    document.getElementById("name").style.display = signup ? "block" : "none";
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = signup ? "Signup" : "Login";

    document.getElementById("toggleText").innerText =
        signup ? "Already have account? Login" : "Don't have account? Signup";
}

// AUTH
async function handleAuth() {
    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const url = signup ? "/signup" : "/login";

    const res = await fetch(API + url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    if (res.ok) {
        document.getElementById("auth").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadMenu();
        loadOrders();
    }
}

// LOAD MENU
async function loadMenu() {
    const res = await fetch(API + "/menu");
    menuData = await res.json();

    const select = document.getElementById("menuSelect");
    select.innerHTML = "";

    menuData.forEach(item => {
        select.innerHTML += `<option value="${item._id}">
            ${item.name} - ₹${item.price}
        </option>`;
    });
}

// ADD MENU
async function addMenu() {
    const item = {
        name: document.getElementById("mname").value,
        price: parseInt(document.getElementById("mprice").value)
    };

    await fetch(API + "/add_menu", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(item)
    });

    // CLEAR INPUT
    document.getElementById("mname").value = "";
    document.getElementById("mprice").value = "";

    loadMenu();
}

// ADD ITEM TO ORDER
function addItem() {
    const select = document.getElementById("menuSelect");
    const itemId = select.value;

    const item = menuData.find(m => m._id === itemId);

    selectedItems.push(item.name);
    total += item.price;

    document.getElementById("selectedItems").innerText = selectedItems.join(", ");
    document.getElementById("totalDisplay").innerText = total;
}

// ADD ORDER
async function addOrder() {
    const order = {
        cname: document.getElementById("cname").value,
        tableNo: document.getElementById("tableNo").value,
        items: selectedItems.join(", "),
        total: total,
        status: "Pending"
    };

    await fetch(API + "/add_order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(order)
    });

    clearOrderForm();
    loadOrders();
}

// CLEAR FORM
function clearOrderForm() {
    document.getElementById("cname").value = "";
    document.getElementById("tableNo").value = "";
    document.getElementById("selectedItems").innerText = "";
    document.getElementById("totalDisplay").innerText = "0";

    selectedItems = [];
    total = 0;
}

// LOAD ORDERS
async function loadOrders() {
    const res = await fetch(API + "/orders");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(o => {
        table.innerHTML += `
        <tr>
            <td>${o.cname}</td>
            <td>${o.tableNo}</td>
            <td>${o.items}</td>
            <td>${o.total}</td>
            <td>
                <select onchange="updateStatus('${o._id}', this.value)">
                    <option ${o.status=="Pending"?"selected":""}>Pending</option>
                    <option ${o.status=="Preparing"?"selected":""}>Preparing</option>
                    <option ${o.status=="Served"?"selected":""}>Served</option>
                </select>
            </td>
            <td>
                <button onclick="deleteOrder('${o._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// UPDATE STATUS
async function updateStatus(id, status) {
    await fetch(API + "/update_order/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status})
    });

    loadOrders();
}

// DELETE
async function deleteOrder(id) {
    await fetch(API + "/delete_order/" + id, {method: "DELETE"});
    loadOrders();
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}