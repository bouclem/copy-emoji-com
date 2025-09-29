/**
 * EmojiData class for managing emoji data loading and operations
 */
class EmojiData {
  static #emojis = [];
  static #categories = new Set();
  static #isLoaded = false;

  /**
   * Load emoji data from JSON file
   * @returns {Promise<Array>} Array of emoji objects
   */
  static async loadEmojis() {
    if (this.#isLoaded) {
      return this.#emojis;
    }

    try {
      const response = await fetch('./js/emoji-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load emoji data: ${response.status}`);
      }
      
      const data = await response.json();
      this.#emojis = data.emojis || [];
      
      // Extract unique categories
      this.#categories.clear();
      this.#emojis.forEach(emoji => {
        if (emoji.category) {
          this.#categories.add(emoji.category);
        }
      });
      
      this.#isLoaded = true;
      return this.#emojis;
    } catch (error) {
      console.error('Error loading emoji data:', error);
      throw error;
    }
  }

  /**
   * Get all emojis
   * @returns {Array} Array of all emoji objects
   */
  static getAllEmojis() {
    return [...this.#emojis];
  }

  /**
   * Check if emoji data is loaded
   * @returns {boolean} True if data is loaded
   */
  static isLoaded() {
    return this.#isLoaded;
  }

  /**
   * Get emoji count
   * @returns {number} Number of loaded emojis
   */
  static getEmojiCount() {
    return this.#emojis.length;
  }

  /**
   * Parse and validate emoji data structure
   * @param {Object} emojiData Raw emoji data object
   * @returns {Object} Validated emoji object
   */
  static parseEmojiData(emojiData) {
    const requiredFields = ['unicode', 'name', 'category', 'keywords', 'codepoint'];
    
    for (const field of requiredFields) {
      if (!emojiData.hasOwnProperty(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      unicode: String(emojiData.unicode),
      name: String(emojiData.name).toLowerCase(),
      category: String(emojiData.category),
      keywords: Array.isArray(emojiData.keywords) ? emojiData.keywords : [],
      codepoint: String(emojiData.codepoint)
    };
  }

  /**
   * Get emojis by category
   * @param {string} category Category name to filter by
   * @returns {Array} Array of emoji objects in the specified category
   */
  static getByCategory(category) {
    if (!this.#isLoaded) {
      throw new Error('Emoji data not loaded. Call loadEmojis() first.');
    }
    
    if (!category || typeof category !== 'string') {
      throw new Error('Category must be a non-empty string');
    }
    
    return this.#emojis.filter(emoji => emoji.category === category);
  }

  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  static getAllCategories() {
    if (!this.#isLoaded) {
      throw new Error('Emoji data not loaded. Call loadEmojis() first.');
    }
    
    return Array.from(this.#categories).sort();
  }

  /**
   * Get category display names (formatted for UI)
   * @returns {Object} Object mapping category IDs to display names
   */
  static getCategoryDisplayNames() {
    const displayNames = {
      'smileys-emotion': 'Smileys & Emotion',
      'animals-nature': 'Animals & Nature',
      'food-drink': 'Food & Drink',
      'activities': 'Activities',
      'travel-places': 'Travel & Places',
      'objects': 'Objects',
      'symbols': 'Symbols',
      'flags': 'Flags'
    };
    
    return displayNames;
  }

  /**
   * Get emoji count by category
   * @param {string} category Category name
   * @returns {number} Number of emojis in the category
   */
  static getCategoryCount(category) {
    if (!this.#isLoaded) {
      throw new Error('Emoji data not loaded. Call loadEmojis() first.');
    }
    
    return this.getByCategory(category).length;
  }

  /**
   * Check if a category exists
   * @param {string} category Category name to check
   * @returns {boolean} True if category exists
   */
  static hasCategory(category) {
    return this.#categories.has(category);
  }

  /**
   * Search emojis by name or keywords
   * @param {string} query Search query (case-insensitive)
   * @returns {Array} Array of matching emoji objects with highlighted matches
   */
  static search(query) {
    if (!this.#isLoaded) {
      throw new Error('Emoji data not loaded. Call loadEmojis() first.');
    }
    
    if (!query || typeof query !== 'string') {
      return this.getAllEmojis();
    }
    
    const searchTerm = query.toLowerCase().trim();
    if (searchTerm === '') {
      return this.getAllEmojis();
    }
    
    const results = [];
    
    for (const emoji of this.#emojis) {
      const matchInfo = this.#getMatchInfo(emoji, searchTerm);
      if (matchInfo.isMatch) {
        results.push({
          ...emoji,
          matchInfo: matchInfo
        });
      }
    }
    
    // Sort results by relevance (exact name matches first, then keyword matches)
    results.sort((a, b) => {
      // Exact name matches get highest priority
      if (a.matchInfo.exactNameMatch && !b.matchInfo.exactNameMatch) return -1;
      if (!a.matchInfo.exactNameMatch && b.matchInfo.exactNameMatch) return 1;
      
      // Name starts with query gets second priority
      if (a.matchInfo.nameStartsWithQuery && !b.matchInfo.nameStartsWithQuery) return -1;
      if (!a.matchInfo.nameStartsWithQuery && b.matchInfo.nameStartsWithQuery) return 1;
      
      // Name contains query gets third priority
      if (a.matchInfo.nameContainsQuery && !b.matchInfo.nameContainsQuery) return -1;
      if (!a.matchInfo.nameContainsQuery && b.matchInfo.nameContainsQuery) return 1;
      
      // Sort by number of keyword matches (more matches = higher relevance)
      return b.matchInfo.keywordMatches.length - a.matchInfo.keywordMatches.length;
    });
    
    return results;
  }

  /**
   * Get match information for an emoji against a search term
   * @private
   * @param {Object} emoji Emoji object
   * @param {string} searchTerm Lowercase search term
   * @returns {Object} Match information object
   */
  static #getMatchInfo(emoji, searchTerm) {
    const name = emoji.name.toLowerCase();
    const keywords = emoji.keywords.map(k => k.toLowerCase());
    
    // Check name matches
    const exactNameMatch = name === searchTerm;
    const nameStartsWithQuery = name.startsWith(searchTerm);
    const nameContainsQuery = name.includes(searchTerm);
    
    // Check keyword matches
    const keywordMatches = keywords.filter(keyword => 
      keyword.includes(searchTerm)
    );
    
    const isMatch = exactNameMatch || nameStartsWithQuery || nameContainsQuery || keywordMatches.length > 0;
    
    return {
      isMatch,
      exactNameMatch,
      nameStartsWithQuery,
      nameContainsQuery,
      keywordMatches,
      highlightedName: this.#highlightText(emoji.name, searchTerm),
      highlightedKeywords: keywords.map(keyword => 
        this.#highlightText(keyword, searchTerm)
      )
    };
  }

  /**
   * Highlight matching text in a string
   * @private
   * @param {string} text Text to highlight
   * @param {string} searchTerm Search term to highlight
   * @returns {string} Text with highlighted matches
   */
  static #highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${this.#escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape special regex characters
   * @private
   * @param {string} string String to escape
   * @returns {string} Escaped string
   */
  static #escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} partialQuery Partial search query
   * @param {number} limit Maximum number of suggestions (default: 5)
   * @returns {Array} Array of suggested search terms
   */
  static getSearchSuggestions(partialQuery, limit = 5) {
    if (!this.#isLoaded) {
      throw new Error('Emoji data not loaded. Call loadEmojis() first.');
    }
    
    if (!partialQuery || typeof partialQuery !== 'string') {
      return [];
    }
    
    const query = partialQuery.toLowerCase().trim();
    if (query === '') {
      return [];
    }
    
    const suggestions = new Set();
    
    // Add matching emoji names
    for (const emoji of this.#emojis) {
      if (emoji.name.toLowerCase().startsWith(query)) {
        suggestions.add(emoji.name);
      }
      
      // Add matching keywords
      for (const keyword of emoji.keywords) {
        if (keyword.toLowerCase().startsWith(query)) {
          suggestions.add(keyword);
        }
      }
      
      if (suggestions.size >= limit) break;
    }
    
    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Reload emoji data (useful for testing or data updates)
   * @returns {Promise<Array>} Array of emoji objects
   */
  static async reloadEmojis() {
    this.#isLoaded = false;
    this.#emojis = [];
    this.#categories.clear();
    return await this.loadEmojis();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmojiData;
}