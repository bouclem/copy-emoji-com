/**
 * Simple test suite for EmojiData class
 */

// Mock fetch for testing
const originalFetch = global.fetch;
global.fetch = async (url) => {
  const fs = require('fs');
  const path = require('path');
  
  if (url.includes('emoji-data.json')) {
    const filePath = path.join(__dirname, 'emoji-data.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      ok: true,
      json: async () => JSON.parse(data)
    };
  }
  
  // Fallback to original fetch if available
  if (originalFetch) {
    return originalFetch(url);
  }
  
  throw new Error('File not found');
};

// Import EmojiData
const EmojiData = require('./emoji-data.js');

/**
 * Test emoji data loading functionality
 */
async function testEmojiDataLoading() {
  console.log('Testing emoji data loading...');
  
  try {
    // Test initial state
    console.assert(!EmojiData.isLoaded(), 'Initial state should be not loaded');
    console.assert(EmojiData.getEmojiCount() === 0, 'Initial emoji count should be 0');
    
    // Test loading emojis
    const emojis = await EmojiData.loadEmojis();
    console.assert(Array.isArray(emojis), 'loadEmojis should return an array');
    console.assert(emojis.length > 0, 'Should load at least one emoji');
    console.assert(EmojiData.isLoaded(), 'Should be loaded after loadEmojis');
    console.assert(EmojiData.getEmojiCount() > 0, 'Emoji count should be greater than 0');
    
    // Test emoji structure
    const firstEmoji = emojis[0];
    console.assert(firstEmoji.hasOwnProperty('unicode'), 'Emoji should have unicode property');
    console.assert(firstEmoji.hasOwnProperty('name'), 'Emoji should have name property');
    console.assert(firstEmoji.hasOwnProperty('category'), 'Emoji should have category property');
    console.assert(firstEmoji.hasOwnProperty('keywords'), 'Emoji should have keywords property');
    console.assert(firstEmoji.hasOwnProperty('codepoint'), 'Emoji should have codepoint property');
    console.assert(Array.isArray(firstEmoji.keywords), 'Keywords should be an array');
    
    // Test getAllEmojis
    const allEmojis = EmojiData.getAllEmojis();
    console.assert(Array.isArray(allEmojis), 'getAllEmojis should return an array');
    console.assert(allEmojis.length === emojis.length, 'getAllEmojis should return same count as loadEmojis');
    
    // Test that getAllEmojis returns a copy (not the original array)
    allEmojis.push({ test: 'emoji' });
    console.assert(EmojiData.getAllEmojis().length !== allEmojis.length, 'getAllEmojis should return a copy');
    
    console.log('✅ All emoji data loading tests passed!');
    console.log(`Loaded ${emojis.length} emojis successfully`);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test emoji data parsing functionality
 */
function testEmojiDataParsing() {
  console.log('Testing emoji data parsing...');
  
  try {
    // Test valid emoji data
    const validEmoji = {
      unicode: '😀',
      name: 'Grinning Face',
      category: 'smileys-emotion',
      keywords: ['happy', 'smile'],
      codepoint: '1F600'
    };
    
    const parsed = EmojiData.parseEmojiData(validEmoji);
    console.assert(parsed.unicode === '😀', 'Unicode should be preserved');
    console.assert(parsed.name === 'grinning face', 'Name should be lowercase');
    console.assert(parsed.category === 'smileys-emotion', 'Category should be preserved');
    console.assert(Array.isArray(parsed.keywords), 'Keywords should be an array');
    console.assert(parsed.codepoint === '1F600', 'Codepoint should be preserved');
    
    // Test missing required field
    try {
      const invalidEmoji = { unicode: '😀', name: 'test' }; // missing required fields
      EmojiData.parseEmojiData(invalidEmoji);
      console.assert(false, 'Should throw error for missing fields');
    } catch (error) {
      console.assert(error.message.includes('Missing required field'), 'Should throw specific error for missing fields');
    }
    
    console.log('✅ All emoji data parsing tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Parsing test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const loadingTestPassed = await testEmojiDataLoading();
    const parsingTestPassed = testEmojiDataParsing();
    
    if (loadingTestPassed && parsingTestPassed) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some tests failed!');
      process.exit(1);
    }
  })();
}

module.exports = {
  testEmojiDataLoading,
  testEmojiDataParsing
};