/**
 * CategoryNavigation - Handles category filtering and navigation UI
 */
class CategoryNavigation {
    constructor(containerElement, onCategoryChange) {
        this.container = containerElement;
        this.onCategoryChange = onCategoryChange || (() => {});
        this.currentCategory = 'all';
        this.categories = [];
        
        this.init();
    }
    
    /**
     * Initialize the category navigation component
     */
    init() {
        if (!this.container) {
            console.error('CategoryNavigation: Container element not found');
            return;
        }
        
        this.loadCategories();
    }
    
    /**
     * Load categories from EmojiData and render buttons
     */
    async loadCategories() {
        try {
            // Ensure emoji data is loaded
            if (!EmojiData.isLoaded()) {
                await EmojiData.loadEmojis();
            }
            
            // Get categories and their display names
            const categoryIds = EmojiData.getAllCategories();
            const displayNames = EmojiData.getCategoryDisplayNames();
            
            // Create category objects with icons
            this.categories = [
                { id: 'all', name: 'All', icon: '🌟' },
                ...categoryIds.map(id => ({
                    id,
                    name: displayNames[id] || this.formatCategoryName(id),
                    icon: this.getCategoryIcon(id)
                }))
            ];
            
            this.renderCategoryButtons();
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.renderErrorState();
        }
    }
    
    /**
     * Render category buttons in the container
     */
    renderCategoryButtons() {
        const buttonsHTML = this.categories.map(category => `
            <button 
                class="category-button ${category.id === this.currentCategory ? 'active' : ''}"
                data-category="${category.id}"
                title="Show ${category.name} emojis"
                aria-pressed="${category.id === this.currentCategory}"
            >
                <span class="category-icon">${category.icon}</span>
                <span class="category-label">${category.name}</span>
            </button>
        `).join('');
        
        this.container.innerHTML = buttonsHTML;
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Add event listeners to category buttons
     */
    addEventListeners() {
        const buttons = this.container.querySelectorAll('.category-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                const categoryId = event.currentTarget.dataset.category;
                this.selectCategory(categoryId);
            });
            
            // Keyboard support
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const categoryId = event.currentTarget.dataset.category;
                    this.selectCategory(categoryId);
                }
            });
        });
    }
    
    /**
     * Select a category and update UI
     * @param {string} categoryId - The category ID to select
     */
    selectCategory(categoryId) {
        if (categoryId === this.currentCategory) {
            return; // Already selected
        }
        
        // Update current category
        const previousCategory = this.currentCategory;
        this.currentCategory = categoryId;
        
        // Update button states
        this.updateButtonStates();
        
        // Notify listeners
        this.onCategoryChange(categoryId, previousCategory);
        
        // Announce to screen readers
        this.announceCategory(categoryId);
    }
    
    /**
     * Update active states of category buttons
     */
    updateButtonStates() {
        const buttons = this.container.querySelectorAll('.category-button');
        
        buttons.forEach(button => {
            const isActive = button.dataset.category === this.currentCategory;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }
    
    /**
     * Get the currently selected category
     * @returns {string} Current category ID
     */
    getCurrentCategory() {
        return this.currentCategory;
    }
    
    /**
     * Set the current category programmatically
     * @param {string} categoryId - Category ID to set
     */
    setCurrentCategory(categoryId) {
        if (this.categories.some(cat => cat.id === categoryId)) {
            this.selectCategory(categoryId);
        }
    }
    
    /**
     * Get category icon for a given category ID
     * @param {string} categoryId - Category ID
     * @returns {string} Emoji icon for the category
     */
    getCategoryIcon(categoryId) {
        const icons = {
            'smileys-emotion': '😀',
            'animals-nature': '🐶',
            'food-drink': '🍎',
            'activities': '⚽',
            'travel-places': '🚗',
            'objects': '💡',
            'symbols': '❤️',
            'flags': '🏳️'
        };
        
        return icons[categoryId] || '📁';
    }
    
    /**
     * Format category name for display
     * @param {string} categoryId - Category ID
     * @returns {string} Formatted category name
     */
    formatCategoryName(categoryId) {
        return categoryId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' & ');
    }
    
    /**
     * Announce category change to screen readers
     * @param {string} categoryId - Selected category ID
     */
    announceCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (category) {
            const message = categoryId === 'all' 
                ? 'Showing all emojis'
                : `Showing ${category.name} emojis`;
            
            // Create temporary announcement element
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            // Remove after announcement
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }
    }
    
    /**
     * Render error state when categories fail to load
     */
    renderErrorState() {
        this.container.innerHTML = `
            <div class="category-error" style="padding: 1rem; color: #ef4444; text-align: center;">
                <span>Failed to load categories</span>
                <button onclick="location.reload()" style="margin-left: 0.5rem; color: #6366f1; text-decoration: underline; background: none; border: none; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
    
    /**
     * Get all available categories
     * @returns {Array} Array of category objects
     */
    getCategories() {
        return [...this.categories];
    }
    
    /**
     * Refresh categories (useful when emoji data is updated)
     */
    async refresh() {
        await this.loadCategories();
    }
}

// Add screen reader only class to CSS if not already present
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryNavigation;
}