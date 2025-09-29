/**
 * Test file for ClipboardManager functionality
 * 
 * This file contains tests to verify the ClipboardManager class works correctly.
 * Run these tests in a browser console or testing environment.
 */

// Test suite for ClipboardManager
const ClipboardManagerTests = {
    /**
     * Test if ClipboardManager is available
     */
    testAvailability() {
        console.log('Testing ClipboardManager availability...');
        
        if (typeof ClipboardManager === 'undefined') {
            console.error('❌ ClipboardManager is not available');
            return false;
        }
        
        console.log('✅ ClipboardManager is available');
        return true;
    },

    /**
     * Test support detection methods
     */
    testSupportDetection() {
        console.log('Testing support detection...');
        
        const supportInfo = ClipboardManager.getSupportInfo();
        console.log('Support info:', supportInfo);
        
        // Test individual methods
        const modernSupport = ClipboardManager.isSupported();
        const legacySupport = ClipboardManager.isLegacySupported();
        
        console.log(`Modern Clipboard API supported: ${modernSupport}`);
        console.log(`Legacy execCommand supported: ${legacySupport}`);
        
        if (!supportInfo.hasAnySupport) {
            console.warn('⚠️ No clipboard support detected');
            return false;
        }
        
        console.log('✅ Clipboard support detection working');
        return true;
    },

    /**
     * Test basic text copying (requires user interaction)
     */
    async testBasicCopy() {
        console.log('Testing basic text copy...');
        
        try {
            const testText = 'Hello, World!';
            const success = await ClipboardManager.copyToClipboard(testText);
            
            if (success) {
                console.log('✅ Basic text copy successful');
                return true;
            } else {
                console.error('❌ Basic text copy failed');
                return false;
            }
        } catch (error) {
            console.error('❌ Basic text copy error:', error.message);
            return false;
        }
    },

    /**
     * Test emoji copying (requires user interaction)
     */
    async testEmojiCopy() {
        console.log('Testing emoji copy...');
        
        try {
            const testEmoji = '😀';
            const success = await ClipboardManager.copyEmoji(testEmoji);
            
            if (success) {
                console.log('✅ Emoji copy successful');
                return true;
            } else {
                console.error('❌ Emoji copy failed');
                return false;
            }
        } catch (error) {
            console.error('❌ Emoji copy error:', error.message);
            return false;
        }
    },

    /**
     * Test error handling with invalid input
     */
    async testErrorHandling() {
        console.log('Testing error handling...');
        
        try {
            // Test with null input
            await ClipboardManager.copyToClipboard(null);
            console.error('❌ Should have thrown error for null input');
            return false;
        } catch (error) {
            console.log('✅ Correctly handled null input error');
        }

        try {
            // Test with undefined input
            await ClipboardManager.copyToClipboard(undefined);
            console.error('❌ Should have thrown error for undefined input');
            return false;
        } catch (error) {
            console.log('✅ Correctly handled undefined input error');
        }

        try {
            // Test with non-string input
            await ClipboardManager.copyToClipboard(123);
            console.error('❌ Should have thrown error for non-string input');
            return false;
        } catch (error) {
            console.log('✅ Correctly handled non-string input error');
        }

        try {
            // Test copyEmoji with empty input
            await ClipboardManager.copyEmoji('');
            console.error('❌ Should have thrown error for empty emoji');
            return false;
        } catch (error) {
            console.log('✅ Correctly handled empty emoji error');
        }

        console.log('✅ Error handling tests passed');
        return true;
    },

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Running ClipboardManager tests...\n');
        
        const results = {
            availability: this.testAvailability(),
            supportDetection: this.testSupportDetection(),
            errorHandling: await this.testErrorHandling()
        };

        // Interactive tests (require user gesture)
        console.log('\n📋 Interactive tests (require user interaction):');
        console.log('Run these manually by calling:');
        console.log('- ClipboardManagerTests.testBasicCopy()');
        console.log('- ClipboardManagerTests.testEmojiCopy()');

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

// Auto-run tests when loaded (except interactive ones)
if (typeof window !== 'undefined') {
    // Run tests after a short delay to ensure ClipboardManager is loaded
    setTimeout(() => {
        ClipboardManagerTests.runAllTests();
    }, 100);
}

// Export for manual testing
window.ClipboardManagerTests = ClipboardManagerTests;