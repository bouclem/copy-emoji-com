/**
 * ThemeManager - Handles dark/light mode switching
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.toggleButton = null;
        this.themeIcon = null;
        
        this.init();
    }
    
    /**
     * Initialize the theme manager
     */
    init() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.themeIcon = this.toggleButton?.querySelector('.theme-icon');
        
        if (!this.toggleButton) {
            console.error('Theme toggle button not found');
            return;
        }
        
        // Load saved theme or detect system preference
        this.loadTheme();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('ThemeManager initialized');
    }
    
    /**
     * Load theme from localStorage or system preference
     */
    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('emoji-copy-theme');
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Keyboard support
        this.toggleButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleTheme();
            }
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('emoji-copy-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Save user preference
        localStorage.setItem('emoji-copy-theme', newTheme);
        
        // Announce theme change to screen readers
        this.announceThemeChange(newTheme);
    }
    
    /**
     * Set the theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('Invalid theme:', theme);
            return;
        }
        
        this.currentTheme = theme;
        
        // Update body class
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update toggle button icon and aria-label
        this.updateToggleButton();
        
        console.log('Theme set to:', theme);
    }
    
    /**
     * Update the toggle button appearance and accessibility
     */
    updateToggleButton() {
        if (!this.themeIcon) return;
        
        if (this.currentTheme === 'dark') {
            this.themeIcon.textContent = '☀️';
            this.toggleButton.setAttribute('aria-label', 'Switch to light mode');
            this.toggleButton.setAttribute('title', 'Switch to light mode');
        } else {
            this.themeIcon.textContent = '🌙';
            this.toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            this.toggleButton.setAttribute('title', 'Switch to dark mode');
        }
    }
    
    /**
     * Announce theme change to screen readers
     * @param {string} theme - The new theme
     */
    announceThemeChange(theme) {
        const message = `Switched to ${theme} mode`;
        
        // Create temporary announcement element
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Check if dark mode is active
     * @returns {boolean} True if dark mode is active
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
    
    /**
     * Force set theme without saving to localStorage
     * @param {string} theme - 'light' or 'dark'
     */
    forceSetTheme(theme) {
        this.setTheme(theme);
    }
    
    /**
     * Reset theme to system preference
     */
    resetToSystemTheme() {
        localStorage.removeItem('emoji-copy-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}