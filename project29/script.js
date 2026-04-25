const API = "http://127.0.0.1:5529";

let editCust = null;
let editProd = null;
let editOrder = null;
let editReviewId = null;

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

//////////////////// CUSTOMERS ////////////////////

async function addCustomer() {
    const data = {
        name: cname.value,
        email: cemail.value,
        phone: cphone.value,
        address: caddress.value
    };

    if (editCust) {
        await fetch(API + "/update_customer/" + editCust, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        editCust = null;
        custBtn.innerText = "Add Customer";
    } else {
        await fetch(API + "/add_customer", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
    }

    loadCustomers();
    clearCustomer();
}

async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    const container = document.getElementById("customerList");
    container.innerHTML = "";

    data.forEach(c => {

        let reviewHTML = "";

        c.reviews.forEach(r => {
            reviewHTML += `
                <div>
                    ⭐ ${r.review}
                    <button onclick="editReview('${r._id}','${r.review}')">Edit</button>
                    <button onclick="deleteReview('${r._id}')">Delete</button>
                </div>
            `;
        });

        container.innerHTML += `
        <div class="card">
            <b>${c.name}</b> (${c.phone})<br>
            ${c.email}<br>
            ${c.address}

            <br><br>
            <button onclick="editCustomer('${c._id}','${c.name}','${c.email}','${c.phone}','${c.address}')">Edit</button>
            <button onclick="deleteCustomer('${c._id}')">Delete</button>

            <h4>Reviews</h4>
            <input id="rev_${c._id}" placeholder="Write review">
            <button onclick="addReview('${c._id}')">Add</button>

            ${reviewHTML}
        </div>`;
    });
}

function editCustomer(id, n, e, p, a) {
    editCust = id;
    cname.value = n;
    cemail.value = e;
    cphone.value = p;
    caddress.value = a;
    custBtn.innerText = "Update Customer";
}

async function deleteCustomer(id) {
    await fetch(API + "/delete_customer/" + id, {method: "DELETE"});
    loadCustomers();
}

function clearCustomer() {
    cname.value = "";
    cemail.value = "";
    cphone.value = "";
    caddress.value = "";
}

//////////////////// PRODUCTS ////////////////////

function clearProduct() {
    document.getElementById("pname").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("stock").value = "";
}

async function addProduct() {
    const data = {
        name: pname.value,
        price: price.value,
        category: category.value,
        stock: stock.value
    };

    if (editProd) {
        await fetch(API + "/update_product/" + editProd, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        editProd = null;
        prodBtn.innerText = "Add Product";
    } else {
        await fetch(API + "/add_product", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
    }

    loadProducts();
    clearProduct();
}

async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    productList.innerHTML = "";
    productSelect.innerHTML = "";

    data.forEach(p => {
        productList.innerHTML += `
        <div class="card">
            ${p.name} - ₹${p.price} (${p.category}) [Stock: ${p.stock}]
            <button onclick="editProduct('${p._id}','${p.name}','${p.price}','${p.category}','${p.stock}')">Edit</button>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
        </div>`;

        productSelect.innerHTML += `<option>${p.name}</option>`;
    });
}

function editProduct(id, n, pr, c, s) {
    editProd = id;
    pname.value = n;
    price.value = pr;
    category.value = c;
    stock.value = s;
    prodBtn.innerText = "Update Product";
}

async function deleteProduct(id) {
    await fetch(API + "/delete_product/" + id, {method: "DELETE"});
    loadProducts();
}

//////////////////// ORDERS ////////////////////
function clearOrder() {
    document.getElementById("orderCustomer").value = "";
    document.getElementById("orderPhone").value = "";
    document.getElementById("quantity").value = "";
}

async function addOrder() {
    const data = {
        customer: orderCustomer.value,
        phone: orderPhone.value,
        product: productSelect.value,
        quantity: quantity.value
    };

    if (editOrder) {
        await fetch(API + "/update_order/" + editOrder, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        editOrder = null;
        orderBtn.innerText = "Place Order";
    } else {
        await fetch(API + "/add_order", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
    }

    loadOrders();
    clearOrder();
}

async function loadOrders() {
    const res = await fetch(API + "/orders");
    const data = await res.json();

    orderList.innerHTML = "";

    data.forEach(o => {
        orderList.innerHTML += `
        <div class="card">
            ${o.customer} ordered ${o.product} (${o.quantity})
            <button onclick="editOrderFn('${o._id}','${o.customer}','${o.phone}','${o.product}','${o.quantity}')">Edit</button>
            <button onclick="deleteOrder('${o._id}')">Delete</button>
        </div>`;
    });
}

function editOrderFn(id, c, p, pr, q) {
    editOrder = id;
    orderCustomer.value = c;
    orderPhone.value = p;
    productSelect.value = pr;
    quantity.value = q;
    orderBtn.innerText = "Update Order";
}

async function deleteOrder(id) {
    await fetch(API + "/delete_order/" + id, {method: "DELETE"});
    loadOrders();
}

//////////////////// REVIEWS ////////////////////

async function addReview(custId) {
    const text = document.getElementById("rev_" + custId).value;

    await fetch(API + "/add_review", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({customerId: custId, review: text})
    });

    loadCustomers();
}


function editReview(id, text) {
    editReviewId = id;
    const input = prompt("Edit review:", text);

    if (input !== null) {
        updateReview(id, input);
    }
}

async function updateReview(id, text) {
    await fetch(API + "/update_review/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ review: text })
    });

    editReviewId = null;
    loadCustomers();
}

async function deleteReview(id) {
    await fetch(API + "/delete_review/" + id, {
        method: "DELETE"
    });

    loadCustomers();
}

//////////////////// INIT ////////////////////

loadCustomers();
loadProducts();
loadOrders();