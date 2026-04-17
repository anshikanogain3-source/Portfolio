const API = "http://127.0.0.1:5522";

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
        loadCourses();
    }
}

// LOAD
async function loadCourses() {
    const res = await fetch(API + "/courses");
    const data = await res.json();

    const grid = document.getElementById("courseGrid");
    grid.innerHTML = "";

    data.forEach(c => {
        grid.innerHTML += `
        <div class="card">
            <h3>${c.titleCourse}</h3>
            <p><b>Instructor:</b> ${c.instructor}</p>
            <p><b>Duration:</b> ${c.duration}</p>
            <p>${c.desc}</p>
            <p><b>Modules:</b> ${c.modules}</p>

            <button onclick="editCourse('${c._id}','${c.titleCourse}','${c.instructor}','${c.duration}','${c.desc}','${c.modules}')">Edit</button>
            <button onclick="deleteCourse('${c._id}')">Delete</button>
        </div>
        `;
    });
}

// ADD / UPDATE
async function addCourse() {
    const course = {
        titleCourse: document.getElementById("titleCourse").value,
        instructor: document.getElementById("instructor").value,
        duration: document.getElementById("duration").value,
        desc: document.getElementById("desc").value,
        modules: document.getElementById("modules").value
    };

    if (editId) {
        await fetch(API + "/update_course/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(course)
        });
        editId = null;
    } else {
        await fetch(API + "/add_course", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(course)
        });
    }

    clearForm();
    loadCourses();
}

// EDIT
function editCourse(id, t, i, d, de, m) {
    editId = id;

    document.getElementById("titleCourse").value = t;
    document.getElementById("instructor").value = i;
    document.getElementById("duration").value = d;
    document.getElementById("desc").value = de;
    document.getElementById("modules").value = m;

    document.getElementById("mainBtn").innerText = "Update Course";
}

// DELETE
async function deleteCourse(id) {
    await fetch(API + "/delete_course/" + id, {method: "DELETE"});
    loadCourses();
}

// CLEAR
function clearForm() {
    document.getElementById("titleCourse").value = "";
    document.getElementById("instructor").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("modules").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}