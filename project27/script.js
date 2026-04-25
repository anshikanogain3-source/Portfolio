const API = "http://127.0.0.1:5527";

let signup = false;
let editId = null;
let allCustomers = [];

// TOGGLE
function toggle() {
    signup = !signup;

    document.getElementById("name").style.display = signup ? "block" : "none";
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = signup ? "Signup" : "Login";
}

// AUTH
async function handleAuth() {

    const emailVal = document.getElementById("email").value.trim();
    const passVal = document.getElementById("password").value.trim();
    const nameVal = document.getElementById("name").value.trim();

    let data = {
        email: emailVal,
        password: passVal
    };

    // VALIDATION
    if (!emailVal || !passVal) {
        alert("Email & Password required");
        return;
    }

    if (signup) {
        if (!nameVal) {
            alert("Name required");
            return;
        }
        data.name = nameVal;
    }

    const url = signup ? "/signup" : "/login";

    const res = await fetch(API + url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.error || "Something went wrong");
        return;
    }

    // SAFE DOM ACCESS
    document.getElementById("auth").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadCustomers();
}

// LOAD
async function loadCustomers() {
    const res = await fetch(API + "/customers", {credentials: "include"});
    allCustomers = await res.json();
    displayCustomers(allCustomers);
}

// DISPLAY
function displayCustomers(data) {
    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(c => {
        table.innerHTML += `
        <tr>
            <td>${c.cname}</td>
            <td>${c.cemail}</td>
            <td>${c.phone}</td>
            <td>${c.company}</td>
            <td>${c.notes}</td>
            <td>
                <button onclick="editCustomer('${c._id}','${c.cname}','${c.cemail}','${c.phone}','${c.company}','${c.notes}')">Edit</button>
                <button onclick="deleteCustomer('${c._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addCustomer() {
    const customer = {
        cname: cname.value,
        cemail: cemail.value,
        phone: phone.value,
        company: company.value,
        notes: notes.value
    };

    if (editId) {
        await fetch(API + "/update_customer/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(customer)
        });

        editId = null;
        mainBtn.innerText = "Add Customer";
    } else {
        await fetch(API + "/add_customer", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(customer)
        });
    }

    clearForm();
    loadCustomers();
}

// EDIT
function editCustomer(id, n, e, p, c, notesVal) {
    editId = id;

    cname.value = n;
    cemail.value = e;
    phone.value = p;
    company.value = c;
    notes.value = notesVal;

    mainBtn.innerText = "Update Customer";
}

// DELETE
async function deleteCustomer(id) {
    await fetch(API + "/delete_customer/" + id, {
        method: "DELETE",
        credentials: "include"
    });
    loadCustomers();
}

// SEARCH
function searchCustomer() {
    const val = search.value.toLowerCase();

    const filtered = allCustomers.filter(c =>
        c.cname.toLowerCase().includes(val) ||
        c.cemail.toLowerCase().includes(val)
    );

    displayCustomers(filtered);
}

// CLEAR
function clearForm() {
    cname.value = "";
    cemail.value = "";
    phone.value = "";
    company.value = "";
    notes.value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {
        method: "POST",
        credentials: "include"
    });
    location.reload();
}