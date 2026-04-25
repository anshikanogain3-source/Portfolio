const API = "http://127.0.0.1:5528";

let signup = false;
let editId = null;

// TOGGLE
function toggle() {
    signup = !signup;

    document.getElementById("name").style.display = signup ? "block" : "none";
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = signup ? "Signup" : "Login";
}

// AUTH
async function handleAuth() {
    const emailVal = document.getElementById("email").value;
    const passVal = document.getElementById("password").value;
    const nameVal = document.getElementById("name").value;

    let data = { email: emailVal, password: passVal };

    if (signup) data.name = nameVal;

    const url = signup ? "/signup" : "/login";

    const res = await fetch(API + url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) return alert(result.error);

    document.getElementById("auth").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadSubs();
}

// LOAD
async function loadSubs() {
    const res = await fetch(API + "/subscriptions", {credentials: "include"});
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(s => {
        table.innerHTML += `
        <tr>
            <td>${s.uname}</td>
            <td>${s.plan}</td>
            <td>${s.billing}</td>
            <td>₹${s.amount}</td>
            <td>${s.status}</td>
            <td>
                <button onclick="editSub('${s._id}','${s.uname}','${s.plan}','${s.billing}','${s.amount}','${s.status}')">Edit</button>
                <button onclick="deleteSub('${s._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addSubscription() {
    const sub = {
        uname: document.getElementById("uname").value,
        plan: document.getElementById("plan").value,
        billing: document.getElementById("billing").value,
        amount: document.getElementById("amount").value,
        status: document.getElementById("status").value
    };

    if (editId) {
        await fetch(API + "/update_subscription/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(sub)
        });

        editId = null;
        document.getElementById("mainBtn").innerText = "Add Subscription";
    } else {
        await fetch(API + "/add_subscription", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(sub)
        });
    }

    clearForm();
    loadSubs();
}

// EDIT
function editSub(id, u, p, b, a, s) {
    editId = id;

    document.getElementById("uname").value = u;
    document.getElementById("plan").value = p;
    document.getElementById("billing").value = b;
    document.getElementById("amount").value = a;
    document.getElementById("status").value = s;

    document.getElementById("mainBtn").innerText = "Update Subscription";
}

// DELETE
async function deleteSub(id) {
    await fetch(API + "/delete_subscription/" + id, {
        method: "DELETE",
        credentials: "include"
    });
    loadSubs();
}

// CLEAR
function clearForm() {
    document.getElementById("uname").value = "";
    document.getElementById("plan").value = "";
    document.getElementById("billing").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("status").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {
        method: "POST",
        credentials: "include"
    });
    location.reload();
}