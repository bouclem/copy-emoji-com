/**
 * Emoji Copy Website - Main Application Entry Point
 * 
 * This file serves as the main entry point for the emoji copy website.
 * It will coordinate all components and handle application initialization.
 */

console.log('Main.js is loading...');

// Application state
const AppState = {
    currentCategory: 'all',
    searchQuery: '',
    emojis: [],
    categories: [],
    recentlyUsed: []
};

// Global instances
let copyFeedbackManager = null;
let categoryNavigation = null;
let emojiGrid = null;
let themeManager = null;
let recentlyUsedManager = null;

// DOM element references
const DOMElements = {
    searchInput: null,
    categoryButtons: null,
    emojiGrid: null,
    recentlyUsedList: null,
    notification: null
};

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Emoji Copy Website - Initializing...');
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize components (placeholder for now)
    initializeComponents();
    
    console.log('Application initialized successfully');
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
    console.log('Caching DOM elements...');
    
    DOMElements.searchInput = document.getElementById('search-input');
    DOMElements.categoryButtons = document.getElementById('category-buttons');
    DOMElements.emojiGrid = document.getElementById('emoji-grid');
    DOMElements.recentlyUsedList = document.getElementById('recently-used-list');
    DOMElements.notification = document.getElementById('notification');
    
    console.log('DOM Elements found:', {
        searchInput: !!DOMElements.searchInput,
        categoryButtons: !!DOMElements.categoryButtons,
        emojiGrid: !!DOMElements.emojiGrid,
        recentlyUsedList: !!DOMElements.recentlyUsedList,
        notification: !!DOMElements.notification
    });
    
    // Verify all elements were found
    const missingElements = Object.entries(DOMElements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
    } else {
        console.log('All DOM elements found successfully');
    }
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Search input event listener (with debouncing)
    if (DOMElements.searchInput) {
        let searchTimeout;
        DOMElements.searchInput.addEventListener('input', (event) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(event.target.value);
            }, 300); // 300ms debounce
        });
    }
    
    // Keyboard navigation support
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Initialize application components (placeholder)
 */
function initializeComponents() {
    console.log('Initializing components...');
    
    // Check if required classes are available
    if (typeof ClipboardManager === 'undefined') {
        console.error('ClipboardManager not found!');
        showNotification('ClipboardManager not loaded', 'error');
        return;
    }
    
    if (typeof CopyFeedbackManager === 'undefined') {
        console.error('CopyFeedbackManager not found!');
        showNotification('CopyFeedbackManager not loaded', 'error');
        return;
    }
    
    if (typeof CategoryNavigation === 'undefined') {
        console.error('CategoryNavigation not found!');
        showNotification('CategoryNavigation not loaded', 'error');
        return;
    }
    
    if (typeof EmojiGrid === 'undefined') {
        console.error('EmojiGrid not found!');
        showNotification('EmojiGrid not loaded', 'error');
        return;
    }
    
    if (typeof ThemeManager === 'undefined') {
        console.error('ThemeManager not found!');
        showNotification('ThemeManager not loaded', 'error');
        return;
    }
    
    if (typeof RecentlyUsedManager === 'undefined') {
        console.error('RecentlyUsedManager not found!');
        showNotification('RecentlyUsedManager not loaded', 'error');
        return;
    }
    
    try {
        // Initialize theme manager first (affects visual appearance)
        themeManager = new ThemeManager();
        console.log('ThemeManager initialized successfully');
        
        // Initialize recently used manager
        recentlyUsedManager = new RecentlyUsedManager(
            DOMElements.recentlyUsedList,
            handleEmojiClick
        );
        console.log('RecentlyUsedManager initialized successfully');
        // Initialize copy feedback manager
        copyFeedbackManager = new CopyFeedbackManager();
        console.log('CopyFeedbackManager initialized successfully');
        
        // Initialize emoji grid
        emojiGrid = new EmojiGrid(
            DOMElements.emojiGrid,
            handleEmojiClick
        );
        console.log('EmojiGrid initialized successfully');
        
        // Initialize category navigation
        categoryNavigation = new CategoryNavigation(
            DOMElements.categoryButtons,
            handleCategoryChange
        );
        console.log('CategoryNavigation initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize components:', error);
        showNotification('Failed to initialize application components', 'error');
    }
    
    // Placeholder for other component initialization
    // This will be expanded in future tasks
    
    // Show placeholder content
    showPlaceholderContent();
}

/**
 * Handle search functionality
 */
function handleSearch(query) {
    console.log('Search query:', query);
    AppState.searchQuery = query;
    
    // Update emoji grid filter
    if (emojiGrid) {
        emojiGrid.filterBySearch(query);
    }
}

/**
 * Handle category change from navigation
 * @param {string} categoryId - Selected category ID
 * @param {string} previousCategoryId - Previously selected category ID
 */
function handleCategoryChange(categoryId, previousCategoryId) {
    console.log(`Category changed from ${previousCategoryId} to ${categoryId}`);
    AppState.currentCategory = categoryId;
    
    // Update emoji grid filter
    if (emojiGrid) {
        emojiGrid.filterByCategory(categoryId);
    }
}

/**
 * Handle emoji click from grid
 * @param {string} emoji - Emoji unicode
 * @param {string} name - Emoji name
 */
async function handleEmojiClick(emoji, name) {
    console.log(`Emoji clicked: ${emoji} (${name})`);
    
    // Copy emoji to clipboard
    const success = await copyEmojiWithFeedback(emoji, name);
    
    if (success && recentlyUsedManager) {
        // Add to recently used
        recentlyUsedManager.addEmoji(emoji, name);
    }
}

/**
 * Handle keyboard navigation (placeholder)
 */
function handleKeyboardNavigation(event) {
    // Placeholder for keyboard navigation
    // This will be implemented in future tasks
    
    // Basic escape key handling for accessibility
    if (event.key === 'Escape') {
        if (DOMElements.searchInput && document.activeElement === DOMElements.searchInput) {
            DOMElements.searchInput.blur();
        }
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Placeholder for responsive behavior adjustments
    // This will be expanded in future tasks
}

/**
 * Show placeholder content while components are being developed
 */
function showPlaceholderContent() {
    console.log('Showing placeholder content...');
    
    // Recently used section will be populated by RecentlyUsedManager
    // Emoji grid and category buttons will be populated by their respective components
}



/**
 * Utility function to show notifications
 * Now uses the enhanced notification system
 */
function showNotification(message, type = 'success') {
    if (copyFeedbackManager) {
        copyFeedbackManager.getNotificationSystem().show(message, type);
    } else {
        // Fallback for when copyFeedbackManager is not initialized
        if (!DOMElements.notification) return;
        
        DOMElements.notification.textContent = message;
        DOMElements.notification.className = `notification ${type} show`;
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            DOMElements.notification.classList.remove('show');
        }, 3000);
    }
}

/**
 * Copy emoji with feedback - utility function for other components
 * @param {string} emoji - The emoji to copy
 * @param {string} emojiName - Optional name of the emoji
 * @returns {Promise<boolean>} Success status
 */
async function copyEmojiWithFeedback(emoji, emojiName = '') {
    if (copyFeedbackManager) {
        return await copyFeedbackManager.copyEmojiWithFeedback(emoji, emojiName);
    } else {
        console.error('CopyFeedbackManager not initialized');
        showNotification('Copy system not ready', 'error');
        return false;
    }
}

/**
 * Error handling for the application
 */
function handleError(error, context = 'Application') {
    console.error(`${context} Error:`, error);
    showNotification('An error occurred. Please try again.', 'error');
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export functions for potential testing or module usage
window.EmojiCopyApp = {
    initializeApp,
    showNotification,
    copyEmojiWithFeedback,
    handleError,
    handleCategoryChange,
    handleEmojiClick,
    AppState,
    DOMElements,
    getCopyFeedbackManager: () => copyFeedbackManager,
    getCategoryNavigation: () => categoryNavigation,
    getEmojiGrid: () => emojiGrid,
    getThemeManager: () => themeManager,
    getRecentlyUsedManager: () => recentlyUsedManager
};