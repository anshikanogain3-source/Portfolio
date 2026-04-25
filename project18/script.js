const API = "http://127.0.0.1:5518";

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
        loadRooms();
    }
}

// LOAD
async function loadRooms() {
    const res = await fetch(API + "/rooms");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(r => {
        table.innerHTML += `
        <tr>
            <td>${r.student}</td>
            <td>${r.room}</td>
            <td>${r.block}</td>
            <td>${r.floor}</td>
            <td>${r.date}</td>
            <td>
                <button onclick="editRoom('${r._id}','${r.student}','${r.room}','${r.block}','${r.floor}','${r.date}')">Edit</button>
                <button onclick="deleteRoom('${r._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addRoom() {
    const room = {
        student: document.getElementById("student").value,
        room: document.getElementById("room").value,
        block: document.getElementById("block").value,
        floor: document.getElementById("floor").value,
        date: document.getElementById("date").value
    };

    if (editId) {
        await fetch(API + "/update_room/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(room)
        });
        editId = null;
    } else {
        await fetch(API + "/add_room", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(room)
        });
    }

    clearForm();
    loadRooms();
}

// EDIT
function editRoom(id, s, r, b, f, d) {
    editId = id;

    document.getElementById("student").value = s;
    document.getElementById("room").value = r;
    document.getElementById("block").value = b;
    document.getElementById("floor").value = f;
    document.getElementById("date").value = d;

    document.getElementById("mainBtn").innerText = "Update Room";
}

// DELETE
async function deleteRoom(id) {
    await fetch(API + "/delete_room/" + id, {method: "DELETE"});
    loadRooms();
}

// CLEAR
function clearForm() {
    document.getElementById("student").value = "";
    document.getElementById("room").value = "";
    document.getElementById("block").value = "";
    document.getElementById("floor").value = "";
    document.getElementById("date").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}