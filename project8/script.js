const API = "http://127.0.0.1:5508";

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
        loadMovies();
    }
}

// LOAD
async function loadMovies(search="") {
    const res = await fetch(API + "/movies?search=" + search);
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(m => {
        table.innerHTML += `
        <tr>
            <td>${m.titleMovie}</td>
            <td>${m.genre}</td>
            <td>${m.year}</td>
            <td>⭐ ${m.rating}</td>
            <td>${m.director}</td>
            <td>
                <button onclick="editMovie('${m._id}','${m.titleMovie}','${m.genre}','${m.year}','${m.rating}','${m.director}')">Edit</button>
                <button onclick="deleteMovie('${m._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// SEARCH
function searchMovie() {
    const value = document.getElementById("searchInput").value;
    loadMovies(value);
}

// ADD / UPDATE
async function addMovie() {
    const movie = {
        titleMovie: document.getElementById("titleMovie").value,
        genre: document.getElementById("genre").value,
        year: document.getElementById("year").value,
        rating: document.getElementById("rating").value,
        director: document.getElementById("director").value
    };

    if (editId) {
        await fetch(API + "/update_movie/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(movie)
        });
        editId = null;
    } else {
        await fetch(API + "/add_movie", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(movie)
        });
    }

    clearForm();
    loadMovies();
}

// EDIT
function editMovie(id, t, g, y, r, d) {
    editId = id;

    document.getElementById("titleMovie").value = t;
    document.getElementById("genre").value = g;
    document.getElementById("year").value = y;
    document.getElementById("rating").value = r;
    document.getElementById("director").value = d;

    document.getElementById("mainBtn").innerText = "Update Movie";
}

// DELETE
async function deleteMovie(id) {
    await fetch(API + "/delete_movie/" + id, {method: "DELETE"});
    loadMovies();
}

// CLEAR
function clearForm() {
    document.getElementById("titleMovie").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("year").value = "";
    document.getElementById("rating").value = "";
    document.getElementById("director").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}