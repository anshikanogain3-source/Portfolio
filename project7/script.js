const API = "http://127.0.0.1:5507";

let signup = false;
let editId = null;

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
        loadProducts();
    }
}

// LOAD
async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(p => {
        table.innerHTML += `
        <tr>
            <td>${p.pname}</td>
            <td>${p.price}</td>
            <td>${p.quantity}</td>
            <td>${p.category}</td>
            <td>${p.brand}</td>
            <td>
                <button onclick="editProduct('${p._id}','${p.pname}','${p.price}','${p.quantity}','${p.category}','${p.brand}')">Edit</button>
                <button onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addProduct() {
    const product = {
        pname: document.getElementById("pname").value,
        price: document.getElementById("price").value,
        quantity: document.getElementById("quantity").value,
        category: document.getElementById("category").value,
        brand: document.getElementById("brand").value
    };

    if (editId) {
        await fetch(API + "/update_product/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(product)
        });
        editId = null;
        document.getElementById("mainBtn").innerText = "Add Product";
    } else {
        await fetch(API + "/add_product", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(product)
        });
    }

    clearForm();
    loadProducts();
}

// EDIT
function editProduct(id, n, p, q, c, b) {
    editId = id;

    document.getElementById("pname").value = n;
    document.getElementById("price").value = p;
    document.getElementById("quantity").value = q;
    document.getElementById("category").value = c;
    document.getElementById("brand").value = b;

    document.getElementById("mainBtn").innerText = "Update Product";
}

// DELETE
async function deleteProduct(id) {
    await fetch(API + "/delete_product/" + id, {method: "DELETE"});
    loadProducts();
}

// CLEAR
function clearForm() {
    document.getElementById("pname").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("category").value = "";
    document.getElementById("brand").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}