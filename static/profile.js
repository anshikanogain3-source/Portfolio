const API_URL = "http://127.0.0.1:8800";

window.onload = async () => {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`${API_URL}/get-profile`, {
        headers: { Authorization: token }
    });

    const data = await res.json();

    document.getElementById("name").value = data.name;
    document.getElementById("email").value = data.email;
    document.getElementById("profileEmailPreview").innerText = data.email;
};

async function updateProfile() {
    const token = sessionStorage.getItem("token");
    const name = document.getElementById("name").value.trim();

    if (!name) {
        showToast("Name cannot be empty.", false);
        return;
    }

    const res = await fetch(`${API_URL}/update-profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ name })
    });

    const data = await res.json();
    showToast(data.msg, res.ok);
}

async function changePassword() {
    const token = sessionStorage.getItem("token");

    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    if (!oldPassword || !newPassword) {
        showToast("Enter both password fields.", false);
        return;
    }

    const res = await fetch(`${API_URL}/change-password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    showToast(data.msg, res.ok);

    if (res.ok) {
        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";
    }
}

function goBack() {
    window.location.href = "/template/main.html";
}

function showToast(message, success = true) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = `toast show ${success ? "success" : "error"}`;

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.className = "toast";
    }, 2500);
}
