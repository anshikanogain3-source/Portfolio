const API = "http://127.0.0.1:5513";

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
        loadTickets();
    }
}

// LOAD
async function loadTickets() {
    const res = await fetch(API + "/tickets");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(t => {
        table.innerHTML += `
        <tr>
            <td>${t.title}</td>
            <td>${t.category}</td>
            <td>${t.date}</td>
            <td>${t.status}</td>
            <td>${t.desc}</td>
            <td>
                <button onclick="editTicket('${t._id}','${t.title}','${t.category}','${t.date}','${t.status}','${t.desc}')">Edit</button>
                <button onclick="deleteTicket('${t._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addTicket() {
    const ticket = {
        title: document.getElementById("titleT").value,
        category: document.getElementById("category").value,
        date: document.getElementById("date").value,
        status: document.getElementById("status").value,
        desc: document.getElementById("desc").value
    };

    if (editId) {
        await fetch(API + "/update_ticket/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(ticket)
        });
        editId = null;
    } else {
        await fetch(API + "/add_ticket", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(ticket)
        });
    }

    clearForm();
    loadTickets();
}

// EDIT
function editTicket(id, t, c, d, s, desc) {
    editId = id;

    document.getElementById("titleT").value = t;
    document.getElementById("category").value = c;
    document.getElementById("date").value = d;
    document.getElementById("status").value = s;
    document.getElementById("desc").value = desc;

    document.getElementById("mainBtn").innerText = "Update Ticket";
}

// DELETE
async function deleteTicket(id) {
    await fetch(API + "/delete_ticket/" + id, {method: "DELETE"});
    loadTickets();
}

// CLEAR
function clearForm() {
    document.getElementById("titleT").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("status").value = "Open";
    document.getElementById("desc").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}