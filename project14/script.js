const API = "http://127.0.0.1:5514";

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
        loadNotes();
    }
}

// LOAD
async function loadNotes() {
    const res = await fetch(API + "/notes");
    const data = await res.json();

    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    data.forEach(n => {
        container.innerHTML += `
        <div class="note">
            <h3>${n.subject} - ${n.topic}</h3>
            <p><b>${n.author}</b></p>
            <p>${n.desc}</p>
            ${n.file ? `<a href="${n.file}" target="_blank">📎 View File</a>` : ""}

            <div class="actions">
                <button onclick="editNote('${n._id}','${n.subject}','${n.topic}','${n.author}','${n.file}','${n.desc}')">Edit</button>
                <button onclick="deleteNote('${n._id}')">Delete</button>
            </div>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addNote() {
    const note = {
        subject: document.getElementById("subject").value,
        topic: document.getElementById("topic").value,
        author: document.getElementById("author").value,
        file: document.getElementById("file").value,
        desc: document.getElementById("desc").value
    };

    if (editId) {
        await fetch(API + "/update_note/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(note)
        });
        editId = null;
    } else {
        await fetch(API + "/add_note", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(note)
        });
    }

    clearForm();
    loadNotes();
}

// EDIT
function editNote(id, s, t, a, f, d) {
    editId = id;

    document.getElementById("subject").value = s;
    document.getElementById("topic").value = t;
    document.getElementById("author").value = a;
    document.getElementById("file").value = f;
    document.getElementById("desc").value = d;

    document.getElementById("mainBtn").innerText = "Update Note";
}

// DELETE
async function deleteNote(id) {
    await fetch(API + "/delete_note/" + id, {method: "DELETE"});
    loadNotes();
}

// CLEAR
function clearForm() {
    document.getElementById("subject").value = "";
    document.getElementById("topic").value = "";
    document.getElementById("author").value = "";
    document.getElementById("file").value = "";
    document.getElementById("desc").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}