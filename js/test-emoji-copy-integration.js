/**
 * Test suite for EmojiCopyManager integration
 * Tests the integration between clipboard copying and recently used tracking
 */

// Mock dependencies for testing
class MockClipboardManager {
    static async copyEmoji(emoji) {
        console.log(`Mock: Copying emoji ${emoji}`);
        return true;
    }
    
    static getSupportInfo() {
        return {
            modern: true,
            legacy: true,
            hasAnySupport: true
        };
    }
}

class MockRecentlyUsed {
    static #emojis = [];
    static #isInitialized = false;

    static async initialize() {
        this.#isInitialized = true;
    }

    static add(emoji) {
        // Remove if exists
        this.#emojis = this.#emojis.filter(e => e.unicode !== emoji.unicode);
        // Add to front
        this.#emojis.unshift({ ...emoji, timestamp: Date.now() });
        // Limit to 20
        if (this.#emojis.length > 20) {
            this.#emojis = this.#emojis.slice(0, 20);
        }
        return true;
    }

    static get() {
        return [...this.#emojis];
    }

    static getWithLimit(limit) {
        return this.#emojis.slice(0, limit);
    }

    static getCount() {
        return this.#emojis.length;
    }

    static getMaxEmojis() {
        return 20;
    }

    static clear() {
        this.#emojis = [];
        return true;
    }

    static reset() {
        this.#emojis = [];
        this.#isInitialized = false;
    }
}

// Test helper functions
function createMockEmoji(unicode, name = 'test emoji', category = 'test') {
    return {
        unicode: unicode,
        name: name,
        category: category,
        keywords: ['test', 'emoji'],
        codepoint: unicode.codePointAt(0).toString(16).toUpperCase()
    };
}

function runIntegrationTests() {
    console.log('🧪 Starting EmojiCopyManager integration tests...\n');
    
    let testCount = 0;
    let passedTests = 0;

    // Store original dependencies
    const originalClipboardManager = window.ClipboardManager;
    const originalRecentlyUsed = window.RecentlyUsed;

    function test(name, testFn) {
        testCount++;
        try {
            // Setup mocks
            window.ClipboardManager = MockClipboardManager;
            window.RecentlyUsed = MockRecentlyUsed;
            
            // Reset state
            MockRecentlyUsed.reset();
            EmojiCopyManager.reset?.();
            
            testFn();
            passedTests++;
            console.log(`✅ ${name}`);
        } catch (error) {
            console.error(`❌ ${name}: ${error.message}`);
        }
    }

    // Test 1: Basic emoji copying with recently used tracking
    test('Should copy emoji and add to recently used', async () => {
        const emoji = createMockEmoji('😀', 'grinning face');
        
        const result = await EmojiCopyManager.copyEmoji(emoji);
        if (!result) throw new Error('Copy should return true');
        
        const recent = EmojiCopyManager.getRecentlyUsedEmojis();
        if (recent.length !== 1) throw new Error('Should have 1 recently used emoji');
        if (recent[0].unicode !== '😀') throw new Error('Should contain copied emoji');
    });

    // Test 2: Copy emoji without adding to recently used
    test('Should copy emoji without adding to recently used when disabled', async () => {
        const emoji = createMockEmoji('😀', 'grinning face');
        
        const result = await EmojiCopyManager.copyEmoji(emoji, { addToRecent: false });
        if (!result) throw new Error('Copy should return true');
        
        const recent = EmojiCopyManager.getRecentlyUsedEmojis();
        if (recent.length !== 0) throw new Error('Should have 0 recently used emojis');
    });

    // Test 3: Copy emoji by unicode
    test('Should copy emoji by unicode character', async () => {
        const result = await EmojiCopyManager.copyEmojiByUnicode('😀');
        if (!result) throw new Error('Copy should return true');
        
        const recent = EmojiCopyManager.getRecentlyUsedEmojis();
        if (recent.length !== 1) throw new Error('Should have 1 recently used emoji');
        if (recent[0].unicode !== '😀') throw new Error('Should contain copied emoji');
    });

    // Test 4: Recently used emojis have copy functionality
    test('Should create recently used emojis with copy functionality', async () => {
        const emoji1 = createMockEmoji('😀', 'grinning face');
        const emoji2 = createMockEmoji('😃', 'grinning face with big eyes');
        
        await EmojiCopyManager.copyEmoji(emoji1);
        await EmojiCopyManager.copyEmoji(emoji2);
        
        const recent = EmojiCopyManager.getRecentlyUsedEmojis();
        if (recent.length !== 2) throw new Error('Should have 2 recently used emojis');
        
        // Test that recently used emojis have copy method
        if (typeof recent[0].copy !== 'function') {
            throw new Error('Recently used emoji should have copy method');
        }
        
        // Test copying a recently used emoji
        const copyResult = await recent[0].copy();
        if (!copyResult) throw new Error('Recently used emoji copy should return true');
    });

    // Test 5: Create clickable emoji element
    test('Should create clickable emoji element', () => {
        const emoji = createMockEmoji('😀', 'grinning face');
        
        const element = EmojiCopyManager.createClickableEmoji(emoji);
        
        if (!(element instanceof HTMLElement)) {
            throw new Error('Should return HTML element');
        }
        if (element.tagName !== 'BUTTON') {
            throw new Error('Should create button element');
        }
        if (element.textContent !== '😀') {
            throw new Error('Should display emoji unicode');
        }
        if (!element.getAttribute('aria-label')) {
            throw new Error('Should have aria-label for accessibility');
        }
    });

    // Test 6: Create recently used container
    test('Should create recently used container', async () => {
        // Add some emojis first
        await EmojiCopyManager.copyEmoji(createMockEmoji('😀', 'grinning face'));
        await EmojiCopyManager.copyEmoji(createMockEmoji('😃', 'grinning face with big eyes'));
        
        const container = EmojiCopyManager.createRecentlyUsedContainer();
        
        if (!(container instanceof HTMLElement)) {
            throw new Error('Should return HTML element');
        }
        if (container.children.length !== 2) {
            throw new Error('Should contain 2 emoji buttons');
        }
    });

    // Test 7: Update recently used container
    test('Should update recently used container', async () => {
        const container = document.createElement('div');
        
        // Initially empty
        EmojiCopyManager.updateRecentlyUsedContainer(container);
        if (container.children.length !== 1 || !container.textContent.includes('No recently used')) {
            throw new Error('Should show empty message initially');
        }
        
        // Add emoji and update
        await EmojiCopyManager.copyEmoji(createMockEmoji('😀', 'grinning face'));
        EmojiCopyManager.updateRecentlyUsedContainer(container);
        
        if (container.children.length !== 1 || container.children[0].textContent !== '😀') {
            throw new Error('Should show recently used emoji after update');
        }
    });

    // Test 8: Copy event listeners
    test('Should notify listeners of copy events', async () => {
        let eventReceived = false;
        let eventData = null;
        
        const removeListener = EmojiCopyManager.addCopyListener((eventType, data) => {
            eventReceived = true;
            eventData = { eventType, data };
        });
        
        const emoji = createMockEmoji('😀', 'grinning face');
        await EmojiCopyManager.copyEmoji(emoji);
        
        if (!eventReceived) throw new Error('Should notify listeners');
        if (eventData.eventType !== 'copy') throw new Error('Should send copy event');
        if (!eventData.data.success) throw new Error('Should indicate success');
        if (eventData.data.emoji.unicode !== '😀') throw new Error('Should include emoji data');
        
        // Test removing listener
        removeListener();
        eventReceived = false;
        await EmojiCopyManager.copyEmoji(emoji);
        if (eventReceived) throw new Error('Should not notify removed listeners');
    });

    // Test 9: Clear recently used functionality
    test('Should clear recently used emojis', async () => {
        await EmojiCopyManager.copyEmoji(createMockEmoji('😀', 'grinning face'));
        await EmojiCopyManager.copyEmoji(createMockEmoji('😃', 'grinning face with big eyes'));
        
        if (EmojiCopyManager.getRecentlyUsedEmojis().length !== 2) {
            throw new Error('Should have 2 recently used emojis');
        }
        
        const result = EmojiCopyManager.clearRecentlyUsed();
        if (!result) throw new Error('Clear should return true');
        
        if (EmojiCopyManager.getRecentlyUsedEmojis().length !== 0) {
            throw new Error('Should have 0 recently used emojis after clear');
        }
    });

    // Test 10: Get statistics
    test('Should provide copy statistics', async () => {
        await EmojiCopyManager.copyEmoji(createMockEmoji('😀', 'grinning face'));
        
        const stats = EmojiCopyManager.getStats();
        
        if (typeof stats !== 'object') throw new Error('Should return stats object');
        if (stats.recentlyUsedCount !== 1) throw new Error('Should report correct recently used count');
        if (!stats.isInitialized) throw new Error('Should indicate initialization status');
        if (!stats.clipboardSupport) throw new Error('Should include clipboard support info');
    });

    // Test 11: Error handling for invalid emoji
    test('Should handle invalid emoji objects gracefully', async () => {
        try {
            await EmojiCopyManager.copyEmoji(null);
            throw new Error('Should throw error for null emoji');
        } catch (error) {
            if (!error.message.includes('Invalid emoji object')) {
                throw new Error('Should throw specific error for invalid emoji');
            }
        }
        
        try {
            await EmojiCopyManager.copyEmoji({ name: 'test' }); // Missing unicode
            throw new Error('Should throw error for emoji without unicode');
        } catch (error) {
            if (!error.message.includes('unicode property')) {
                throw new Error('Should throw specific error for missing unicode');
            }
        }
    });

    // Test 12: Keyboard support for clickable emojis
    test('Should support keyboard interaction on clickable emojis', () => {
        const emoji = createMockEmoji('😀', 'grinning face');
        const element = EmojiCopyManager.createClickableEmoji(emoji);
        
        let clickTriggered = false;
        element.addEventListener('click', () => {
            clickTriggered = true;
        });
        
        // Test Enter key
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        element.dispatchEvent(enterEvent);
        
        if (!clickTriggered) throw new Error('Enter key should trigger click');
        
        // Test Space key
        clickTriggered = false;
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        element.dispatchEvent(spaceEvent);
        
        if (!clickTriggered) throw new Error('Space key should trigger click');
    });

    // Test 13: Custom event dispatching
    test('Should dispatch custom events for copy actions', async () => {
        let eventReceived = false;
        let eventDetail = null;
        
        const handleEvent = (event) => {
            eventReceived = true;
            eventDetail = event.detail;
        };
        
        window.addEventListener('emoji-copied', handleEvent);
        
        const emoji = createMockEmoji('😀', 'grinning face');
        await EmojiCopyManager.copyEmoji(emoji);
        
        if (!eventReceived) throw new Error('Should dispatch emoji-copied event');
        if (eventDetail.emoji.unicode !== '😀') throw new Error('Should include emoji in event detail');
        
        window.removeEventListener('emoji-copied', handleEvent);
    });

    // Restore original dependencies
    window.ClipboardManager = originalClipboardManager;
    window.RecentlyUsed = originalRecentlyUsed;

    // Print test results
    console.log(`\n📊 Integration Test Results: ${passedTests}/${testCount} tests passed`);
    
    if (passedTests === testCount) {
        console.log('🎉 All integration tests passed!');
        return true;
    } else {
        console.log(`❌ ${testCount - passedTests} integration tests failed`);
        return false;
    }
}

// Auto-run tests if dependencies are available
if (typeof EmojiCopyManager !== 'undefined') {
    runIntegrationTests();
} else {
    console.log('⏳ Waiting for EmojiCopyManager to load...');
    setTimeout(() => {
        if (typeof EmojiCopyManager !== 'undefined') {
            runIntegrationTests();
        } else {
            console.error('❌ EmojiCopyManager not found. Make sure emoji-copy-manager.js is loaded first.');
        }
    }, 100);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntegrationTests, createMockEmoji };
}