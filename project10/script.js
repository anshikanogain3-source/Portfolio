const API = "http://127.0.0.1:5510";

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
        loadRecipes();
    }
}

// LOAD
async function loadRecipes() {
    const search = document.getElementById("search").value;

    const res = await fetch(API + "/recipes?search=" + search);
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(r => {
        table.innerHTML += `
        <tr>
            <td>${r.title}</td>
            <td>${r.category}</td>
            <td>${r.time}</td>
            <td>${r.ingredients}</td>
            <td>${r.steps}</td>
            <td>
                <button onclick="editRecipe('${r._id}','${r.title}','${r.category}','${r.time}','${r.ingredients}','${r.steps}')">Edit</button>
                <button onclick="deleteRecipe('${r._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addRecipe() {
    const recipe = {
        title: document.getElementById("titleR").value,
        category: document.getElementById("category").value,
        time: document.getElementById("time").value,
        ingredients: document.getElementById("ingredients").value,
        steps: document.getElementById("steps").value
    };

    if (editId) {
        await fetch(API + "/update_recipe/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(recipe)
        });
        editId = null;
    } else {
        await fetch(API + "/add_recipe", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(recipe)
        });
    }

    clearForm();
    loadRecipes();
}

// EDIT
function editRecipe(id, t, c, time, ing, st) {
    editId = id;

    document.getElementById("titleR").value = t;
    document.getElementById("category").value = c;
    document.getElementById("time").value = time;
    document.getElementById("ingredients").value = ing;
    document.getElementById("steps").value = st;

    document.getElementById("mainBtn").innerText = "Update Recipe";
}

// DELETE
async function deleteRecipe(id) {
    await fetch(API + "/delete_recipe/" + id, {method: "DELETE"});
    loadRecipes();
}

// CLEAR
function clearForm() {
    document.getElementById("titleR").value = "";
    document.getElementById("category").value = "";
    document.getElementById("time").value = "";
    document.getElementById("ingredients").value = "";
    document.getElementById("steps").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}