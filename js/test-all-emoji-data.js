/**
 * Comprehensive test suite for all emoji data functionality
 */

// Import all test modules
const { testEmojiDataLoading, testEmojiDataParsing } = require('./test-emoji-data.js');
const { testCategoryFiltering, testCategoryFilteringWithoutData } = require('./test-category-filtering.js');
const { 
  testBasicSearch, 
  testSearchHighlighting, 
  testSearchRanking, 
  testSearchSuggestions, 
  testSearchSpecialCharacters 
} = require('./test-search-functionality.js');

/**
 * Run all emoji data tests
 */
async function runAllTests() {
  console.log('🚀 Running comprehensive emoji data test suite...\n');
  
  const testResults = [];
  
  // Test emoji data loading and parsing
  console.log('📊 Testing emoji data loading and parsing...');
  testResults.push(await testEmojiDataLoading());
  testResults.push(testEmojiDataParsing());
  
  // Test category filtering
  console.log('\n📂 Testing category filtering...');
  testResults.push(await testCategoryFiltering());
  testResults.push(await testCategoryFilteringWithoutData());
  
  // Test search functionality
  console.log('\n🔍 Testing search functionality...');
  testResults.push(await testBasicSearch());
  testResults.push(await testSearchHighlighting());
  testResults.push(await testSearchRanking());
  testResults.push(await testSearchSuggestions());
  testResults.push(await testSearchSpecialCharacters());
  
  // Summary
  const passedTests = testResults.filter(result => result === true).length;
  const totalTests = testResults.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📋 Test Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All emoji data management tests passed!');
    console.log('✅ Task 2: Create emoji data management system - COMPLETED');
    return true;
  } else {
    console.log('💥 Some tests failed!');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const allTestsPassed = await runAllTests();
    process.exit(allTestsPassed ? 0 : 1);
  })();
}

module.exports = {
  runAllTests
};