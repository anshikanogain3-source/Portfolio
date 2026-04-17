const API = "http://127.0.0.1:5516";

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
        loadPatients();
    }
}

// LOAD
async function loadPatients() {
    const res = await fetch(API + "/patients");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(p => {
        table.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.disease}</td>
            <td>${p.doctor}</td>
            <td>${p.date}</td>
            <td>
                <button onclick="editPatient('${p._id}','${p.name}','${p.age}','${p.disease}','${p.doctor}','${p.date}')">Edit</button>
                <button onclick="deletePatient('${p._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addPatient() {
    const patient = {
        name: document.getElementById("nameP").value,
        age: document.getElementById("age").value,
        disease: document.getElementById("disease").value,
        doctor: document.getElementById("doctor").value,
        date: document.getElementById("date").value
    };

    if (editId) {
        await fetch(API + "/update_patient/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(patient)
        });
        editId = null;
    } else {
        await fetch(API + "/add_patient", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(patient)
        });
    }

    clearForm();
    loadPatients();
}

// EDIT
function editPatient(id, n, a, d, doc, date) {
    editId = id;

    document.getElementById("nameP").value = n;
    document.getElementById("age").value = a;
    document.getElementById("disease").value = d;
    document.getElementById("doctor").value = doc;
    document.getElementById("date").value = date;

    document.getElementById("mainBtn").innerText = "Update Patient";
}

// DELETE
async function deletePatient(id) {
    await fetch(API + "/delete_patient/" + id, {method: "DELETE"});
    loadPatients();
}

// CLEAR
function clearForm() {
    document.getElementById("nameP").value = "";
    document.getElementById("age").value = "";
    document.getElementById("disease").value = "";
    document.getElementById("doctor").value = "";
    document.getElementById("date").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}