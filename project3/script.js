const API = "http://127.0.0.1:5503";

let signup = false;
let editId = null;

// AUTH
function toggle() {
    signup = !signup;

    // Show/Hide name field
    document.getElementById("name").style.display = signup ? "block" : "none";

    // 🔥 Change title dynamically
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
}

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
        loadTasks();
    }
}

// LOAD TASKS
async function loadTasks() {
    const res = await fetch(API + "/tasks");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(t => {
        table.innerHTML += `
        <tr class="${t.status === 'Completed' ? 'completed' : ''}">
            <td>${t.title}</td>
            <td>${t.description}</td>
            <td>${t.due}</td>
            <td>${t.status}</td>
            <td>
                <button onclick="markDone('${t._id}')">✔</button>
                <button onclick="editTask('${t._id}','${t.title}','${t.description}','${t.due}')">Edit</button>
                <button onclick="deleteTask('${t._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addTask() {
    const task = {
        title: document.getElementById("titleTask").value,
        description: document.getElementById("desc").value,
        due: document.getElementById("due").value
    };

    if (editId) {
        await fetch(API + "/update_task/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        });
        editId = null;
    } else {
        await fetch(API + "/add_task", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        });
    }

    clearForm();
    loadTasks();
}

// MARK COMPLETE
async function markDone(id) {
    await fetch(API + "/update_task/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: "Completed"})
    });

    loadTasks();
}

// EDIT
function editTask(id, title, desc, due) {
    editId = id;
    document.getElementById("titleTask").value = title;
    document.getElementById("desc").value = desc;
    document.getElementById("due").value = due;
}

// DELETE
async function deleteTask(id) {
    await fetch(API + "/delete_task/" + id, {method: "DELETE"});
    loadTasks();
}

// CLEAR
function clearForm() {
    document.getElementById("titleTask").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("due").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}