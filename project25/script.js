const API = "http://127.0.0.1:5525";

let signup = false;
let allProperties = [];

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
    let emailVal = document.getElementById("email").value.trim();
    let passVal = document.getElementById("password").value.trim();
    let nameVal = document.getElementById("name").value.trim();

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

    console.log("Sending:", data); // 🔥 DEBUG

    const url = signup ? "/signup" : "/login";

    const res = await fetch(API + url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.error || "Error occurred");
        return;
    }

    alert(result.message);

    document.getElementById("auth").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadProperties();
}

// LOAD
async function loadProperties() {
    const res = await fetch(API + "/properties");
    allProperties = await res.json();
    displayProperties(allProperties);
}

// DISPLAY
function displayProperties(data) {
    const cards = document.getElementById("cards");
    cards.innerHTML = "";

    data.forEach(p => {
        cards.innerHTML += `
        <div class="card">
            <h3>${p.title}</h3>
            <p><b>₹${p.price}</b></p>
            <p>${p.location}</p>
            <p>${p.type}</p>
            <p>${p.desc}</p>
            <button onclick="deleteProperty('${p._id}')">Delete</button>
        </div>
        `;
    });
}

// ADD
async function addProperty() {
    const property = {
        title: titleInput.value,
        price: price.value,
        location: location.value,
        type: type.value,
        desc: desc.value
    };

    await fetch(API + "/add_property", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(property)
    });

    clearForm();
    loadProperties();
}

// SEARCH
function searchProperty() {
    const value = search.value.toLowerCase();

    const filtered = allProperties.filter(p =>
        p.location.toLowerCase().includes(value)
    );

    displayProperties(filtered);
}

// DELETE
async function deleteProperty(id) {
    await fetch(API + "/delete_property/" + id, {method: "DELETE"});
    loadProperties();
}

// CLEAR FORM
function clearForm() {
    titleInput.value = "";
    price.value = "";
    location.value = "";
    type.value = "";
    desc.value = "";
}

// LOGOUT
async function logout() {
    await fetch(API + "/logout", {method: "POST"});
    location.reload();
}