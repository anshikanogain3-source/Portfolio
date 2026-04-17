const API = "http://127.0.0.1:5515";

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
        loadQuestions();
    }
}

// LOAD
async function loadQuestions() {
    const res = await fetch(API + "/questions");
    const data = await res.json();

    const table = document.getElementById("table");
    table.innerHTML = "";

    data.forEach(q => {
        table.innerHTML += `
        <tr>
            <td>${q.question}</td>
            <td>
                A) ${q.opt1}<br>
                B) ${q.opt2}<br>
                C) ${q.opt3}<br>
                D) ${q.opt4}
            </td>
            <td>${q.answer}</td>
            <td>${q.category}</td>
            <td>
                <button onclick="editQuestion('${q._id}','${q.question}','${q.opt1}','${q.opt2}','${q.opt3}','${q.opt4}','${q.answer}','${q.category}')">Edit</button>
                <button onclick="deleteQuestion('${q._id}')">Delete</button>
            </td>
        </tr>
        `;
    });
}

// ADD / UPDATE
async function addQuestion() {
    const question = {
        question: document.getElementById("question").value,
        opt1: document.getElementById("opt1").value,
        opt2: document.getElementById("opt2").value,
        opt3: document.getElementById("opt3").value,
        opt4: document.getElementById("opt4").value,
        answer: document.getElementById("answer").value,
        category: document.getElementById("category").value
    };

    if (editId) {
        await fetch(API + "/update_question/" + editId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(question)
        });
        editId = null;
    } else {
        await fetch(API + "/add_question", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(question)
        });
    }

    clearForm();
    loadQuestions();
}

// EDIT
function editQuestion(id, q, o1, o2, o3, o4, ans, cat) {
    editId = id;

    document.getElementById("question").value = q;
    document.getElementById("opt1").value = o1;
    document.getElementById("opt2").value = o2;
    document.getElementById("opt3").value = o3;
    document.getElementById("opt4").value = o4;
    document.getElementById("answer").value = ans;
    document.getElementById("category").value = cat;

    document.getElementById("mainBtn").innerText = "Update Question";
}

// DELETE
async function deleteQuestion(id) {
    await fetch(API + "/delete_question/" + id, {method: "DELETE"});
    loadQuestions();
}

// CLEAR
function clearForm() {
    document.getElementById("question").value = "";
    document.getElementById("opt1").value = "";
    document.getElementById("opt2").value = "";
    document.getElementById("opt3").value = "";
    document.getElementById("opt4").value = "";
    document.getElementById("category").value = "";
    document.getElementById("answer").value = "Option 1";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}