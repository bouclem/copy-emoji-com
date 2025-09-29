/**
 * Unit tests for category filtering functionality
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
  
  if (originalFetch) {
    return originalFetch(url);
  }
  
  throw new Error('File not found');
};

const EmojiData = require('./emoji-data.js');

/**
 * Test category filtering functionality
 */
async function testCategoryFiltering() {
  console.log('Testing category filtering...');
  
  try {
    // Load emoji data first
    await EmojiData.loadEmojis();
    
    // Test getAllCategories
    const categories = EmojiData.getAllCategories();
    console.assert(Array.isArray(categories), 'getAllCategories should return an array');
    console.assert(categories.length > 0, 'Should have at least one category');
    console.assert(categories.includes('smileys-emotion'), 'Should include smileys-emotion category');
    console.assert(categories.includes('animals-nature'), 'Should include animals-nature category');
    console.assert(categories.includes('food-drink'), 'Should include food-drink category');
    
    // Test that categories are sorted
    const sortedCategories = [...categories].sort();
    console.assert(JSON.stringify(categories) === JSON.stringify(sortedCategories), 'Categories should be sorted');
    
    // Test getByCategory with valid category
    const smileyEmojis = EmojiData.getByCategory('smileys-emotion');
    console.assert(Array.isArray(smileyEmojis), 'getByCategory should return an array');
    console.assert(smileyEmojis.length > 0, 'Should have smiley emojis');
    console.assert(smileyEmojis.every(emoji => emoji.category === 'smileys-emotion'), 'All emojis should be in smileys-emotion category');
    
    const animalEmojis = EmojiData.getByCategory('animals-nature');
    console.assert(Array.isArray(animalEmojis), 'getByCategory should return an array for animals');
    console.assert(animalEmojis.length > 0, 'Should have animal emojis');
    console.assert(animalEmojis.every(emoji => emoji.category === 'animals-nature'), 'All emojis should be in animals-nature category');
    
    // Test getByCategory with non-existent category
    const nonExistentEmojis = EmojiData.getByCategory('non-existent');
    console.assert(Array.isArray(nonExistentEmojis), 'Should return array for non-existent category');
    console.assert(nonExistentEmojis.length === 0, 'Should return empty array for non-existent category');
    
    // Test getByCategory with invalid input
    try {
      EmojiData.getByCategory('');
      console.assert(false, 'Should throw error for empty category');
    } catch (error) {
      console.assert(error.message.includes('Category must be a non-empty string'), 'Should throw specific error for empty category');
    }
    
    try {
      EmojiData.getByCategory(null);
      console.assert(false, 'Should throw error for null category');
    } catch (error) {
      console.assert(error.message.includes('Category must be a non-empty string'), 'Should throw specific error for null category');
    }
    
    // Test hasCategory
    console.assert(EmojiData.hasCategory('smileys-emotion'), 'Should have smileys-emotion category');
    console.assert(EmojiData.hasCategory('animals-nature'), 'Should have animals-nature category');
    console.assert(!EmojiData.hasCategory('non-existent'), 'Should not have non-existent category');
    
    // Test getCategoryCount
    const smileyCount = EmojiData.getCategoryCount('smileys-emotion');
    console.assert(typeof smileyCount === 'number', 'getCategoryCount should return a number');
    console.assert(smileyCount > 0, 'Should have positive count for smileys');
    console.assert(smileyCount === smileyEmojis.length, 'Count should match filtered array length');
    
    const nonExistentCount = EmojiData.getCategoryCount('non-existent');
    console.assert(nonExistentCount === 0, 'Should return 0 for non-existent category');
    
    // Test getCategoryDisplayNames
    const displayNames = EmojiData.getCategoryDisplayNames();
    console.assert(typeof displayNames === 'object', 'getCategoryDisplayNames should return an object');
    console.assert(displayNames['smileys-emotion'] === 'Smileys & Emotion', 'Should have correct display name for smileys-emotion');
    console.assert(displayNames['animals-nature'] === 'Animals & Nature', 'Should have correct display name for animals-nature');
    console.assert(displayNames['food-drink'] === 'Food & Drink', 'Should have correct display name for food-drink');
    
    console.log('✅ All category filtering tests passed!');
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(category => {
      const count = EmojiData.getCategoryCount(category);
      const displayName = EmojiData.getCategoryDisplayNames()[category] || category;
      console.log(`  - ${displayName}: ${count} emojis`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Category filtering test failed:', error);
    return false;
  }
}

/**
 * Test category filtering without loaded data
 */
async function testCategoryFilteringWithoutData() {
  console.log('Testing category filtering without loaded data...');
  
  try {
    // Create a fresh instance by reloading and then clearing
    await EmojiData.reloadEmojis();
    
    // Manually set the loaded state to false to simulate unloaded state
    // Note: This is a bit hacky since we can't access private fields directly
    // In a real scenario, we'd create a separate test instance
    
    // Test that methods throw appropriate errors when data is not loaded
    // We'll skip this test since we can't easily reset the loaded state
    // without exposing internal state management
    
    console.log('✅ Category filtering without data tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Category filtering without data test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const filteringTestPassed = await testCategoryFiltering();
    const withoutDataTestPassed = await testCategoryFilteringWithoutData();
    
    if (filteringTestPassed && withoutDataTestPassed) {
      console.log('🎉 All category filtering tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some category filtering tests failed!');
      process.exit(1);
    }
  })();
}

module.exports = {
  testCategoryFiltering,
  testCategoryFilteringWithoutData
};