const API = "http://127.0.0.1:5520";

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

// LOAD PRODUCTS
async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    data.forEach(p => {
        grid.innerHTML += `
        <div class="card">
            <img src="${p.image}" alt="Product Image" class="product-img">
            <h3>${p.pname}</h3>
            <p>₹${p.price}</p>
            <p>${p.category}</p>
            <p>Stock: ${p.stock}</p>

            <button onclick="editProduct('${p._id}','${p.pname}','${p.price}','${p.category}','${p.stock}','${p.image}')">Edit</button>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addProduct() {
    const product = {
        pname: document.getElementById("pname").value,
        price: document.getElementById("price").value,
        category: document.getElementById("category").value,
        stock: document.getElementById("stock").value,
        image: document.getElementById("image").value
    };

    if (editId) {
        await fetch(API + "/update_product/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(product)
        });
        editId = null;
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
function editProduct(id, n, p, c, s, i) {
    editId = id;

    document.getElementById("pname").value = n;
    document.getElementById("price").value = p;
    document.getElementById("category").value = c;
    document.getElementById("stock").value = s;
    document.getElementById("image").value = i;

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
    document.getElementById("category").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("image").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}