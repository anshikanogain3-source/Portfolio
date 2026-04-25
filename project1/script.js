const API = "http://127.0.0.1:5550";


function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("roll").value = "";
    document.getElementById("class").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
}

// ---------------- LOAD ----------------
async function loadStudents() {
    const res = await fetch(`${API}/students`);
    const data = await res.json();

    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    data.forEach(s => {
        table.innerHTML += `
        <tr>
            <td>${s.name}</td>
            <td>${s.roll}</td>
            <td>${s.class}</td>
            <td>${s.email}</td>
            <td>${s.phone}</td>
            <td>
                <button onclick="editStudent('${s._id}', '${s.name}', '${s.roll}', '${s.class}', '${s.email}', '${s.phone}')">Edit</button>
                <button onclick="deleteStudent('${s._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

loadStudents();


// ---------------- ADD ----------------
async function addStudent() {
    const student = {
        name: document.getElementById("name").value,
        roll: document.getElementById("roll").value,
        class: document.getElementById("class").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value
    };

    await fetch(`${API}/add_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    });

    clearForm(); 
    loadStudents();
}


// ---------------- DELETE ----------------
async function deleteStudent(id) {
    await fetch(`${API}/delete_student/${id}`, {
        method: "DELETE"
    });

    loadStudents();
}


// ---------------- EDIT ----------------
function editStudent(id, name, roll, cls, email, phone) {
    document.getElementById("name").value = name;
    document.getElementById("roll").value = roll;
    document.getElementById("class").value = cls;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;

    // Change button to update
    const btn = document.querySelector(".primary");
    btn.innerText = "Update Student";

    btn.onclick = async () => {
        const updated = {
            name: document.getElementById("name").value,
            roll: document.getElementById("roll").value,
            class: document.getElementById("class").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value
        };

        await fetch(`${API}/update_student/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        clearForm(); 
        btn.innerText = "Add Student";
        btn.onclick = addStudent;

        loadStudents();
    };
}

let isSignup = false;

function toggleForm() {
    isSignup = !isSignup;

    document.getElementById("authName").style.display = isSignup ? "block" : "none";
    document.getElementById("formTitle").innerText = isSignup ? "Signup" : "Login";
    document.getElementById("authBtn").innerText = isSignup ? "Signup" : "Login";
}

async function handleAuth() {
    const name = document.getElementById("authName").value;
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    const url = isSignup ? "/signup" : "/login";

    const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, email, password})
    });

    const data = await res.json();

    if (res.ok) {
        document.getElementById("authSection").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadStudents();
    } else {
        document.getElementById("authMsg").innerText = data.error;
    }
}

async function logout() {
    await fetch(`${API}/logout`, {method: "POST"});
    location.reload();
}