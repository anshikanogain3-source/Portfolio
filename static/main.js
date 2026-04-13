const API_URL = "http://127.0.0.1:8800";

let expenses = [];
let categories = [];
let editId = null;
let chartInstance = null;
let reportSummary = null;

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "/template/index.html";
}

window.onload = () => {
    setTodayLabel();
    updateGreeting();
    loadExpenses();
    loadCategories();
    loadReportSummary();
};

function goProfile() {
    window.location.href = "/template/profile.html";
}

async function loadCategories() {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`${API_URL}/get-categories`, {
        headers: { Authorization: token }
    });

    categories = await res.json();
    renderCategories();
}

function renderCategories() {
    const select = document.getElementById("category");
    select.innerHTML = "";

    if (!categories.length) {
        const option = document.createElement("option");
        option.value = "";
        option.text = "Add a category first";
        select.add(option);
        return;
    }

    categories.forEach(c => {
        const option = document.createElement("option");
        option.value = c.name;
        option.text = c.name;
        select.add(option);
    });
}

async function addCategory() {
    const token = sessionStorage.getItem("token");
    const input = document.getElementById("newCategory");
    const value = input.value.trim();

    if (!value) {
        showToast("Enter a category name first.", false);
        return;
    }

    await fetch(`${API_URL}/add-category`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({ name: value })
    });

    input.value = "";
    showToast("Category added successfully.");
    loadCategories();
}

async function loadExpenses() {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`${API_URL}/get-expenses`, {
        headers: { Authorization: token }
    });

    expenses = await res.json();
    renderExpenses();
    loadReportSummary();
}

async function addExpense() {
    const token = sessionStorage.getItem("token");

    const title = document.getElementById("title").value.trim();
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    if (!title || !amount || !date || !category) {
        showToast("Fill all fields before saving.", false);
        return;
    }

    if (editId) {
        await fetch(`${API_URL}/update-expense/${editId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ title, amount, date, category })
        });

        showToast("Expense updated.");
        editId = null;
    } else {
        await fetch(`${API_URL}/add-expense`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ title, amount, date, category })
        });

        showToast("Expense added.");
    }

    clearInputs();
    setEditMode(false);
    loadExpenses();
}

async function deleteExpense(id) {
    const token = sessionStorage.getItem("token");

    await fetch(`${API_URL}/delete-expense/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
    });

    showToast("Expense deleted.");
    loadExpenses();
}

function editExpense(id) {
    const expense = expenses.find(item => item._id === id);

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("date").value = expense.date;
    document.getElementById("category").value = expense.category;

    editId = id;
    setEditMode(true, expense.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderExpenses() {
    const list = document.getElementById("expenseList");
    const search = document.getElementById("search").value.toLowerCase();
    const sort = document.getElementById("sort").value;
    const emptyState = document.getElementById("emptyState");

    let filtered = expenses.filter(expense =>
        expense.title.toLowerCase().includes(search)
    );

    if (sort === "amount") filtered.sort((a, b) => a.amount - b.amount);
    if (sort === "date") filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sort === "category") filtered.sort((a, b) => a.category.localeCompare(b.category));

    list.innerHTML = "";
    let total = 0;

    filtered.forEach(expense => {
        total += Number(expense.amount);

        list.innerHTML += `
        <tr>
            <td>${expense.title}</td>
            <td class="amount">Rs ${Number(expense.amount).toLocaleString()}</td>
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td class="actions">
                <button class="table-button edit" onclick="editExpense('${expense._id}')">Edit</button>
                <button class="table-button delete" onclick="deleteExpense('${expense._id}')">Delete</button>
            </td>
        </tr>`;
    });

    emptyState.classList.toggle("hidden", filtered.length > 0);
    document.getElementById("totalAmount").innerText = total.toLocaleString();
    document.getElementById("totalCount").innerText = filtered.length;
    document.getElementById("topCategory").innerText = getTopCategory(filtered);
}

function clearInputs() {
    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    if (categories.length) {
        document.getElementById("category").value = categories[0].name;
    }
}

function toggleCategory() {
    document.getElementById("categoryBox").classList.toggle("hidden");
}

function openAnalytics() {
    document.getElementById("analyticsModal").classList.remove("hidden");
    renderChart();
}

function closeAnalytics() {
    document.getElementById("analyticsModal").classList.add("hidden");
}

function openReports() {
    document.getElementById("reportsModal").classList.remove("hidden");
    loadReportSummary(true);
}

function closeReports() {
    document.getElementById("reportsModal").classList.add("hidden");
}

function renderChart() {
    const type = document.getElementById("chartType").value;
    const dataMap = {};

    if (type === "category") {
        expenses.forEach(expense => {
            dataMap[expense.category] = (dataMap[expense.category] || 0) + Number(expense.amount);
        });
    }

    if (type === "date") {
        expenses.forEach(expense => {
            dataMap[expense.date] = (dataMap[expense.date] || 0) + Number(expense.amount);
        });
    }

    const labels = Object.keys(dataMap);
    const values = Object.values(dataMap);
    const ctx = document.getElementById("myChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Expenses",
                data: values,
                backgroundColor: ["#35d0a3", "#ffd166", "#8ae7cf", "#ff9b77", "#54c9ff", "#ffcf8b"],
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#e8f6f2"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#bdd7d0" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                    ticks: { color: "#bdd7d0" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                }
            }
        }
    });
}

function clearFilters() {
    document.getElementById("search").value = "";
    document.getElementById("sort").value = "";
    renderExpenses();
}

async function loadReportSummary(updateModal = false) {
    const token = sessionStorage.getItem("token");
    const budgetInput = document.getElementById("reportBudget");
    const budget = budgetInput ? budgetInput.value || 50000 : 50000;

    try {
        const res = await fetch(`${API_URL}/report-summary?budget=${encodeURIComponent(budget)}`, {
            headers: { Authorization: token }
        });

        if (!res.ok) return;

        reportSummary = await res.json();
        document.getElementById("reportTotalSpent").innerText = Number(reportSummary.totalSpent).toLocaleString();
        document.getElementById("reportHighestCategory").innerText = reportSummary.highestCategory;
        document.getElementById("reportSavings").innerText = Number(reportSummary.savings).toLocaleString();

        if (updateModal) {
            document.getElementById("modalReportTotal").innerText = Number(reportSummary.totalSpent).toLocaleString();
            document.getElementById("modalHighestCategory").innerText = reportSummary.highestCategory;
            document.getElementById("modalSavings").innerText = Number(reportSummary.savings).toLocaleString();
        }
    } catch (error) {
        showToast("Unable to load report summary.", false);
    }
}

async function downloadReport() {
    const token = sessionStorage.getItem("token");
    const budget = document.getElementById("reportBudget").value || 50000;
    const format = document.getElementById("reportFormat").value;

    try {
        const res = await fetch(`${API_URL}/download-report?format=${encodeURIComponent(format)}&budget=${encodeURIComponent(budget)}`, {
            headers: { Authorization: token }
        });

        if (!res.ok) {
            const data = await res.json();
            showToast(data.msg || "Failed to download report.", false);
            return;
        }

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const disposition = res.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename=\"?([^"]+)\"?/);
        anchor.href = downloadUrl;
        anchor.download = match ? match[1] : `expense_report.${format}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(downloadUrl);
        showToast("Report downloaded.");
    } catch (error) {
        showToast("Failed to download report.", false);
    }
}

async function emailReport() {
    const token = sessionStorage.getItem("token");
    const budget = document.getElementById("reportBudget").value || 50000;
    const format = document.getElementById("reportFormat").value;
    const email = document.getElementById("reportEmail").value.trim();

    if (!email) {
        showToast("Enter a recipient email first.", false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/email-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ email, format, budget })
        });

        const data = await res.json();
        showToast(data.msg, res.ok);
    } catch (error) {
        showToast("Failed to send report email.", false);
    }
}

function getTopCategory(items) {
    if (!items.length) return "-";

    const totals = {};
    items.forEach(item => {
        totals[item.category] = (totals[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

function setEditMode(isEditing, title = "") {
    document.getElementById("formTitle").innerText = isEditing ? "Edit Expense" : "Add Expense";
    document.getElementById("formSubtitle").innerText = isEditing
        ? `Updating "${title}" with your latest details.`
        : "Create a fresh expense entry with category and date details.";
    document.getElementById("saveExpenseBtn").innerText = isEditing ? "Save Changes" : "Add Expense";
    document.getElementById("editBadge").innerText = isEditing ? "Editing entry" : "Ready to add";
}

function setTodayLabel() {
    const label = document.getElementById("todayLabel");
    const today = new Date();
    label.innerText = today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function updateGreeting() {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Start your morning with a quick money check-in." :
        hours < 18 ? "Keep your spending decisions sharp this afternoon." :
        "Wrap up the day with a clear view of your expenses.";
    document.getElementById("greetingText").innerText = greeting;
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

const reportBudgetInput = document.getElementById("reportBudget");
if (reportBudgetInput) {
    reportBudgetInput.addEventListener("input", () => loadReportSummary(true));
}

window.addEventListener("click", (event) => {
    if (event.target.id === "reportsModal") {
        closeReports();
    }
});
