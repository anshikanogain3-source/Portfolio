const API = "http://127.0.0.1:5521";

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
        loadTasks();
    }
}

// LOAD
async function loadTasks() {
    const res = await fetch(API + "/tasks");
    const data = await res.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    data.forEach(t => {
        let statusClass =
            t.status === "Done" ? "done" :
            t.status === "In Progress" ? "progress" : "pending";

        list.innerHTML += `
        <div class="card">
            <h3>${t.title}</h3>
            <p>${t.desc}</p>
            <p><b>Assigned:</b> ${t.assigned}</p>
            <p><b>Deadline:</b> ${t.deadline}</p>
            <p class="${statusClass}">${t.status}</p>

            <button onclick="editTask('${t._id}','${t.title}','${t.desc}','${t.assigned}','${t.deadline}','${t.status}')">Edit</button>
            <button onclick="deleteTask('${t._id}')">Delete</button>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addTask() {
    const task = {
        title: document.getElementById("titleTask").value,
        desc: document.getElementById("desc").value,
        assigned: document.getElementById("assigned").value,
        deadline: document.getElementById("deadline").value,
        status: document.getElementById("status").value
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

// EDIT
function editTask(id, t, d, a, dl, s) {
    editId = id;

    document.getElementById("titleTask").value = t;
    document.getElementById("desc").value = d;
    document.getElementById("assigned").value = a;
    document.getElementById("deadline").value = dl;
    document.getElementById("status").value = s;

    document.getElementById("mainBtn").innerText = "Update Task";
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
    document.getElementById("assigned").value = "";
    document.getElementById("deadline").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}