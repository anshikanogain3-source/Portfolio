const API = "http://127.0.0.1:5502";

let signup = false;
let editId = null;

// AUTH
function toggle() {
    signup = !signup;
    document.getElementById("name").style.display = signup ? "block" : "none";
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
        loadContacts();
    }
}

// CONTACTS
async function loadContacts() {
    const res = await fetch(API + "/contacts");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(c => {
        table.innerHTML += `
        <tr>
            <td>${c.name}</td>
            <td>${c.mobile}</td>
            <td>${c.email}</td>
            <td>${c.address}</td>
            <td>${c.notes}</td>
            <td>
                <button onclick="editContact('${c._id}', '${c.name}', '${c.mobile}', '${c.email}', '${c.address}', '${c.notes}')">Edit</button>
                <button onclick="deleteContact('${c._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

async function addContact() {
    const contact = {
        name: document.getElementById("cname").value,
        mobile: document.getElementById("mobile").value,
        email: document.getElementById("cemail").value,
        address: document.getElementById("address").value,
        notes: document.getElementById("notes").value
    };

    if (editId) {
        await fetch(API + "/update_contact/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(contact)
        });

        editId = null;
        document.getElementById("mainBtn").innerText = "Add Contact";
    } else {
        await fetch(API + "/add_contact", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(contact)
        });
    }

    clearForm();
    loadContacts();
}

function editContact(id, name, mobile, email, address, notes) {
    editId = id;

    document.getElementById("cname").value = name;
    document.getElementById("mobile").value = mobile;
    document.getElementById("cemail").value = email;
    document.getElementById("address").value = address;
    document.getElementById("notes").value = notes;

    document.getElementById("mainBtn").innerText = "Update Contact";
}

async function deleteContact(id) {
    await fetch(API + "/delete_contact/" + id, {method: "DELETE"});
    loadContacts();
}

function clearForm() {
    document.getElementById("cname").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("cemail").value = "";
    document.getElementById("address").value = "";
    document.getElementById("notes").value = "";
}

async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}