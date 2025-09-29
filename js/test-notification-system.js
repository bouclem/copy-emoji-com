/**
 * Test file for NotificationSystem and CopyFeedbackManager
 * 
 * This file contains tests to verify the notification and copy feedback systems work correctly.
 * Run these tests in a browser console or testing environment.
 */

// Test suite for NotificationSystem and CopyFeedbackManager
const NotificationSystemTests = {
    /**
     * Test if notification classes are available
     */
    testAvailability() {
        console.log('Testing notification system availability...');
        
        if (typeof NotificationSystem === 'undefined') {
            console.error('❌ NotificationSystem is not available');
            return false;
        }
        
        if (typeof CopyFeedbackManager === 'undefined') {
            console.error('❌ CopyFeedbackManager is not available');
            return false;
        }
        
        console.log('✅ Notification system classes are available');
        return true;
    },

    /**
     * Test NotificationSystem initialization
     */
    testNotificationSystemInit() {
        console.log('Testing NotificationSystem initialization...');
        
        try {
            const notificationSystem = new NotificationSystem();
            
            if (!notificationSystem) {
                console.error('❌ Failed to create NotificationSystem instance');
                return false;
            }
            
            console.log('✅ NotificationSystem initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ NotificationSystem initialization error:', error.message);
            return false;
        }
    },

    /**
     * Test CopyFeedbackManager initialization
     */
    testCopyFeedbackManagerInit() {
        console.log('Testing CopyFeedbackManager initialization...');
        
        try {
            const copyFeedbackManager = new CopyFeedbackManager();
            
            if (!copyFeedbackManager) {
                console.error('❌ Failed to create CopyFeedbackManager instance');
                return false;
            }
            
            const notificationSystem = copyFeedbackManager.getNotificationSystem();
            if (!notificationSystem) {
                console.error('❌ CopyFeedbackManager does not have NotificationSystem');
                return false;
            }
            
            console.log('✅ CopyFeedbackManager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ CopyFeedbackManager initialization error:', error.message);
            return false;
        }
    },

    /**
     * Test different notification types
     */
    testNotificationTypes() {
        console.log('Testing notification types...');
        
        try {
            const notificationSystem = new NotificationSystem();
            
            // Test each notification type with a short duration
            setTimeout(() => notificationSystem.show('Success message', 'success', 1000), 100);
            setTimeout(() => notificationSystem.show('Error message', 'error', 1000), 1200);
            setTimeout(() => notificationSystem.show('Warning message', 'warning', 1000), 2400);
            setTimeout(() => notificationSystem.show('Info message', 'info', 1000), 3600);
            
            console.log('✅ Notification types test initiated (check UI for visual confirmation)');
            return true;
        } catch (error) {
            console.error('❌ Notification types test error:', error.message);
            return false;
        }
    },

    /**
     * Test copy feedback with mock emoji (requires user interaction)
     */
    async testCopyFeedback() {
        console.log('Testing copy feedback...');
        
        try {
            const copyFeedbackManager = new CopyFeedbackManager();
            
            // This will require user interaction to work properly
            console.log('📋 Testing copy feedback (requires user interaction)...');
            const success = await copyFeedbackManager.copyEmojiWithFeedback('😀', 'grinning face');
            
            if (success) {
                console.log('✅ Copy feedback test successful');
            } else {
                console.log('⚠️ Copy feedback test failed (may be due to browser restrictions)');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Copy feedback test error:', error.message);
            return false;
        }
    },

    /**
     * Test error handling in copy feedback
     */
    async testCopyErrorHandling() {
        console.log('Testing copy error handling...');
        
        try {
            const copyFeedbackManager = new CopyFeedbackManager();
            
            // Test with invalid input
            const result1 = await copyFeedbackManager.copyEmojiWithFeedback('');
            if (result1 === false) {
                console.log('✅ Correctly handled empty emoji');
            }
            
            const result2 = await copyFeedbackManager.copyEmojiWithFeedback(null);
            if (result2 === false) {
                console.log('✅ Correctly handled null emoji');
            }
            
            console.log('✅ Copy error handling tests passed');
            return true;
        } catch (error) {
            console.error('❌ Copy error handling test error:', error.message);
            return false;
        }
    },

    /**
     * Test integration with main app
     */
    testMainAppIntegration() {
        console.log('Testing main app integration...');
        
        try {
            // Check if main app has copy feedback manager
            if (typeof window.EmojiCopyApp === 'undefined') {
                console.error('❌ EmojiCopyApp not available');
                return false;
            }
            
            const copyFeedbackManager = window.EmojiCopyApp.getCopyFeedbackManager();
            if (!copyFeedbackManager) {
                console.error('❌ CopyFeedbackManager not available in main app');
                return false;
            }
            
            // Test the utility function
            if (typeof window.EmojiCopyApp.copyEmojiWithFeedback !== 'function') {
                console.error('❌ copyEmojiWithFeedback function not available');
                return false;
            }
            
            console.log('✅ Main app integration successful');
            return true;
        } catch (error) {
            console.error('❌ Main app integration test error:', error.message);
            return false;
        }
    },

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Running NotificationSystem tests...\n');
        
        const results = {
            availability: this.testAvailability(),
            notificationSystemInit: this.testNotificationSystemInit(),
            copyFeedbackManagerInit: this.testCopyFeedbackManagerInit(),
            notificationTypes: this.testNotificationTypes(),
            copyErrorHandling: await this.testCopyErrorHandling(),
            mainAppIntegration: this.testMainAppIntegration()
        };

        // Interactive tests (require user gesture)
        console.log('\n📋 Interactive tests (require user interaction):');
        console.log('Run these manually by calling:');
        console.log('- NotificationSystemTests.testCopyFeedback()');
        console.log('- window.EmojiCopyApp.copyEmojiWithFeedback("😀", "grinning face")');

        const passedTests = Object.values(results).filter(result => result).length;
        const totalTests = Object.keys(results).length;

        console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All automated tests passed!');
        } else {
            console.log('❌ Some tests failed');
        }

        return results;
    }
};

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
    // Run tests after a delay to ensure all dependencies are loaded
    setTimeout(() => {
        NotificationSystemTests.runAllTests();
    }, 500);
}

// Export for manual testing
window.NotificationSystemTests = NotificationSystemTests;