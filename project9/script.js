const API = "http://127.0.0.1:5509";

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
        loadEvents();
    }
}

// LOAD
async function loadEvents() {
    const res = await fetch(API + "/events");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(e => {
        table.innerHTML += `
        <tr>
            <td>${e.ename}</td>
            <td>${e.date}</td>
            <td>${e.venue}</td>
            <td>${e.organizer}</td>
            <td>${e.desc}</td>
            <td>
                <button onclick="editEvent('${e._id}','${e.ename}','${e.date}','${e.venue}','${e.organizer}','${e.desc}')">Edit</button>
                <button onclick="deleteEvent('${e._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addEvent() {
    const event = {
        ename: document.getElementById("ename").value,
        date: document.getElementById("date").value,
        venue: document.getElementById("venue").value,
        organizer: document.getElementById("organizer").value,
        desc: document.getElementById("desc").value
    };

    if (editId) {
        await fetch(API + "/update_event/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(event)
        });
        editId = null;
    } else {
        await fetch(API + "/add_event", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(event)
        });
    }

    clearForm();
    loadEvents();
}

// EDIT
function editEvent(id, n, d, v, o, desc) {
    editId = id;

    document.getElementById("ename").value = n;
    document.getElementById("date").value = d;
    document.getElementById("venue").value = v;
    document.getElementById("organizer").value = o;
    document.getElementById("desc").value = desc;

    document.getElementById("mainBtn").innerText = "Update Event";
}

// DELETE
async function deleteEvent(id) {
    await fetch(API + "/delete_event/" + id, {method: "DELETE"});
    loadEvents();
}

// CLEAR
function clearForm() {
    document.getElementById("ename").value = "";
    document.getElementById("date").value = "";
    document.getElementById("venue").value = "";
    document.getElementById("organizer").value = "";
    document.getElementById("desc").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}