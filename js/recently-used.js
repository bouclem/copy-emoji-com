/**
 * RecentlyUsedManager - Handles recently used emojis storage and display
 */
class RecentlyUsedManager {
    constructor(containerElement, onEmojiClick) {
        this.container = containerElement;
        this.onEmojiClick = onEmojiClick || (() => {});
        this.recentlyUsed = [];
        this.maxItems = 20; // Maximum number of recently used emojis to store
        this.storageKey = 'emoji-copy-recently-used';
        
        this.init();
    }
    
    /**
     * Initialize the recently used manager
     */
    init() {
        if (!this.container) {
            console.error('RecentlyUsedManager: Container element not found');
            return;
        }
        
        this.loadFromStorage();
        this.render();
        
        console.log('RecentlyUsedManager initialized');
    }
    
    /**
     * Load recently used emojis from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.recentlyUsed = JSON.parse(stored);
                // Validate the data structure
                this.recentlyUsed = this.recentlyUsed.filter(item => 
                    item && typeof item === 'object' && item.emoji && item.name
                );
            }
        } catch (error) {
            console.error('Failed to load recently used emojis:', error);
            this.recentlyUsed = [];
        }
    }
    
    /**
     * Save recently used emojis to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.recentlyUsed));
        } catch (error) {
            console.error('Failed to save recently used emojis:', error);
        }
    }
    
    /**
     * Add an emoji to recently used
     * @param {string} emoji - Emoji unicode
     * @param {string} name - Emoji name
     */
    addEmoji(emoji, name) {
        if (!emoji || !name) {
            console.error('Invalid emoji data provided');
            return;
        }
        
        const emojiData = {
            emoji: emoji,
            name: name,
            timestamp: Date.now()
        };
        
        // Remove if already exists (to move to front)
        this.recentlyUsed = this.recentlyUsed.filter(item => item.emoji !== emoji);
        
        // Add to front
        this.recentlyUsed.unshift(emojiData);
        
        // Limit to max items
        if (this.recentlyUsed.length > this.maxItems) {
            this.recentlyUsed = this.recentlyUsed.slice(0, this.maxItems);
        }
        
        // Save and re-render
        this.saveToStorage();
        this.render();
        
        console.log('Added emoji to recently used:', emoji, name);
    }
    
    /**
     * Remove an emoji from recently used
     * @param {string} emoji - Emoji unicode to remove
     */
    removeEmoji(emoji) {
        this.recentlyUsed = this.recentlyUsed.filter(item => item.emoji !== emoji);
        this.saveToStorage();
        this.render();
    }
    
    /**
     * Clear all recently used emojis
     */
    clear() {
        this.recentlyUsed = [];
        this.saveToStorage();
        this.render();
    }
    
    /**
     * Render the recently used emojis
     */
    render() {
        if (this.recentlyUsed.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const emojiButtons = this.recentlyUsed.map(item => 
            this.createEmojiButton(item)
        ).join('');
        
        this.container.innerHTML = emojiButtons;
        this.addEventListeners();
    }
    
    /**
     * Create HTML for a recently used emoji button
     * @param {Object} emojiData - Emoji data object
     * @returns {string} HTML string for emoji button
     */
    createEmojiButton(emojiData) {
        const { emoji, name } = emojiData;
        
        return `
            <button 
                class="emoji-button recently-used-emoji"
                data-emoji="${emoji}"
                data-name="${name}"
                title="${name}"
                aria-label="Copy ${name} emoji (recently used)"
                role="listitem"
            >
                ${emoji}
            </button>
        `;
    }
    
    /**
     * Add event listeners to recently used emoji buttons
     */
    addEventListeners() {
        const buttons = this.container.querySelectorAll('.recently-used-emoji');
        
        buttons.forEach(button => {
            // Click handler
            button.addEventListener('click', (event) => {
                const emoji = event.currentTarget.dataset.emoji;
                const name = event.currentTarget.dataset.name;
                this.handleEmojiClick(emoji, name, event.currentTarget);
            });
            
            // Keyboard support
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const emoji = event.currentTarget.dataset.emoji;
                    const name = event.currentTarget.dataset.name;
                    this.handleEmojiClick(emoji, name, event.currentTarget);
                }
            });
            
            // Context menu for removal (right-click)
            button.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                const emoji = event.currentTarget.dataset.emoji;
                this.showRemoveOption(emoji, event.currentTarget);
            });
        });
    }
    
    /**
     * Handle emoji button click
     * @param {string} emoji - Emoji unicode
     * @param {string} name - Emoji name
     * @param {HTMLElement} buttonElement - Button element that was clicked
     */
    handleEmojiClick(emoji, name, buttonElement) {
        // Add visual feedback
        this.addClickFeedback(buttonElement);
        
        // Move to front of recently used (since it was used again)
        this.addEmoji(emoji, name);
        
        // Notify parent component
        this.onEmojiClick(emoji, name);
    }
    
    /**
     * Add visual feedback when emoji is clicked
     * @param {HTMLElement} buttonElement - Button element
     */
    addClickFeedback(buttonElement) {
        buttonElement.classList.add('clicked');
        
        setTimeout(() => {
            buttonElement.classList.remove('clicked');
        }, 200);
    }
    
    /**
     * Show option to remove emoji from recently used
     * @param {string} emoji - Emoji to remove
     * @param {HTMLElement} buttonElement - Button element
     */
    showRemoveOption(emoji, buttonElement) {
        // Simple confirmation for now
        const emojiData = this.recentlyUsed.find(item => item.emoji === emoji);
        if (emojiData && confirm(`Remove ${emojiData.name} from recently used?`)) {
            this.removeEmoji(emoji);
        }
    }
    
    /**
     * Render empty state when no recently used emojis
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="recently-used-empty" role="status">
                <span class="empty-text">Recently used emojis will appear here</span>
            </div>
        `;
    }
    
    /**
     * Get recently used emojis
     * @returns {Array} Array of recently used emoji objects
     */
    getRecentlyUsed() {
        return [...this.recentlyUsed];
    }
    
    /**
     * Get recently used count
     * @returns {number} Number of recently used emojis
     */
    getCount() {
        return this.recentlyUsed.length;
    }
    
    /**
     * Check if an emoji is in recently used
     * @param {string} emoji - Emoji unicode to check
     * @returns {boolean} True if emoji is in recently used
     */
    hasEmoji(emoji) {
        return this.recentlyUsed.some(item => item.emoji === emoji);
    }
    
    /**
     * Set maximum number of items to store
     * @param {number} max - Maximum number of items
     */
    setMaxItems(max) {
        if (max > 0) {
            this.maxItems = max;
            
            // Trim if necessary
            if (this.recentlyUsed.length > this.maxItems) {
                this.recentlyUsed = this.recentlyUsed.slice(0, this.maxItems);
                this.saveToStorage();
                this.render();
            }
        }
    }
    
    /**
     * Export recently used data (for backup/sync)
     * @returns {string} JSON string of recently used data
     */
    exportData() {
        return JSON.stringify(this.recentlyUsed);
    }
    
    /**
     * Import recently used data (for backup/sync)
     * @param {string} jsonData - JSON string of recently used data
     */
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.recentlyUsed = imported.filter(item => 
                    item && typeof item === 'object' && item.emoji && item.name
                ).slice(0, this.maxItems);
                
                this.saveToStorage();
                this.render();
            }
        } catch (error) {
            console.error('Failed to import recently used data:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecentlyUsedManager;
}