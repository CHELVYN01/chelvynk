import { browser } from '$app/environment';

export const theme = new class {
    _isDark = $state(false);

    get isDark() {
        return this._isDark;
    }

    set isDark(value: boolean) {
        this._isDark = value;
        if (browser) {
            if (value) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
        }
    }

    toggle() {
        this.isDark = !this.isDark;
    }

    init() {
        if (browser) {
            const stored = localStorage.getItem("theme");
            if (stored) {
                this.isDark = stored === "dark";
            } else {
                this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            }
        }
    }
};
