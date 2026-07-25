/**
 * Global Universal State Class (Runes)
 * Replaces legacy 'svelte/store'
 */
class AppState {
  version = $state("1.0.0");
  theme = $state<"light" | "dark" | "system">("system");

  get isDark() {
    return this.theme === "dark";
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
  }
}

export const appState = new AppState();
