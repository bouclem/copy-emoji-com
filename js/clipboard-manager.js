/**
 * ClipboardManager - Handles copying emojis to clipboard
 * 
 * This class provides a unified interface for copying text to the clipboard
 * with support for modern Clipboard API and fallback to legacy methods.
 */

class ClipboardManager {
    /**
     * Check if the modern Clipboard API is supported
     * @returns {boolean} True if Clipboard API is available
     */
    static isSupported() {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    }

    /**
     * Check if the legacy execCommand is supported
     * @returns {boolean} True if execCommand copy is available
     */
    static isLegacySupported() {
        return document.queryCommandSupported && document.queryCommandSupported('copy');
    }

    /**
     * Copy text to clipboard using the best available method
     * @param {string} text - The text to copy to clipboard
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    static async copyToClipboard(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text provided for clipboard copy');
        }

        // Try modern Clipboard API first
        if (this.isSupported()) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.warn('Clipboard API failed, falling back to legacy method:', error);
                // Fall through to legacy method
            }
        }

        // Fallback to legacy execCommand method
        return this._copyUsingLegacyMethod(text);
    }

    /**
     * Copy text using the legacy document.execCommand method
     * @param {string} text - The text to copy
     * @returns {boolean} True if successful
     * @private
     */
    static _copyUsingLegacyMethod(text) {
        if (!this.isLegacySupported()) {
            throw new Error('No clipboard copy method available');
        }

        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        textarea.setAttribute('readonly', '');
        textarea.setAttribute('aria-hidden', 'true');

        try {
            // Add to DOM, select, copy, and remove
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (!successful) {
                throw new Error('execCommand copy failed');
            }
            
            return true;
        } catch (error) {
            // Clean up textarea if it was added
            if (textarea.parentNode) {
                document.body.removeChild(textarea);
            }
            throw new Error(`Legacy clipboard copy failed: ${error.message}`);
        }
    }

    /**
     * Get information about clipboard support
     * @returns {Object} Object containing support information
     */
    static getSupportInfo() {
        return {
            modern: this.isSupported(),
            legacy: this.isLegacySupported(),
            hasAnySupport: this.isSupported() || this.isLegacySupported()
        };
    }

    /**
     * Copy an emoji to clipboard with proper error handling
     * @param {string} emoji - The emoji character to copy
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    static async copyEmoji(emoji) {
        if (!emoji) {
            throw new Error('No emoji provided');
        }

        try {
            const success = await this.copyToClipboard(emoji);
            if (success) {
                console.log(`Successfully copied emoji: ${emoji}`);
            }
            return success;
        } catch (error) {
            console.error('Failed to copy emoji:', error);
            throw error;
        }
    }
}

// Export for module usage or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardManager;
}

// Make available globally
window.ClipboardManager = ClipboardManager;
console.log('ClipboardManager loaded successfully');