(function () {
    const STORAGE_KEY = "expense-tracker-theme";

    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") return saved;
        return "dark";
    }

    function applyTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        const toggle = document.getElementById("themeToggle");
        if (toggle) {
            toggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
        }
    }

    function toggleTheme() {
        const nextTheme = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
        localStorage.setItem(STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    }

    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(getPreferredTheme());
        const toggle = document.getElementById("themeToggle");
        if (toggle) {
            toggle.addEventListener("click", toggleTheme);
        }
    });
})();
