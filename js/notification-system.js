/**
 * NotificationSystem - Handles user feedback and notifications
 * 
 * This class provides a comprehensive notification system for copy feedback,
 * error handling, and other user interactions.
 */

class NotificationSystem {
    constructor() {
        this.notificationElement = null;
        this.currentTimeout = null;
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        this.notificationElement = document.getElementById('notification');
        if (!this.notificationElement) {
            console.warn('Notification element not found');
        }
    }

    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification ('success', 'error', 'warning', 'info')
     * @param {number} duration - How long to show the notification in milliseconds
     */
    show(message, type = 'success', duration = 3000) {
        if (!this.notificationElement) {
            console.warn('Cannot show notification: element not found');
            return;
        }

        // Clear any existing timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }

        // Set the message and type
        this.notificationElement.textContent = message;
        this.notificationElement.className = `notification ${type}`;

        // Show the notification
        requestAnimationFrame(() => {
            this.notificationElement.classList.add('show');
        });

        // Auto-hide after duration
        this.currentTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }

    /**
     * Hide the current notification
     */
    hide() {
        if (!this.notificationElement) return;

        this.notificationElement.classList.remove('show');
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    /**
     * Show success notification for emoji copy
     * @param {string} emoji - The emoji that was copied
     */
    showCopySuccess(emoji) {
        this.show(`${emoji} copied to clipboard!`, 'success', 2000);
    }

    /**
     * Show error notification for copy failure
     * @param {string} error - The error message
     */
    showCopyError(error = 'Failed to copy to clipboard') {
        this.show(error, 'error', 4000);
    }

    /**
     * Show warning notification
     * @param {string} message - The warning message
     */
    showWarning(message) {
        this.show(message, 'warning', 3500);
    }

    /**
     * Show info notification
     * @param {string} message - The info message
     */
    showInfo(message) {
        this.show(message, 'info', 3000);
    }

    /**
     * Show clipboard not supported warning
     */
    showClipboardNotSupported() {
        this.showWarning('Clipboard not supported in this browser. Try selecting and copying manually.');
    }

    /**
     * Show permission denied error
     */
    showPermissionDenied() {
        this.showError('Clipboard access denied. Please allow clipboard permissions and try again.');
    }

    /**
     * Show generic error with custom message
     * @param {string} message - Custom error message
     */
    showError(message) {
        this.show(message, 'error', 4000);
    }
}

/**
 * CopyFeedbackManager - Integrates clipboard operations with user feedback
 * 
 * This class combines ClipboardManager with NotificationSystem to provide
 * comprehensive copy functionality with user feedback.
 */
class CopyFeedbackManager {
    constructor() {
        this.notificationSystem = new NotificationSystem();
        this.init();
    }

    /**
     * Initialize the copy feedback manager
     */
    init() {
        // Check clipboard support on initialization
        this.checkClipboardSupport();
    }

    /**
     * Check and warn about clipboard support
     */
    checkClipboardSupport() {
        const supportInfo = ClipboardManager.getSupportInfo();
        
        if (!supportInfo.hasAnySupport) {
            console.warn('No clipboard support detected');
            this.notificationSystem.showClipboardNotSupported();
        } else {
            console.log('Clipboard support detected:', supportInfo);
        }
    }

    /**
     * Copy emoji with comprehensive feedback and error handling
     * @param {string} emoji - The emoji to copy
     * @param {string} emojiName - Optional name of the emoji for better feedback
     * @returns {Promise<boolean>} Success status
     */
    async copyEmojiWithFeedback(emoji, emojiName = '') {
        if (!emoji) {
            this.notificationSystem.showError('No emoji provided');
            return false;
        }

        try {
            // Attempt to copy the emoji
            const success = await ClipboardManager.copyEmoji(emoji);
            
            if (success) {
                // Show success feedback
                const displayName = emojiName ? ` (${emojiName})` : '';
                this.notificationSystem.showCopySuccess(`${emoji}${displayName}`);
                
                // Log for debugging
                console.log(`Successfully copied emoji: ${emoji}${displayName}`);
                
                return true;
            } else {
                throw new Error('Copy operation returned false');
            }
        } catch (error) {
            // Handle different types of errors
            this.handleCopyError(error, emoji);
            return false;
        }
    }

    /**
     * Handle copy errors with appropriate user feedback
     * @param {Error} error - The error that occurred
     * @param {string} emoji - The emoji that failed to copy
     * @private
     */
    handleCopyError(error, emoji) {
        console.error('Copy error:', error);

        // Determine error type and show appropriate message
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
            this.notificationSystem.showPermissionDenied();
        } else if (errorMessage.includes('not supported') || errorMessage.includes('unavailable')) {
            this.notificationSystem.showClipboardNotSupported();
        } else if (errorMessage.includes('user activation') || errorMessage.includes('gesture')) {
            this.notificationSystem.showError('Please try clicking the emoji again');
        } else {
            // Generic error message
            this.notificationSystem.showCopyError(`Failed to copy ${emoji}. Please try again.`);
        }
    }

    /**
     * Copy text with feedback (for general text copying)
     * @param {string} text - The text to copy
     * @param {string} successMessage - Custom success message
     * @returns {Promise<boolean>} Success status
     */
    async copyTextWithFeedback(text, successMessage = 'Copied to clipboard!') {
        if (!text) {
            this.notificationSystem.showError('No text provided');
            return false;
        }

        try {
            const success = await ClipboardManager.copyToClipboard(text);
            
            if (success) {
                this.notificationSystem.show(successMessage, 'success');
                return true;
            } else {
                throw new Error('Copy operation returned false');
            }
        } catch (error) {
            this.handleCopyError(error, text);
            return false;
        }
    }

    /**
     * Get the notification system instance
     * @returns {NotificationSystem} The notification system
     */
    getNotificationSystem() {
        return this.notificationSystem;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem, CopyFeedbackManager };
}

// Make available globally
window.NotificationSystem = NotificationSystem;
window.CopyFeedbackManager = CopyFeedbackManager;
console.log('NotificationSystem and CopyFeedbackManager loaded successfully');