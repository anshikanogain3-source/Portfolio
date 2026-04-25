const API = "http://127.0.0.1:5504";

let signup = false;
let editId = null;

// TOGGLE
function toggle() {
    signup = !signup;

    document.getElementById("name").style.display = signup ? "block" : "none";
    document.getElementById("title").innerText = signup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = signup ? "Signup" : "Login";

    document.getElementById("toggleText").innerText =
        signup ? "Already have an account? Login" : "Don't have an account? Signup";
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
        loadEmployees();
    }
}

// LOAD
async function loadEmployees() {
    const res = await fetch(API + "/employees");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(e => {
        table.innerHTML += `
        <tr>
            <td>${e.ename}</td>
            <td>${e.dept}</td>
            <td>${e.salary}</td>
            <td>${e.date}</td>
            <td>${e.phone}</td>
            <td>
                <button onclick="editEmployee('${e._id}','${e.ename}','${e.dept}','${e.salary}','${e.date}','${e.phone}')">Edit</button>
                <button onclick="deleteEmployee('${e._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addEmployee() {
    const emp = {
        ename: document.getElementById("ename").value,
        dept: document.getElementById("dept").value,
        salary: document.getElementById("salary").value,
        date: document.getElementById("date").value,
        phone: document.getElementById("phone").value
    };

    if (editId) {
        await fetch(API + "/update_employee/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(emp)
        });
        editId = null;
        document.getElementById("mainBtn").innerText = "Add Employee";
    } else {
        await fetch(API + "/add_employee", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(emp)
        });
    }

    clearForm();
    loadEmployees();
}

// EDIT
function editEmployee(id, name, dept, salary, date, phone) {
    editId = id;

    document.getElementById("ename").value = name;
    document.getElementById("dept").value = dept;
    document.getElementById("salary").value = salary;
    document.getElementById("date").value = date;
    document.getElementById("phone").value = phone;

    document.getElementById("mainBtn").innerText = "Update Employee";
}

// DELETE
async function deleteEmployee(id) {
    await fetch(API + "/delete_employee/" + id, {method: "DELETE"});
    loadEmployees();
}

// CLEAR
function clearForm() {
    document.getElementById("ename").value = "";
    document.getElementById("dept").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("date").value = "";
    document.getElementById("phone").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}