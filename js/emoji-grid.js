/**
 * EmojiGrid - Handles emoji display and interaction in a responsive grid
 */
class EmojiGrid {
    constructor(containerElement, onEmojiClick) {
        this.container = containerElement;
        this.onEmojiClick = onEmojiClick || (() => {});
        this.emojis = [];
        this.filteredEmojis = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }
    
    /**
     * Initialize the emoji grid component
     */
    init() {
        if (!this.container) {
            console.error('EmojiGrid: Container element not found');
            return;
        }
        
        this.loadEmojis();
    }
    
    /**
     * Load emojis from EmojiData
     */
    async loadEmojis() {
        try {
            // Ensure emoji data is loaded
            if (!EmojiData.isLoaded()) {
                await EmojiData.loadEmojis();
            }
            
            this.emojis = EmojiData.getAllEmojis();
            this.filteredEmojis = [...this.emojis];
            
            this.renderEmojis();
            
        } catch (error) {
            console.error('Failed to load emojis:', error);
            this.renderErrorState();
        }
    }
    
    /**
     * Render emojis in the grid
     */
    renderEmojis() {
        if (this.filteredEmojis.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const emojiButtons = this.filteredEmojis.map(emoji => 
            this.createEmojiButton(emoji)
        ).join('');
        
        this.container.innerHTML = emojiButtons;
        this.addEventListeners();
    }
    
    /**
     * Create HTML for an emoji button
     * @param {Object} emoji - Emoji object
     * @returns {string} HTML string for emoji button
     */
    createEmojiButton(emoji) {
        const name = emoji.name || 'Unknown emoji';
        const unicode = emoji.unicode || '❓';
        
        return `
            <button 
                class="emoji-button"
                data-emoji="${unicode}"
                data-name="${name}"
                title="${name}"
                aria-label="Copy ${name} emoji"
                role="gridcell"
            >
                ${unicode}
            </button>
        `;
    }
    
    /**
     * Add event listeners to emoji buttons
     */
    addEventListeners() {
        const buttons = this.container.querySelectorAll('.emoji-button');
        
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
        
        // Notify parent component
        this.onEmojiClick(emoji, name);
    }
    
    /**
     * Add visual feedback when emoji is clicked
     * @param {HTMLElement} buttonElement - Button element
     */
    addClickFeedback(buttonElement) {
        // Add temporary class for animation
        buttonElement.classList.add('clicked');
        
        // Remove class after animation
        setTimeout(() => {
            buttonElement.classList.remove('clicked');
        }, 200);
    }
    
    /**
     * Filter emojis by category
     * @param {string} categoryId - Category ID to filter by
     */
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.applyFilters();
    }
    
    /**
     * Filter emojis by search query
     * @param {string} query - Search query
     */
    filterBySearch(query) {
        this.searchQuery = query;
        this.applyFilters();
    }
    
    /**
     * Apply current filters to emoji list
     */
    applyFilters() {
        let filtered = [...this.emojis];
        
        // Apply category filter
        if (this.currentCategory && this.currentCategory !== 'all') {
            filtered = filtered.filter(emoji => emoji.category === this.currentCategory);
        }
        
        // Apply search filter
        if (this.searchQuery && this.searchQuery.trim()) {
            const searchResults = EmojiData.search(this.searchQuery);
            const searchEmojiUnicodes = new Set(searchResults.map(result => result.unicode));
            filtered = filtered.filter(emoji => searchEmojiUnicodes.has(emoji.unicode));
        }
        
        this.filteredEmojis = filtered;
        this.renderEmojis();
        
        // Announce results to screen readers
        this.announceResults();
    }
    
    /**
     * Announce search/filter results to screen readers
     */
    announceResults() {
        const count = this.filteredEmojis.length;
        let message = '';
        
        if (this.searchQuery && this.searchQuery.trim()) {
            message = `Found ${count} emoji${count !== 1 ? 's' : ''} matching "${this.searchQuery}"`;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.currentCategory.replace('-', ' ');
            message = `Showing ${count} emoji${count !== 1 ? 's' : ''} in ${categoryName} category`;
        } else {
            message = `Showing all ${count} emoji${count !== 1 ? 's' : ''}`;
        }
        
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
     * Render empty state when no emojis match filters
     */
    renderEmptyState() {
        let message = 'No emojis found';
        let suggestion = '';
        
        if (this.searchQuery && this.searchQuery.trim()) {
            message = `No emojis found for "${this.searchQuery}"`;
            suggestion = 'Try a different search term or browse categories.';
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            message = `No emojis found in this category`;
            suggestion = 'Try selecting a different category.';
        }
        
        this.container.innerHTML = `
            <div class="emoji-grid-empty" role="status" aria-live="polite">
                <div class="empty-icon">😔</div>
                <div class="empty-message">${message}</div>
                ${suggestion ? `<div class="empty-suggestion">${suggestion}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * Render error state when emojis fail to load
     */
    renderErrorState() {
        this.container.innerHTML = `
            <div class="emoji-grid-error" role="alert">
                <div class="error-icon">⚠️</div>
                <div class="error-message">Failed to load emojis</div>
                <button onclick="location.reload()" class="error-retry">
                    Try Again
                </button>
            </div>
        `;
    }
    
    /**
     * Get current filtered emojis
     * @returns {Array} Array of filtered emoji objects
     */
    getFilteredEmojis() {
        return [...this.filteredEmojis];
    }
    
    /**
     * Get total emoji count
     * @returns {number} Total number of emojis
     */
    getTotalCount() {
        return this.emojis.length;
    }
    
    /**
     * Get filtered emoji count
     * @returns {number} Number of filtered emojis
     */
    getFilteredCount() {
        return this.filteredEmojis.length;
    }
    
    /**
     * Refresh the emoji grid (useful when data is updated)
     */
    async refresh() {
        await this.loadEmojis();
    }
    
    /**
     * Clear all filters and show all emojis
     */
    clearFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.filteredEmojis = [...this.emojis];
        this.renderEmojis();
    }
    
    /**
     * Scroll to top of the grid
     */
    scrollToTop() {
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmojiGrid;
}