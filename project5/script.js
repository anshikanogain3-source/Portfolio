const API = "http://127.0.0.1:5505";

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
        loadBooks();
    }
}

// LOAD
async function loadBooks() {
    const res = await fetch(API + "/books");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(b => {
        table.innerHTML += `
        <tr>
            <td>${b.titleBook}</td>
            <td>${b.author}</td>
            <td>${b.isbn}</td>
            <td>${b.category}</td>
            <td>${b.quantity}</td>
            <td>
                <button onclick="editBook('${b._id}','${b.titleBook}','${b.author}','${b.isbn}','${b.category}','${b.quantity}')">Edit</button>
                <button onclick="deleteBook('${b._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addBook() {
    const book = {
        titleBook: document.getElementById("titleBook").value,
        author: document.getElementById("author").value,
        isbn: document.getElementById("isbn").value,
        category: document.getElementById("category").value,
        quantity: document.getElementById("quantity").value
    };

    if (editId) {
        await fetch(API + "/update_book/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(book)
        });
        editId = null;
        document.getElementById("mainBtn").innerText = "Add Book";
    } else {
        await fetch(API + "/add_book", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(book)
        });
    }

    clearForm();
    loadBooks();
}

// EDIT
function editBook(id, t, a, i, c, q) {
    editId = id;

    document.getElementById("titleBook").value = t;
    document.getElementById("author").value = a;
    document.getElementById("isbn").value = i;
    document.getElementById("category").value = c;
    document.getElementById("quantity").value = q;

    document.getElementById("mainBtn").innerText = "Update Book";
}

// DELETE
async function deleteBook(id) {
    await fetch(API + "/delete_book/" + id, {method: "DELETE"});
    loadBooks();
}

// CLEAR
function clearForm() {
    document.getElementById("titleBook").value = "";
    document.getElementById("author").value = "";
    document.getElementById("isbn").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}