const API = "http://127.0.0.1:5506";

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

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(c => {
        table.innerHTML += `
        <tr>
            <td>${c.cname}</td>
            <td>${c.duration}</td>
            <td>${c.trainer}</td>
            <td>${c.fees}</td>
            <td>${c.desc}</td>
            <td>
                <button onclick="editCourse('${c._id}','${c.cname}','${c.duration}','${c.trainer}','${c.fees}','${c.desc}')">Edit</button>
                <button onclick="deleteCourse('${c._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addCourse() {
    const course = {
        cname: document.getElementById("cname").value,
        duration: document.getElementById("duration").value,
        trainer: document.getElementById("trainer").value,
        fees: document.getElementById("fees").value,
        desc: document.getElementById("desc").value
    };

    if (editId) {
        await fetch(API + "/update_course/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(course)
        });
        editId = null;
        document.getElementById("mainBtn").innerText = "Add Course";
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
function editCourse(id, n, d, t, f, desc) {
    editId = id;

    document.getElementById("cname").value = n;
    document.getElementById("duration").value = d;
    document.getElementById("trainer").value = t;
    document.getElementById("fees").value = f;
    document.getElementById("desc").value = desc;

    document.getElementById("mainBtn").innerText = "Update Course";
}

// DELETE
async function deleteCourse(id) {
    await fetch(API + "/delete_course/" + id, {method: "DELETE"});
    loadCourses();
}

// CLEAR
function clearForm() {
    document.getElementById("cname").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("trainer").value = "";
    document.getElementById("fees").value = "";
    document.getElementById("desc").value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}