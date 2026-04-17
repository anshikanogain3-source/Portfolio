const API = "http://127.0.0.1:5519";

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
        loadFees();
    }
}

// LOAD
async function loadFees() {
    const res = await fetch(API + "/fees");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(f => {
        const statusClass = f.status === "Paid" ? "paid" : "pending";

        table.innerHTML += `
        <tr>
            <td>${f.sname}</td>
            <td>${f.class}</td>
            <td>${f.amount}</td>
            <td>${f.due}</td>
            <td class="${statusClass}">${f.status}</td>
            <td>
                <button onclick="editFee('${f._id}','${f.sname}','${f.class}','${f.amount}','${f.due}','${f.status}')">Edit</button>
                <button onclick="deleteFee('${f._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addFee() {
    const fee = {
        sname: document.getElementById("sname").value,
        class: document.getElementById("class").value,
        amount: document.getElementById("amount").value,
        due: document.getElementById("due").value,
        status: document.getElementById("status").value
    };

    if (editId) {
        await fetch(API + "/update_fee/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(fee)
        });
        editId = null;
    } else {
        await fetch(API + "/add_fee", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(fee)
        });
    }

    clearForm();
    loadFees();
}

// EDIT
function editFee(id, n, c, a, d, s) {
    editId = id;

    document.getElementById("sname").value = n;
    document.getElementById("class").value = c;
    document.getElementById("amount").value = a;
    document.getElementById("due").value = d;
    document.getElementById("status").value = s;

    document.getElementById("mainBtn").innerText = "Update Fee";
}

// DELETE
async function deleteFee(id) {
    await fetch(API + "/delete_fee/" + id, {method: "DELETE"});
    loadFees();
}

// CLEAR
function clearForm() {
    document.getElementById("sname").value = "";
    document.getElementById("class").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("due").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}