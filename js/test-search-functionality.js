/**
 * Unit tests for emoji search functionality
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
 * Test basic search functionality
 */
async function testBasicSearch() {
  console.log('Testing basic search functionality...');
  
  try {
    // Load emoji data first
    await EmojiData.loadEmojis();
    
    // Test search with exact name match
    const grinningSmiley = EmojiData.search('grinning face');
    console.assert(Array.isArray(grinningSmiley), 'Search should return an array');
    console.assert(grinningSmiley.length > 0, 'Should find grinning face emoji');
    console.assert(grinningSmiley[0].name === 'grinning face', 'First result should be exact match');
    console.assert(grinningSmiley[0].matchInfo.exactNameMatch, 'Should mark as exact name match');
    
    // Test search with partial name match
    const heartEmojis = EmojiData.search('heart');
    console.assert(heartEmojis.length > 0, 'Should find heart emojis');
    console.assert(heartEmojis.some(emoji => emoji.name.includes('heart')), 'Results should contain heart in name');
    
    // Test search with keyword match
    const happyEmojis = EmojiData.search('happy');
    console.assert(happyEmojis.length > 0, 'Should find happy emojis');
    console.assert(happyEmojis.some(emoji => 
      emoji.keywords.some(keyword => keyword.includes('happy'))
    ), 'Results should contain emojis with happy keyword');
    
    // Test case-insensitive search
    const upperCaseSearch = EmojiData.search('GRINNING');
    const lowerCaseSearch = EmojiData.search('grinning');
    console.assert(upperCaseSearch.length === lowerCaseSearch.length, 'Search should be case-insensitive');
    
    // Test search with no results
    const noResults = EmojiData.search('xyzzyx123');
    console.assert(Array.isArray(noResults), 'No results should still return array');
    console.assert(noResults.length === 0, 'Should return empty array for no matches');
    
    // Test empty search query
    const emptySearch = EmojiData.search('');
    const allEmojis = EmojiData.getAllEmojis();
    console.assert(emptySearch.length === allEmojis.length, 'Empty search should return all emojis');
    
    // Test null/undefined search query
    const nullSearch = EmojiData.search(null);
    console.assert(nullSearch.length === allEmojis.length, 'Null search should return all emojis');
    
    const undefinedSearch = EmojiData.search(undefined);
    console.assert(undefinedSearch.length === allEmojis.length, 'Undefined search should return all emojis');
    
    console.log('✅ Basic search tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Basic search test failed:', error);
    return false;
  }
}

/**
 * Test search result highlighting
 */
async function testSearchHighlighting() {
  console.log('Testing search result highlighting...');
  
  try {
    await EmojiData.loadEmojis();
    
    // Test name highlighting
    const heartResults = EmojiData.search('heart');
    const heartEmoji = heartResults.find(emoji => emoji.name.includes('heart'));
    console.assert(heartEmoji, 'Should find emoji with heart in name');
    console.assert(heartEmoji.matchInfo.highlightedName.includes('<mark>'), 'Should highlight matching text in name');
    console.assert(heartEmoji.matchInfo.highlightedName.includes('</mark>'), 'Should close highlight tag in name');
    
    // Test keyword highlighting
    const happyResults = EmojiData.search('happy');
    const happyEmoji = happyResults.find(emoji => 
      emoji.keywords.some(keyword => keyword.includes('happy'))
    );
    console.assert(happyEmoji, 'Should find emoji with happy keyword');
    
    const highlightedKeywords = happyEmoji.matchInfo.highlightedKeywords;
    const hasHighlightedKeyword = highlightedKeywords.some(keyword => 
      keyword.includes('<mark>') && keyword.includes('</mark>')
    );
    console.assert(hasHighlightedKeyword, 'Should highlight matching keywords');
    
    // Test case-insensitive highlighting
    const upperCaseResults = EmojiData.search('HEART');
    const upperCaseEmoji = upperCaseResults.find(emoji => emoji.name.includes('heart'));
    console.assert(upperCaseEmoji.matchInfo.highlightedName.includes('<mark>'), 'Should highlight case-insensitive matches');
    
    console.log('✅ Search highlighting tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Search highlighting test failed:', error);
    return false;
  }
}

/**
 * Test search result ranking/sorting
 */
async function testSearchRanking() {
  console.log('Testing search result ranking...');
  
  try {
    await EmojiData.loadEmojis();
    
    // Test that exact matches come first
    const faceResults = EmojiData.search('grinning face');
    console.assert(faceResults.length > 0, 'Should find face results');
    console.assert(faceResults[0].name === 'grinning face', 'Exact match should be first');
    console.assert(faceResults[0].matchInfo.exactNameMatch, 'First result should be marked as exact match');
    
    // Test that name matches come before keyword matches
    const smileResults = EmojiData.search('smile');
    const nameMatches = smileResults.filter(emoji => emoji.name.includes('smile'));
    const keywordOnlyMatches = smileResults.filter(emoji => 
      !emoji.name.includes('smile') && 
      emoji.keywords.some(keyword => keyword.includes('smile'))
    );
    
    if (nameMatches.length > 0 && keywordOnlyMatches.length > 0) {
      const firstNameMatchIndex = smileResults.findIndex(emoji => emoji.name.includes('smile'));
      const firstKeywordOnlyIndex = smileResults.findIndex(emoji => 
        !emoji.name.includes('smile') && 
        emoji.keywords.some(keyword => keyword.includes('smile'))
      );
      
      console.assert(firstNameMatchIndex < firstKeywordOnlyIndex, 'Name matches should come before keyword-only matches');
    }
    
    console.log('✅ Search ranking tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Search ranking test failed:', error);
    return false;
  }
}

/**
 * Test search suggestions functionality
 */
async function testSearchSuggestions() {
  console.log('Testing search suggestions...');
  
  try {
    await EmojiData.loadEmojis();
    
    // Test basic suggestions
    const suggestions = EmojiData.getSearchSuggestions('grin');
    console.assert(Array.isArray(suggestions), 'Suggestions should return an array');
    console.assert(suggestions.length > 0, 'Should have suggestions for "grin"');
    console.assert(suggestions.every(suggestion => 
      suggestion.toLowerCase().startsWith('grin')
    ), 'All suggestions should start with query');
    
    // Test suggestion limit
    const limitedSuggestions = EmojiData.getSearchSuggestions('h', 3);
    console.assert(limitedSuggestions.length <= 3, 'Should respect suggestion limit');
    
    // Test no suggestions for non-existent terms
    const noSuggestions = EmojiData.getSearchSuggestions('xyzzyx');
    console.assert(noSuggestions.length === 0, 'Should return empty array for non-existent terms');
    
    // Test empty query
    const emptySuggestions = EmojiData.getSearchSuggestions('');
    console.assert(emptySuggestions.length === 0, 'Should return empty array for empty query');
    
    // Test null query
    const nullSuggestions = EmojiData.getSearchSuggestions(null);
    console.assert(nullSuggestions.length === 0, 'Should return empty array for null query');
    
    console.log('✅ Search suggestions tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Search suggestions test failed:', error);
    return false;
  }
}

/**
 * Test search with special characters
 */
async function testSearchSpecialCharacters() {
  console.log('Testing search with special characters...');
  
  try {
    await EmojiData.loadEmojis();
    
    // Test search with regex special characters
    const specialCharResults = EmojiData.search('(test)');
    console.assert(Array.isArray(specialCharResults), 'Should handle special regex characters');
    
    // Test search with dots
    const dotResults = EmojiData.search('u.s.');
    console.assert(Array.isArray(dotResults), 'Should handle dots in search');
    
    // Test search with plus signs
    const plusResults = EmojiData.search('test+');
    console.assert(Array.isArray(plusResults), 'Should handle plus signs in search');
    
    console.log('✅ Special characters search tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Special characters search test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const basicTestPassed = await testBasicSearch();
    const highlightingTestPassed = await testSearchHighlighting();
    const rankingTestPassed = await testSearchRanking();
    const suggestionsTestPassed = await testSearchSuggestions();
    const specialCharsTestPassed = await testSearchSpecialCharacters();
    
    if (basicTestPassed && highlightingTestPassed && rankingTestPassed && 
        suggestionsTestPassed && specialCharsTestPassed) {
      console.log('🎉 All search functionality tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some search functionality tests failed!');
      process.exit(1);
    }
  })();
}

module.exports = {
  testBasicSearch,
  testSearchHighlighting,
  testSearchRanking,
  testSearchSuggestions,
  testSearchSpecialCharacters
};