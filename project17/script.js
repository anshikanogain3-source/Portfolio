const API = "http://127.0.0.1:5517";

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
        loadMembers();
    }
}

// LOAD
async function loadMembers() {
    const res = await fetch(API + "/members");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(m => {
        table.innerHTML += `
        <tr>
            <td>${m.name}</td>
            <td>${m.age}</td>
            <td>${m.plan}</td>
            <td>${m.trainer}</td>
            <td>${m.date}</td>
            <td>
                <button onclick="editMember('${m._id}','${m.name}','${m.age}','${m.plan}','${m.trainer}','${m.date}')">Edit</button>
                <button onclick="deleteMember('${m._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addMember() {
    const member = {
        name: document.getElementById("nameM").value,
        age: document.getElementById("age").value,
        plan: document.getElementById("plan").value,
        trainer: document.getElementById("trainer").value,
        date: document.getElementById("date").value
    };

    if (editId) {
        await fetch(API + "/update_member/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(member)
        });
        editId = null;
    } else {
        await fetch(API + "/add_member", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(member)
        });
    }

    clearForm();
    loadMembers();
}

// EDIT
function editMember(id, n, a, p, t, d) {
    editId = id;

    document.getElementById("nameM").value = n;
    document.getElementById("age").value = a;
    document.getElementById("plan").value = p;
    document.getElementById("trainer").value = t;
    document.getElementById("date").value = d;

    document.getElementById("mainBtn").innerText = "Update Member";
}

// DELETE
async function deleteMember(id) {
    await fetch(API + "/delete_member/" + id, {method: "DELETE"});
    loadMembers();
}

// CLEAR
function clearForm() {
    document.getElementById("nameM").value = "";
    document.getElementById("age").value = "";
    document.getElementById("plan").value = "";
    document.getElementById("trainer").value = "";
    document.getElementById("date").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}