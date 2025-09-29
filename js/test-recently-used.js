/**
 * Test suite for RecentlyUsed class
 * Tests localStorage operations, emoji management, and 20-emoji limit
 */

// Mock localStorage for testing
class MockLocalStorage {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
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

function runTests() {
    console.log('🧪 Starting RecentlyUsed tests...\n');
    
    // Store original localStorage
    const originalLocalStorage = window.localStorage;
    let testCount = 0;
    let passedTests = 0;

    function test(name, testFn) {
        testCount++;
        try {
            // Setup fresh mock localStorage for each test
            window.localStorage = new MockLocalStorage();
            
            // Reset RecentlyUsed state
            RecentlyUsed.reset();
            
            testFn();
            passedTests++;
            console.log(`✅ ${name}`);
        } catch (error) {
            console.error(`❌ ${name}: ${error.message}`);
        }
    }

    // Test 1: Basic add and get functionality
    test('Should add emoji to recently used list', () => {
        const emoji = createMockEmoji('😀', 'grinning face');
        
        const result = RecentlyUsed.add(emoji);
        if (!result) throw new Error('Add should return true');
        
        const recent = RecentlyUsed.get();
        if (recent.length !== 1) throw new Error('Should have 1 emoji');
        if (recent[0].unicode !== '😀') throw new Error('Should contain added emoji');
    });

    // Test 2: Test emoji validation
    test('Should validate emoji object properties', () => {
        try {
            RecentlyUsed.add({ unicode: '😀' }); // Missing required properties
            throw new Error('Should have thrown validation error');
        } catch (error) {
            if (!error.message.includes('missing required property')) {
                throw new Error('Should throw validation error for missing properties');
            }
        }
    });

    // Test 3: Test 20-emoji limit
    test('Should enforce 20-emoji limit', () => {
        // Add 25 emojis
        for (let i = 0; i < 25; i++) {
            const emoji = createMockEmoji(String.fromCodePoint(0x1F600 + i), `emoji ${i}`);
            RecentlyUsed.add(emoji);
        }
        
        const recent = RecentlyUsed.get();
        if (recent.length !== 20) {
            throw new Error(`Should have exactly 20 emojis, got ${recent.length}`);
        }
        
        // Check that the most recent emojis are kept (last 20 added)
        const lastEmoji = recent[0];
        if (lastEmoji.name !== 'emoji 24') {
            throw new Error('Most recent emoji should be first');
        }
    });

    // Test 4: Test duplicate handling (should move to front)
    test('Should move duplicate emoji to front', () => {
        const emoji1 = createMockEmoji('😀', 'emoji 1');
        const emoji2 = createMockEmoji('😃', 'emoji 2');
        const emoji3 = createMockEmoji('😄', 'emoji 3');
        
        RecentlyUsed.add(emoji1);
        RecentlyUsed.add(emoji2);
        RecentlyUsed.add(emoji3);
        RecentlyUsed.add(emoji1); // Add duplicate
        
        const recent = RecentlyUsed.get();
        if (recent.length !== 3) throw new Error('Should still have 3 emojis');
        if (recent[0].unicode !== '😀') throw new Error('Duplicate should be moved to front');
    });

    // Test 5: Test localStorage persistence
    test('Should save to and load from localStorage', () => {
        const emoji = createMockEmoji('😀', 'test emoji');
        RecentlyUsed.add(emoji);
        
        // Check that data was saved
        const stored = window.localStorage.getItem('emoji-recently-used');
        if (!stored) throw new Error('Should save to localStorage');
        
        const data = JSON.parse(stored);
        if (!data.emojis || data.emojis.length !== 1) {
            throw new Error('Should save emoji data');
        }
        
        // Reset and load
        RecentlyUsed.reset();
        RecentlyUsed.load();
        
        const loaded = RecentlyUsed.get();
        if (loaded.length !== 1) throw new Error('Should load saved emojis');
        if (loaded[0].unicode !== '😀') throw new Error('Should load correct emoji');
    });

    // Test 6: Test clear functionality
    test('Should clear all recently used emojis', () => {
        const emoji1 = createMockEmoji('😀');
        const emoji2 = createMockEmoji('😃');
        
        RecentlyUsed.add(emoji1);
        RecentlyUsed.add(emoji2);
        
        if (RecentlyUsed.getCount() !== 2) throw new Error('Should have 2 emojis');
        
        const result = RecentlyUsed.clear();
        if (!result) throw new Error('Clear should return true');
        if (RecentlyUsed.getCount() !== 0) throw new Error('Should have 0 emojis after clear');
    });

    // Test 7: Test contains functionality
    test('Should check if emoji is in recently used list', () => {
        const emoji = createMockEmoji('😀');
        
        if (RecentlyUsed.contains('😀')) throw new Error('Should not contain emoji initially');
        
        RecentlyUsed.add(emoji);
        
        if (!RecentlyUsed.contains('😀')) throw new Error('Should contain added emoji');
        if (RecentlyUsed.contains('😃')) throw new Error('Should not contain different emoji');
    });

    // Test 8: Test remove functionality
    test('Should remove specific emoji from list', () => {
        const emoji1 = createMockEmoji('😀');
        const emoji2 = createMockEmoji('😃');
        
        RecentlyUsed.add(emoji1);
        RecentlyUsed.add(emoji2);
        
        const removed = RecentlyUsed.remove('😀');
        if (!removed) throw new Error('Remove should return true when emoji found');
        
        if (RecentlyUsed.contains('😀')) throw new Error('Should not contain removed emoji');
        if (!RecentlyUsed.contains('😃')) throw new Error('Should still contain other emoji');
        
        const notRemoved = RecentlyUsed.remove('😄');
        if (notRemoved) throw new Error('Remove should return false when emoji not found');
    });

    // Test 9: Test getWithLimit functionality
    test('Should return limited number of emojis', () => {
        // Add 10 emojis
        for (let i = 0; i < 10; i++) {
            const emoji = createMockEmoji(String.fromCodePoint(0x1F600 + i), `emoji ${i}`);
            RecentlyUsed.add(emoji);
        }
        
        const limited = RecentlyUsed.getWithLimit(5);
        if (limited.length !== 5) throw new Error('Should return exactly 5 emojis');
        
        // Should return most recent first
        if (limited[0].name !== 'emoji 9') throw new Error('Should return most recent first');
    });

    // Test 10: Test invalid localStorage data handling
    test('Should handle invalid localStorage data gracefully', () => {
        // Set invalid data in localStorage
        window.localStorage.setItem('emoji-recently-used', 'invalid json');
        
        const loaded = RecentlyUsed.load();
        if (!loaded) throw new Error('Load should return true even with invalid data');
        
        const recent = RecentlyUsed.get();
        if (recent.length !== 0) throw new Error('Should have empty list with invalid data');
    });

    // Test 11: Test storage info
    test('Should provide storage information', () => {
        const emoji = createMockEmoji('😀');
        RecentlyUsed.add(emoji);
        
        const info = RecentlyUsed.getStorageInfo();
        if (!info.hasData) throw new Error('Should indicate data exists');
        if (info.emojiCount !== 1) throw new Error('Should report correct emoji count');
        if (info.maxEmojis !== 20) throw new Error('Should report correct max emojis');
    });

    // Test 12: Test max emojis configuration
    test('Should allow configuring max emojis limit', () => {
        RecentlyUsed.setMaxEmojis(5);
        
        if (RecentlyUsed.getMaxEmojis() !== 5) throw new Error('Should update max emojis');
        
        // Add 10 emojis
        for (let i = 0; i < 10; i++) {
            const emoji = createMockEmoji(String.fromCodePoint(0x1F600 + i));
            RecentlyUsed.add(emoji);
        }
        
        if (RecentlyUsed.getCount() !== 5) throw new Error('Should enforce new limit');
        
        // Reset to default
        RecentlyUsed.setMaxEmojis(20);
    });

    // Test 13: Test emoji object immutability
    test('Should return immutable copies of emoji objects', () => {
        const emoji = createMockEmoji('😀', 'original name');
        RecentlyUsed.add(emoji);
        
        const recent = RecentlyUsed.get();
        recent[0].name = 'modified name';
        
        const recentAgain = RecentlyUsed.get();
        if (recentAgain[0].name !== 'original name') {
            throw new Error('Should return immutable copies');
        }
    });

    // Test 14: Test timestamp tracking
    test('Should add timestamp when emoji is added', () => {
        const emoji = createMockEmoji('😀');
        const beforeTime = Date.now();
        
        RecentlyUsed.add(emoji);
        
        // Access internal data to check timestamp
        const stored = window.localStorage.getItem('emoji-recently-used');
        const data = JSON.parse(stored);
        const storedEmoji = data.emojis[0];
        
        if (!storedEmoji.timestamp) throw new Error('Should add timestamp');
        if (storedEmoji.timestamp < beforeTime) throw new Error('Timestamp should be recent');
    });

    // Test 15: Test error handling for invalid inputs
    test('Should handle invalid inputs gracefully', () => {
        try {
            RecentlyUsed.add(null);
            throw new Error('Should throw error for null emoji');
        } catch (error) {
            if (!error.message.includes('Invalid emoji object')) {
                throw new Error('Should throw specific error for invalid emoji');
            }
        }
        
        try {
            RecentlyUsed.getWithLimit(-1);
            throw new Error('Should throw error for negative limit');
        } catch (error) {
            if (!error.message.includes('non-negative number')) {
                throw new Error('Should throw specific error for negative limit');
            }
        }
    });

    // Restore original localStorage
    window.localStorage = originalLocalStorage;

    // Print test results
    console.log(`\n📊 Test Results: ${passedTests}/${testCount} tests passed`);
    
    if (passedTests === testCount) {
        console.log('🎉 All tests passed!');
        return true;
    } else {
        console.log(`❌ ${testCount - passedTests} tests failed`);
        return false;
    }
}

// Auto-run tests if RecentlyUsed is available
if (typeof RecentlyUsed !== 'undefined') {
    runTests();
} else {
    console.log('⏳ Waiting for RecentlyUsed class to load...');
    // Try again after a short delay
    setTimeout(() => {
        if (typeof RecentlyUsed !== 'undefined') {
            runTests();
        } else {
            console.error('❌ RecentlyUsed class not found. Make sure recently-used.js is loaded first.');
        }
    }, 100);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests, createMockEmoji };
}