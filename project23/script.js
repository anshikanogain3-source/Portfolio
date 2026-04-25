const API = "http://127.0.0.1:5523";

let signup = false;
let editId = null;

// OPEN AUTH
function openAuth() {
    document.getElementById("auth").classList.remove("hidden");
}

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
        document.getElementById("landing").style.display = "none";
        document.getElementById("auth").style.display = "none";
        document.getElementById("dashboard").classList.remove("hidden");
        loadJobs();
    }
}

// LOAD JOBS
async function loadJobs() {
    const res = await fetch(API + "/jobs");
    const data = await res.json();

    const list = document.getElementById("jobList");
    list.innerHTML = "";

    data.forEach(j => {
        list.innerHTML += `
        <div class="card">
            <h3>${j.titleJob}</h3>
            <p><b>${j.company}</b></p>
            <p>${j.location}</p>
            <p>₹${j.salary}</p>
            <p>${j.skills}</p>
            <p>${j.desc}</p>

            <button onclick="editJob('${j._id}','${j.company}','${j.titleJob}','${j.salary}','${j.location}','${j.skills}','${j.desc}')">Edit</button>
            <button onclick="deleteJob('${j._id}')">Delete</button>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addJob() {
    const job = {
        company: document.getElementById("company").value,
        titleJob: document.getElementById("titleJob").value,
        salary: document.getElementById("salary").value,
        location: document.getElementById("location").value,
        skills: document.getElementById("skills").value,
        desc: document.getElementById("desc").value
    };

    if (editId) {
        await fetch(API + "/update_job/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(job)
        });
        editId = null;
    } else {
        await fetch(API + "/add_job", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(job)
        });
    }

    clearForm();
    loadJobs();
}

// EDIT
function editJob(id, c, t, s, l, sk, d) {
    editId = id;

    document.getElementById("company").value = c;
    document.getElementById("titleJob").value = t;
    document.getElementById("salary").value = s;
    document.getElementById("location").value = l;
    document.getElementById("skills").value = sk;
    document.getElementById("desc").value = d;

    document.getElementById("mainBtn").innerText = "Update Job";
}

// DELETE
async function deleteJob(id) {
    await fetch(API + "/delete_job/" + id, {method: "DELETE"});
    loadJobs();
}

// CLEAR
function clearForm() {
    document.getElementById("company").value = "";
    document.getElementById("titleJob").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("location").value = "";
    document.getElementById("skills").value = "";
    document.getElementById("desc").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}