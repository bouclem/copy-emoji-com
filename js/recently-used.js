/**
 * RecentlyUsed - Manages recently used emojis with localStorage persistence
 * 
 * This class handles tracking, storing, and retrieving recently used emojis
 * with a maximum limit of 20 emojis and automatic persistence to localStorage.
 */

class RecentlyUsed {
    static #recentEmojis = [];
    static #maxEmojis = 20;
    static #storageKey = 'emoji-recently-used';
    static #isLoaded = false;

    /**
     * Initialize the recently used system by loading from localStorage
     * @returns {Promise<void>}
     */
    static async initialize() {
        if (!this.#isLoaded) {
            this.load();
            this.#isLoaded = true;
        }
    }

    /**
     * Add an emoji to the recently used list
     * @param {Object} emoji - Emoji object with unicode, name, category, keywords, codepoint
     * @returns {boolean} True if emoji was added successfully
     */
    static add(emoji) {
        if (!emoji || typeof emoji !== 'object') {
            throw new Error('Invalid emoji object provided');
        }

        // Validate required emoji properties
        const requiredProps = ['unicode', 'name', 'category', 'keywords', 'codepoint'];
        for (const prop of requiredProps) {
            if (!emoji.hasOwnProperty(prop)) {
                throw new Error(`Emoji object missing required property: ${prop}`);
            }
        }

        // Ensure we're initialized
        if (!this.#isLoaded) {
            this.initialize();
        }

        // Create a clean copy of the emoji object
        const emojiCopy = {
            unicode: String(emoji.unicode),
            name: String(emoji.name),
            category: String(emoji.category),
            keywords: Array.isArray(emoji.keywords) ? [...emoji.keywords] : [],
            codepoint: String(emoji.codepoint),
            timestamp: Date.now() // Add timestamp for tracking when it was used
        };

        // Remove emoji if it already exists (to move it to front)
        this.#recentEmojis = this.#recentEmojis.filter(
            existing => existing.unicode !== emojiCopy.unicode
        );

        // Add to the beginning of the array (most recent first)
        this.#recentEmojis.unshift(emojiCopy);

        // Enforce the maximum limit by removing oldest emojis
        if (this.#recentEmojis.length > this.#maxEmojis) {
            this.#recentEmojis = this.#recentEmojis.slice(0, this.#maxEmojis);
        }

        // Persist to localStorage
        this.save();

        return true;
    }

    /**
     * Get all recently used emojis
     * @returns {Array} Array of recently used emoji objects (most recent first)
     */
    static get() {
        if (!this.#isLoaded) {
            this.initialize();
        }

        // Return a copy to prevent external modification
        return this.#recentEmojis.map(emoji => ({
            unicode: emoji.unicode,
            name: emoji.name,
            category: emoji.category,
            keywords: [...emoji.keywords],
            codepoint: emoji.codepoint
        }));
    }

    /**
     * Get recently used emojis with limit
     * @param {number} limit - Maximum number of emojis to return
     * @returns {Array} Array of recently used emoji objects
     */
    static getWithLimit(limit) {
        if (typeof limit !== 'number' || limit < 0) {
            throw new Error('Limit must be a non-negative number');
        }

        const allRecent = this.get();
        return allRecent.slice(0, limit);
    }

    /**
     * Clear all recently used emojis
     * @returns {boolean} True if cleared successfully
     */
    static clear() {
        this.#recentEmojis = [];
        this.save();
        return true;
    }

    /**
     * Check if an emoji is in the recently used list
     * @param {string} unicode - Unicode character of the emoji
     * @returns {boolean} True if emoji is in recently used list
     */
    static contains(unicode) {
        if (!unicode || typeof unicode !== 'string') {
            return false;
        }

        if (!this.#isLoaded) {
            this.initialize();
        }

        return this.#recentEmojis.some(emoji => emoji.unicode === unicode);
    }

    /**
     * Get the count of recently used emojis
     * @returns {number} Number of emojis in recently used list
     */
    static getCount() {
        if (!this.#isLoaded) {
            this.initialize();
        }

        return this.#recentEmojis.length;
    }

    /**
     * Remove a specific emoji from recently used list
     * @param {string} unicode - Unicode character of the emoji to remove
     * @returns {boolean} True if emoji was found and removed
     */
    static remove(unicode) {
        if (!unicode || typeof unicode !== 'string') {
            throw new Error('Invalid unicode provided');
        }

        if (!this.#isLoaded) {
            this.initialize();
        }

        const initialLength = this.#recentEmojis.length;
        this.#recentEmojis = this.#recentEmojis.filter(
            emoji => emoji.unicode !== unicode
        );

        const wasRemoved = this.#recentEmojis.length < initialLength;
        if (wasRemoved) {
            this.save();
        }

        return wasRemoved;
    }

    /**
     * Save recently used emojis to localStorage
     * @returns {boolean} True if saved successfully
     */
    static save() {
        try {
            const dataToSave = {
                emojis: this.#recentEmojis,
                version: '1.0',
                lastUpdated: Date.now()
            };

            localStorage.setItem(this.#storageKey, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Failed to save recently used emojis to localStorage:', error);
            return false;
        }
    }

    /**
     * Load recently used emojis from localStorage
     * @returns {boolean} True if loaded successfully
     */
    static load() {
        try {
            const stored = localStorage.getItem(this.#storageKey);
            if (!stored) {
                this.#recentEmojis = [];
                return true;
            }

            const data = JSON.parse(stored);
            
            // Validate data structure
            if (!data || !Array.isArray(data.emojis)) {
                console.warn('Invalid recently used data format, resetting');
                this.#recentEmojis = [];
                return true;
            }

            // Validate and clean emoji objects
            this.#recentEmojis = data.emojis
                .filter(emoji => this.#isValidEmojiObject(emoji))
                .slice(0, this.#maxEmojis); // Ensure we don't exceed limit

            this.#isLoaded = true;
            return true;
        } catch (error) {
            console.error('Failed to load recently used emojis from localStorage:', error);
            this.#recentEmojis = [];
            return false;
        }
    }

    /**
     * Validate if an object is a valid emoji object
     * @private
     * @param {Object} emoji - Object to validate
     * @returns {boolean} True if valid emoji object
     */
    static #isValidEmojiObject(emoji) {
        if (!emoji || typeof emoji !== 'object') {
            return false;
        }

        const requiredProps = ['unicode', 'name', 'category', 'keywords', 'codepoint'];
        return requiredProps.every(prop => emoji.hasOwnProperty(prop));
    }

    /**
     * Get storage information
     * @returns {Object} Object containing storage stats
     */
    static getStorageInfo() {
        const stored = localStorage.getItem(this.#storageKey);
        return {
            hasData: !!stored,
            dataSize: stored ? stored.length : 0,
            emojiCount: this.getCount(),
            maxEmojis: this.#maxEmojis,
            storageKey: this.#storageKey
        };
    }

    /**
     * Set the maximum number of emojis to store (for testing purposes)
     * @param {number} max - Maximum number of emojis
     */
    static setMaxEmojis(max) {
        if (typeof max !== 'number' || max < 1) {
            throw new Error('Max emojis must be a positive number');
        }

        this.#maxEmojis = max;
        
        // Trim current list if it exceeds new limit
        if (this.#recentEmojis.length > max) {
            this.#recentEmojis = this.#recentEmojis.slice(0, max);
            this.save();
        }
    }

    /**
     * Get the maximum number of emojis that can be stored
     * @returns {number} Maximum emoji limit
     */
    static getMaxEmojis() {
        return this.#maxEmojis;
    }

    /**
     * Reset the recently used system (for testing purposes)
     */
    static reset() {
        this.#recentEmojis = [];
        this.#isLoaded = false;
        try {
            localStorage.removeItem(this.#storageKey);
        } catch (error) {
            console.error('Failed to remove recently used data from localStorage:', error);
        }
    }
}

// Export for module usage or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecentlyUsed;
}

// Make available globally
window.RecentlyUsed = RecentlyUsed;
console.log('RecentlyUsed class loaded successfully');