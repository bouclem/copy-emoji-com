/**
 * EmojiCopyManager - Integrates emoji copying with recently used tracking
 * 
 * This class provides a unified interface for copying emojis that automatically
 * tracks them in the recently used list and provides feedback to the user.
 */

class EmojiCopyManager {
    static #copyListeners = [];
    static #isInitialized = false;

    /**
     * Initialize the emoji copy manager
     * @returns {Promise<void>}
     */
    static async initialize() {
        if (this.#isInitialized) {
            return;
        }

        // Initialize RecentlyUsed system
        await RecentlyUsed.initialize();
        
        this.#isInitialized = true;
        console.log('EmojiCopyManager initialized successfully');
    }

    /**
     * Copy an emoji to clipboard and add it to recently used
     * @param {Object} emoji - Emoji object with unicode, name, category, keywords, codepoint
     * @param {Object} options - Optional configuration
     * @param {boolean} options.addToRecent - Whether to add to recently used (default: true)
     * @param {boolean} options.showFeedback - Whether to show copy feedback (default: true)
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    static async copyEmoji(emoji, options = {}) {
        const config = {
            addToRecent: true,
            showFeedback: true,
            ...options
        };

        if (!emoji || typeof emoji !== 'object') {
            throw new Error('Invalid emoji object provided');
        }

        if (!emoji.unicode) {
            throw new Error('Emoji object must have unicode property');
        }

        try {
            // Ensure we're initialized
            if (!this.#isInitialized) {
                await this.initialize();
            }

            // Copy to clipboard
            const success = await ClipboardManager.copyEmoji(emoji.unicode);
            
            if (success) {
                // Add to recently used if requested
                if (config.addToRecent) {
                    try {
                        RecentlyUsed.add(emoji);
                    } catch (error) {
                        console.warn('Failed to add emoji to recently used:', error);
                        // Don't fail the copy operation if recently used fails
                    }
                }

                // Notify listeners
                this.#notifyListeners('copy', {
                    emoji,
                    success: true,
                    timestamp: Date.now()
                });

                // Show feedback if requested
                if (config.showFeedback) {
                    this.#showCopyFeedback(emoji);
                }

                return true;
            } else {
                this.#notifyListeners('copy', {
                    emoji,
                    success: false,
                    error: 'Copy operation failed',
                    timestamp: Date.now()
                });
                return false;
            }
        } catch (error) {
            this.#notifyListeners('copy', {
                emoji,
                success: false,
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Copy emoji by unicode character
     * @param {string} unicode - Unicode character of the emoji
     * @param {Object} emojiData - Optional emoji data object for recently used
     * @param {Object} options - Optional configuration
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    static async copyEmojiByUnicode(unicode, emojiData = null, options = {}) {
        if (!unicode || typeof unicode !== 'string') {
            throw new Error('Invalid unicode provided');
        }

        // If no emoji data provided, create a minimal object
        const emoji = emojiData || {
            unicode: unicode,
            name: `emoji ${unicode}`,
            category: 'unknown',
            keywords: [],
            codepoint: unicode.codePointAt(0).toString(16).toUpperCase()
        };

        return await this.copyEmoji(emoji, options);
    }

    /**
     * Get recently used emojis that are clickable/copyable
     * @param {number} limit - Maximum number of emojis to return
     * @returns {Array} Array of recently used emoji objects with copy handlers
     */
    static getRecentlyUsedEmojis(limit = 20) {
        if (!this.#isInitialized) {
            console.warn('EmojiCopyManager not initialized, returning empty array');
            return [];
        }

        const recentEmojis = RecentlyUsed.getWithLimit(limit);
        
        // Add copy handler to each emoji
        return recentEmojis.map(emoji => ({
            ...emoji,
            copy: async (options = {}) => {
                return await this.copyEmoji(emoji, { ...options, addToRecent: false });
            }
        }));
    }

    /**
     * Create a clickable emoji element that copies when clicked
     * @param {Object} emoji - Emoji object
     * @param {Object} options - Optional configuration
     * @param {string} options.className - CSS class for the element
     * @param {boolean} options.showTooltip - Whether to show tooltip with emoji name
     * @returns {HTMLElement} Clickable emoji element
     */
    static createClickableEmoji(emoji, options = {}) {
        const config = {
            className: 'emoji-clickable',
            showTooltip: true,
            ...options
        };

        if (!emoji || !emoji.unicode) {
            throw new Error('Invalid emoji object provided');
        }

        const element = document.createElement('button');
        element.className = config.className;
        element.textContent = emoji.unicode;
        element.type = 'button';
        
        // Add accessibility attributes
        element.setAttribute('aria-label', `Copy ${emoji.name || emoji.unicode} emoji`);
        element.setAttribute('title', emoji.name || emoji.unicode);
        
        // Add tooltip if requested
        if (config.showTooltip && emoji.name) {
            element.title = emoji.name;
        }

        // Add click handler
        element.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await this.copyEmoji(emoji);
            } catch (error) {
                console.error('Failed to copy emoji:', error);
                this.#showErrorFeedback(emoji, error.message);
            }
        });

        // Add keyboard support
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                element.click();
            }
        });

        return element;
    }

    /**
     * Create a recently used emojis container
     * @param {Object} options - Configuration options
     * @param {number} options.limit - Maximum number of emojis to show
     * @param {string} options.containerClass - CSS class for container
     * @param {string} options.emojiClass - CSS class for emoji buttons
     * @returns {HTMLElement} Container element with recently used emojis
     */
    static createRecentlyUsedContainer(options = {}) {
        const config = {
            limit: 20,
            containerClass: 'recently-used-container',
            emojiClass: 'recently-used-emoji',
            ...options
        };

        const container = document.createElement('div');
        container.className = config.containerClass;
        container.setAttribute('aria-label', 'Recently used emojis');

        this.updateRecentlyUsedContainer(container, config);

        return container;
    }

    /**
     * Update a recently used container with current emojis
     * @param {HTMLElement} container - Container element to update
     * @param {Object} options - Configuration options
     */
    static updateRecentlyUsedContainer(container, options = {}) {
        const config = {
            limit: 20,
            emojiClass: 'recently-used-emoji',
            ...options
        };

        if (!container || (typeof HTMLElement !== 'undefined' && !(container instanceof HTMLElement)) || 
            (typeof HTMLElement === 'undefined' && typeof container !== 'object')) {
            throw new Error('Invalid container element provided');
        }

        // Clear existing content
        container.innerHTML = '';

        const recentEmojis = this.getRecentlyUsedEmojis(config.limit);

        if (recentEmojis.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'recently-used-empty';
            emptyMessage.textContent = 'No recently used emojis';
            emptyMessage.setAttribute('aria-label', 'No recently used emojis');
            container.appendChild(emptyMessage);
            return;
        }

        recentEmojis.forEach(emoji => {
            const emojiElement = this.createClickableEmoji(emoji, {
                className: config.emojiClass
            });
            container.appendChild(emojiElement);
        });
    }

    /**
     * Add a listener for copy events
     * @param {Function} listener - Function to call when emoji is copied
     * @returns {Function} Function to remove the listener
     */
    static addCopyListener(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        this.#copyListeners.push(listener);

        // Return function to remove listener
        return () => {
            const index = this.#copyListeners.indexOf(listener);
            if (index > -1) {
                this.#copyListeners.splice(index, 1);
            }
        };
    }

    /**
     * Clear all recently used emojis
     * @returns {boolean} True if cleared successfully
     */
    static clearRecentlyUsed() {
        if (!this.#isInitialized) {
            return false;
        }

        const result = RecentlyUsed.clear();
        
        if (result) {
            this.#notifyListeners('clear', {
                timestamp: Date.now()
            });
        }

        return result;
    }

    /**
     * Get copy statistics
     * @returns {Object} Statistics about emoji copying
     */
    static getStats() {
        if (!this.#isInitialized) {
            return {
                recentlyUsedCount: 0,
                isInitialized: false
            };
        }

        return {
            recentlyUsedCount: RecentlyUsed.getCount(),
            maxRecentlyUsed: RecentlyUsed.getMaxEmojis(),
            clipboardSupport: ClipboardManager.getSupportInfo(),
            isInitialized: this.#isInitialized
        };
    }

    /**
     * Notify all listeners of an event
     * @private
     * @param {string} eventType - Type of event
     * @param {Object} data - Event data
     */
    static #notifyListeners(eventType, data) {
        this.#copyListeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in copy listener:', error);
            }
        });
    }

    /**
     * Show copy feedback to user
     * @private
     * @param {Object} emoji - Copied emoji
     */
    static #showCopyFeedback(emoji) {
        // This is a simple implementation - in a real app you might want
        // to integrate with a notification system
        console.log(`✅ Copied ${emoji.unicode} (${emoji.name || 'emoji'}) to clipboard`);
        
        // You could dispatch a custom event here for UI components to listen to
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('emoji-copied', {
                detail: { emoji, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
        }
    }

    /**
     * Show error feedback to user
     * @private
     * @param {Object} emoji - Emoji that failed to copy
     * @param {string} errorMessage - Error message
     */
    static #showErrorFeedback(emoji, errorMessage) {
        console.error(`❌ Failed to copy ${emoji.unicode}: ${errorMessage}`);
        
        // Dispatch error event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('emoji-copy-error', {
                detail: { emoji, error: errorMessage, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
        }
    }
}

// Export for module usage or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmojiCopyManager;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.EmojiCopyManager = EmojiCopyManager;
}

// Make available globally in Node.js too
if (typeof global !== 'undefined') {
    global.EmojiCopyManager = EmojiCopyManager;
}

console.log('EmojiCopyManager loaded successfully');