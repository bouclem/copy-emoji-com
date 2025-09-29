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
    
    try {
        // Initialize copy feedback manager
        copyFeedbackManager = new CopyFeedbackManager();
        console.log('CopyFeedbackManager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize CopyFeedbackManager:', error);
        showNotification('Failed to initialize copy system', 'error');
    }
    
    // Placeholder for other component initialization
    // This will be expanded in future tasks
    
    // Show placeholder content
    showPlaceholderContent();
}

/**
 * Handle search functionality (placeholder)
 */
function handleSearch(query) {
    console.log('Search query:', query);
    AppState.searchQuery = query;
    
    // Placeholder for search implementation
    // This will be implemented in future tasks
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
    
    // Add actual emojis to the grid for testing clipboard functionality
    if (DOMElements.emojiGrid) {
        console.log('Adding emojis to emoji grid');
        
        // Sample emojis for testing
        const sampleEmojis = [
            { emoji: '😀', name: 'grinning face' },
            { emoji: '😃', name: 'grinning face with big eyes' },
            { emoji: '😄', name: 'grinning face with smiling eyes' },
            { emoji: '😁', name: 'beaming face with smiling eyes' },
            { emoji: '😆', name: 'grinning squinting face' },
            { emoji: '😅', name: 'grinning face with sweat' },
            { emoji: '🤣', name: 'rolling on the floor laughing' },
            { emoji: '😂', name: 'face with tears of joy' },
            { emoji: '🙂', name: 'slightly smiling face' },
            { emoji: '🙃', name: 'upside down face' },
            { emoji: '😉', name: 'winking face' },
            { emoji: '😊', name: 'smiling face with smiling eyes' },
            { emoji: '😇', name: 'smiling face with halo' },
            { emoji: '🥰', name: 'smiling face with hearts' },
            { emoji: '😍', name: 'smiling face with heart-eyes' },
            { emoji: '🤩', name: 'star-struck' },
            { emoji: '😘', name: 'face blowing a kiss' },
            { emoji: '😗', name: 'kissing face' },
            { emoji: '😚', name: 'kissing face with closed eyes' },
            { emoji: '😙', name: 'kissing face with smiling eyes' },
            { emoji: '❤️', name: 'red heart' },
            { emoji: '🧡', name: 'orange heart' },
            { emoji: '💛', name: 'yellow heart' },
            { emoji: '💚', name: 'green heart' },
            { emoji: '💙', name: 'blue heart' },
            { emoji: '💜', name: 'purple heart' },
            { emoji: '🖤', name: 'black heart' },
            { emoji: '🤍', name: 'white heart' },
            { emoji: '🤎', name: 'brown heart' },
            { emoji: '💔', name: 'broken heart' },
            { emoji: '💕', name: 'two hearts' },
            { emoji: '💖', name: 'sparkling heart' },
            { emoji: '💗', name: 'growing heart' },
            { emoji: '💘', name: 'heart with arrow' },
            { emoji: '💝', name: 'heart with ribbon' },
            { emoji: '💟', name: 'heart decoration' },
            { emoji: '🎉', name: 'party popper' },
            { emoji: '🎊', name: 'confetti ball' },
            { emoji: '🎈', name: 'balloon' },
            { emoji: '🎁', name: 'wrapped gift' },
            { emoji: '🎂', name: 'birthday cake' },
            { emoji: '🎄', name: 'Christmas tree' },
            { emoji: '🚀', name: 'rocket' },
            { emoji: '✨', name: 'sparkles' },
            { emoji: '🌟', name: 'glowing star' },
            { emoji: '⭐', name: 'star' },
            { emoji: '🔥', name: 'fire' },
            { emoji: '💯', name: 'hundred points' }
        ];
        
        // Create emoji buttons
        const emojiButtons = sampleEmojis.map(({emoji, name}) => 
            `<button class="emoji-button" onclick="testCopyEmoji('${emoji}', '${name}')" title="${name}">${emoji}</button>`
        ).join('');
        
        DOMElements.emojiGrid.innerHTML = emojiButtons;
        console.log('Emoji grid populated with', sampleEmojis.length, 'emojis');
    } else {
        console.error('Emoji grid element not found!');
    }
    
    // Add placeholder message to recently used section
    if (DOMElements.recentlyUsedList) {
        DOMElements.recentlyUsedList.innerHTML = `
            <div style="padding: 1rem; color: #6b7280; font-style: italic;">
                Recently used emojis will appear here
            </div>
        `;
    }
    
    // Add placeholder category buttons
    if (DOMElements.categoryButtons) {
        DOMElements.categoryButtons.innerHTML = `
            <div style="padding: 1rem; color: #6b7280; font-style: italic;">
                Category navigation will be added in upcoming tasks
            </div>
        `;
    }
}

/**
 * Test function for copying emojis (used by placeholder buttons)
 * @param {string} emoji - The emoji to copy
 * @param {string} name - The name of the emoji
 */
async function testCopyEmoji(emoji, name) {
    console.log(`Testing copy for emoji: ${emoji} (${name})`);
    
    if (copyFeedbackManager) {
        await copyEmojiWithFeedback(emoji, name);
    } else {
        console.warn('Copy system not ready, showing fallback message');
        showNotification(`Would copy ${emoji} (${name}) - Copy system not ready`, 'warning');
    }
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
    AppState,
    DOMElements,
    getCopyFeedbackManager: () => copyFeedbackManager
};