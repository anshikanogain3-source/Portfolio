const API = "http://127.0.0.1:5511";

let signup = false;
let editId = null;

// TOGGLE
function toggle() {
    signup = !signup;

    document.getElementById("name").style.display = signup ? "block" : "none";
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = signup ? "Signup" : "Login";

    document.getElementById("toggleText").innerText =
        signup ? "Already have account? Login" : "Create new account";
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
        document.getElementById("authPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadBlogs();
    }
}

// LOAD BLOGS
async function loadBlogs() {
    const res = await fetch(API + "/blogs");
    const data = await res.json();

    const container = document.getElementById("blogContainer");
    container.innerHTML = "";

    data.forEach(b => {
        container.innerHTML += `
        <div class="blog">
            <h3>${b.title}</h3>
            <p><b>${b.author}</b> | ${b.category} | ${b.date}</p>
            <p>${b.content}</p>

            <div class="actions">
                <button onclick="editBlog('${b._id}','${b.title}','${b.author}','${b.category}','${b.date}','${b.content}')">Edit</button>
                <button onclick="deleteBlog('${b._id}')">Delete</button>
            </div>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addBlog() {
    const blog = {
        title: document.getElementById("titleB").value,
        author: document.getElementById("author").value,
        category: document.getElementById("category").value,
        date: document.getElementById("date").value,
        content: document.getElementById("content").value
    };

    if (editId) {
        await fetch(API + "/update_blog/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog)
        });
        editId = null;
    } else {
        await fetch(API + "/add_blog", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog)
        });
    }

    clearForm();
    loadBlogs();
}

// EDIT
function editBlog(id, t, a, c, d, cont) {
    editId = id;

    document.getElementById("titleB").value = t;
    document.getElementById("author").value = a;
    document.getElementById("category").value = c;
    document.getElementById("date").value = d;
    document.getElementById("content").value = cont;

    document.getElementById("mainBtn").innerText = "Update Blog";
}

// DELETE
async function deleteBlog(id) {
    await fetch(API + "/delete_blog/" + id, {method: "DELETE"});
    loadBlogs();
}

// CLEAR
function clearForm() {
    document.getElementById("titleB").value = "";
    document.getElementById("author").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("content").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}