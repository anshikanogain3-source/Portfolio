const API = "http://127.0.0.1:5526";

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
    let emailVal = document.getElementById("email").value.trim();
    let passVal = document.getElementById("password").value.trim();
    let nameVal = document.getElementById("name").value.trim();

    let data = { email: emailVal, password: passVal };

    if (signup) {
        if (!nameVal) return alert("Name required");
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

    if (!res.ok) return alert(result.error);

    auth.style.display = "none";
    dashboard.style.display = "block";

    loadProjects();
}

// LOAD
function loadProjects() {
    fetch(API + "/projects", {credentials: "include"})
    .then(res => res.json())
    .then(data => {
        const cards = document.getElementById("cards");
        cards.innerHTML = "";

        data.forEach(p => {
            cards.innerHTML += `
            <div class="card">
                <h3>${p.title}</h3>
                <p><b>₹${p.budget}</b></p>
                <p>Deadline: ${p.deadline}</p>
                <p>${p.skills}</p>
                <p>${p.desc}</p>

                <button onclick="editProject('${p._id}','${p.title}','${p.budget}','${p.deadline}','${p.skills}','${p.desc}')">Edit</button>
                <button onclick="deleteProject('${p._id}')">Delete</button>
            </div>
            `;
        });
    });
}

// ADD
async function addProject() {
    const project = {
        title: titleInput.value,
        budget: budget.value,
        deadline: deadline.value,
        skills: skills.value,
        desc: desc.value
    };

    if (editId) {
        await fetch(API + "/update_project/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(project)
        });

        editId = null;
        document.getElementById("mainBtn").innerText = "Post Project";
    } else {
        await fetch(API + "/add_project", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(project)
        });
    }

    clearForm();
    loadProjects();
}

// Edit function
function editProject(id, title, budgetVal, deadlineVal, skillsVal, descVal) {
    editId = id;

    document.getElementById("titleInput").value = title;
    document.getElementById("budget").value = budgetVal;
    document.getElementById("deadline").value = deadlineVal;
    document.getElementById("skills").value = skillsVal;
    document.getElementById("desc").value = descVal;

    document.getElementById("mainBtn").innerText = "Update Project";
}

// DELETE
async function deleteProject(id) {
    await fetch(API + "/delete_project/" + id, {
        method: "DELETE",
        credentials: "include"
    });
    loadProjects();
}

// CLEAR
function clearForm() {
    titleInput.value = "";
    budget.value = "";
    deadline.value = "";
    skills.value = "";
    desc.value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {
        method: "POST",
        credentials: "include"
    });
    location.reload();
}