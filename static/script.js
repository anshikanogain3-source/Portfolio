// ============================
// AUTH UI
// ============================
const API_URL = "http://127.0.0.1:8800";

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const modal = document.getElementById("forgotModal");
const closeBtn = document.querySelector(".close");
const forgotLink = document.querySelector(".forgot");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const passwordHint = document.getElementById("passwordHint");
const matchHint = document.getElementById("matchHint");

let userEmail = "";

loginBtn.onclick = () => {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
};

signupBtn.onclick = () => {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
};

function validatePassword(password) {
    const checks = getPasswordChecks(password);

    if (!checks.length) return "Password must be at least 8 characters long";
    if (!checks.upper) return "Password must contain at least one uppercase letter";
    if (!checks.lower) return "Password must contain at least one lowercase letter";
    if (!checks.number) return "Password must contain at least one number";
    if (!checks.special) return "Password must contain at least one special character";
    return null;
}

function getPasswordChecks(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
}

function getPasswordStrength(password) {
    let score = 0;
    const checks = getPasswordChecks(password);

    Object.values(checks).forEach(BooleanValue => {
        if (BooleanValue) score++;
    });

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
}

function updatePasswordStrength(inputId, strengthId) {
    const password = document.getElementById(inputId).value;
    const strengthIndicator = document.getElementById(strengthId);
    const strength = getPasswordStrength(password);

    strengthIndicator.className = "password-strength";
    if (password.length > 0) {
        strengthIndicator.classList.add(strength);
    }
}

function updatePasswordChecklist(password) {
    const checks = getPasswordChecks(password);
    const checklist = document.querySelectorAll("#passwordChecklist [data-rule]");

    checklist.forEach(item => {
        item.classList.toggle("valid", checks[item.dataset.rule]);
    });

    if (!password) {
        passwordHint.innerText = "Use 8+ characters with upper, lower, number, and symbol.";
        passwordHint.className = "password-label";
        return;
    }

    const strength = getPasswordStrength(password);
    passwordHint.innerText = `Strength: ${strength.charAt(0).toUpperCase() + strength.slice(1)}`;
    passwordHint.className = `password-label ${strength === "strong" ? "success" : strength === "medium" ? "" : "error"}`;
}

function updatePasswordMatch() {
    const password = signupPassword.value;
    const confirm = signupConfirmPassword.value;

    if (!confirm) {
        matchHint.innerText = "";
        matchHint.className = "password-label";
        return;
    }

    if (password === confirm) {
        matchHint.innerText = "Passwords match.";
        matchHint.className = "password-label success";
    } else {
        matchHint.innerText = "Passwords do not match.";
        matchHint.className = "password-label error";
    }
}

function togglePasswordVisibility(targetId, button) {
    const input = document.getElementById(targetId);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.innerText = show ? "Hide" : "Show";
}

loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showToast("Please fill in all fields", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        showToast(data.msg, res.ok);

        if (res.ok) {
            sessionStorage.setItem("token", data.token);
            loginForm.reset();
            window.location.href = "/template/main.html";
        }
    } catch (err) {
        showToast("Server error. Please try again.", false);
    }
};

signupForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupPassword.value;
    const confirm = signupConfirmPassword.value;

    if (!name || !email || !password || !confirm) {
        showToast("Please fill in all fields", false);
        return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        showToast(passwordError, false);
        return;
    }

    if (password !== confirm) {
        showToast("Passwords do not match", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            sessionStorage.setItem("token", data.token);
            signupForm.reset();
            document.querySelectorAll(".password-toggle").forEach(button => button.innerText = "Show");
            updatePasswordChecklist("");
            updatePasswordMatch();
            updatePasswordStrength("signupPassword", "passwordStrength");
            window.location.href = "/template/main.html";
        } else {
            showToast(data.msg || "Signup failed", false);
        }

    } catch (err) {
        showToast("Server error. Please try again.", false);
    }
};

forgotLink.onclick = (e) => {
    e.preventDefault();
    modal.style.display = "flex";
};

closeBtn.onclick = () => {
    modal.style.display = "none";
    resetSteps();
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        resetSteps();
    }
};

async function sendOTP() {
    userEmail = document.querySelector("#step1 input").value;

    if (!userEmail) {
        showToast("Please enter your email", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: userEmail })
        });

        const data = await res.json();
        showToast(data.msg, res.ok);

        if (res.ok) {
            document.querySelector("#step1 input").value = "";
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
        }
    } catch (err) {
        showToast("Server error. Please try again.", false);
    }
}

async function verifyOTP() {
    const otp = document.querySelector("#step2 input").value;

    if (!otp) {
        showToast("Please enter the OTP", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/verify-otp`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: userEmail, otp })
        });

        const data = await res.json();
        showToast(data.msg, res.ok);

        if (res.ok) {
            document.querySelector("#step2 input").value = "";
            step2.classList.add("hidden");
            step3.classList.remove("hidden");
        }
    } catch (err) {
        showToast("Server error. Please try again.", false);
    }
}

document.querySelector("#step3 button").onclick = async () => {
    const password = document.getElementById("resetPassword").value;
    const confirm = document.getElementById("resetConfirmPassword").value;

    if (!password || !confirm) {
        showToast("Please fill in all fields", false);
        return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        showToast(passwordError, false);
        return;
    }

    if (password !== confirm) {
        showToast("Passwords do not match", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: userEmail, password })
        });

        const data = await res.json();
        showToast(data.msg, res.ok);

        if (res.ok) {
            modal.style.display = "none";
            resetSteps();
        }
    } catch (err) {
        showToast("Server error. Please try again.", false);
    }
};

function showToast(message, success = true) {
    const toast = document.getElementById("toast");

    toast.innerText = message;
    toast.className = `toast show ${success ? "success" : "error"}`;

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

function resetSteps() {
    step1.classList.remove("hidden");
    step2.classList.add("hidden");
    step3.classList.add("hidden");
    document.querySelector("#step1 input").value = "";
    document.querySelector("#step2 input").value = "";
    document.getElementById("resetPassword").value = "";
    document.getElementById("resetConfirmPassword").value = "";
    updatePasswordStrength("resetPassword", "resetPasswordStrength");
    document.querySelectorAll('.password-toggle').forEach(button => {
        const input = document.getElementById(button.dataset.target);
        if (input) {
            input.type = "password";
            button.innerText = "Show";
        }
    });
}

document.getElementById("signupPassword").addEventListener("input", function() {
    updatePasswordStrength("signupPassword", "passwordStrength");
    updatePasswordChecklist(this.value);
    updatePasswordMatch();
});

document.getElementById("signupConfirmPassword").addEventListener("input", updatePasswordMatch);

document.getElementById("resetPassword").addEventListener("input", function() {
    updatePasswordStrength("resetPassword", "resetPasswordStrength");
});

document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => togglePasswordVisibility(button.dataset.target, button));
});

updatePasswordChecklist("");
