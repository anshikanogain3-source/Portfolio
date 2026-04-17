const API = "http://127.0.0.1:5512";

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
        loadAttendance();
    }
}

// LOAD
async function loadAttendance() {
    const res = await fetch(API + "/attendance");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(a => {
        table.innerHTML += `
        <tr>
            <td>${a.student}</td>
            <td>${a.subject}</td>
            <td>${a.date}</td>
            <td>${a.status}</td>
            <td>
                <button onclick="editAttendance('${a._id}','${a.student}','${a.subject}','${a.date}','${a.status}')">Edit</button>
                <button onclick="deleteAttendance('${a._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addAttendance() {
    const record = {
        student: document.getElementById("student").value,
        subject: document.getElementById("subject").value,
        date: document.getElementById("date").value,
        status: document.getElementById("status").value
    };

    if (editId) {
        await fetch(API + "/update_attendance/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(record)
        });
        editId = null;
    } else {
        await fetch(API + "/add_attendance", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(record)
        });
    }

    clearForm();
    loadAttendance();
}

// EDIT
function editAttendance(id, s, sub, d, st) {
    editId = id;

    document.getElementById("student").value = s;
    document.getElementById("subject").value = sub;
    document.getElementById("date").value = d;
    document.getElementById("status").value = st;

    document.getElementById("mainBtn").innerText = "Update Record";
}

// DELETE
async function deleteAttendance(id) {
    await fetch(API + "/delete_attendance/" + id, {method: "DELETE"});
    loadAttendance();
}

// CLEAR
function clearForm() {
    document.getElementById("student").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("date").value = "";
    document.getElementById("status").value = "Present";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}