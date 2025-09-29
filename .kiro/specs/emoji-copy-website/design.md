# Design Document

## Overview

The emoji copy website will be a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. The application will use a comprehensive emoji dataset with Unicode characters, names, and category classifications. The design emphasizes simplicity, performance, and accessibility while providing an intuitive user experience for browsing and copying emojis.

## Architecture

### Frontend Architecture
- **Single Page Application**: Pure HTML/CSS/JavaScript without frameworks for simplicity and fast loading
- **Component-based Structure**: Modular JavaScript components for different UI sections
- **Local Storage**: Browser localStorage for persisting recently used emojis
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts

### Data Structure
```javascript
// Emoji data structure
{
  unicode: "😀",
  name: "grinning face",
  category: "smileys-emotion",
  keywords: ["happy", "smile", "grin"],
  codepoint: "1F600"
}
```

## Components and Interfaces

### 1. Header Component
- **Search Bar**: Real-time emoji filtering
- **Logo/Title**: Website branding
- **Recently Used Section**: Horizontal scrollable emoji list

### 2. Category Navigation Component
- **Category Buttons**: Clickable category filters
- **Active State**: Visual indication of selected category
- **Icons**: Category-specific icons for better UX

### 3. Emoji Grid Component
- **Responsive Grid**: CSS Grid layout adapting to screen size
- **Emoji Cards**: Individual emoji display with hover effects
- **Lazy Loading**: Performance optimization for large emoji sets
- **Copy Feedback**: Visual confirmation when emoji is copied

### 4. Notification Component
- **Toast Messages**: Brief success/error notifications
- **Copy Confirmation**: "Copied!" message with fade animation

### Core JavaScript Modules

#### EmojiData Module
```javascript
class EmojiData {
  static async loadEmojis() // Load emoji dataset
  static getByCategory(category) // Filter by category
  static search(query) // Search functionality
  static getAllCategories() // Get category list
}
```

#### ClipboardManager Module
```javascript
class ClipboardManager {
  static async copyToClipboard(text) // Copy emoji to clipboard
  static isSupported() // Check clipboard API support
}
```

#### RecentlyUsed Module
```javascript
class RecentlyUsed {
  static add(emoji) // Add to recent list
  static get() // Get recent emojis
  static clear() // Clear recent list
  static save() // Persist to localStorage
  static load() // Load from localStorage
}
```

## Data Models

### Emoji Model
```javascript
class Emoji {
  constructor(unicode, name, category, keywords, codepoint) {
    this.unicode = unicode;
    this.name = name;
    this.category = category;
    this.keywords = keywords;
    this.codepoint = codepoint;
  }
  
  matches(searchTerm) {
    // Search logic for name and keywords
  }
}
```

### Category Model
```javascript
class Category {
  constructor(id, name, icon, emojis) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.emojis = emojis;
  }
}
```

## User Interface Design

### Layout Structure
```
┌─────────────────────────────────────┐
│ Header (Search + Logo)              │
├─────────────────────────────────────┤
│ Recently Used (Horizontal Scroll)   │
├─────────────────────────────────────┤
│ Category Navigation                 │
├─────────────────────────────────────┤
│ Emoji Grid (Responsive)             │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│ │ 😀│ │ 😃│ │ 😄│ │ 😁│ │ 😆│      │
│ └───┘ └───┘ └───┘ └───┘ └───┘      │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│ │ 😅│ │ 😂│ │ 🤣│ │ 😊│ │ 😇│      │
│ └───┘ └───┘ └───┘ └───┘ └───┘      │
└─────────────────────────────────────┘
```

### Color Scheme
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #f3f4f6 (Light Gray)
- **Accent**: #10b981 (Green for success states)
- **Background**: #ffffff (White)
- **Text**: #1f2937 (Dark Gray)

### Typography
- **Primary Font**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Emoji Font**: Native emoji fonts with fallbacks

## Error Handling

### Clipboard API Errors
- **Fallback Strategy**: Use deprecated `document.execCommand` for older browsers
- **User Feedback**: Clear error messages when clipboard access fails
- **Graceful Degradation**: Manual copy instructions when APIs unavailable

### Data Loading Errors
- **Retry Logic**: Automatic retry for failed emoji data loads
- **Offline Support**: Cache emoji data for offline usage
- **Loading States**: Skeleton screens during data loading

### Search Edge Cases
- **Empty Results**: Friendly "no emojis found" message with suggestions
- **Special Characters**: Proper handling of search input sanitization
- **Performance**: Debounced search to prevent excessive filtering

## Testing Strategy

### Unit Testing
- **Emoji Data Module**: Test filtering, searching, and data loading
- **Recently Used Module**: Test localStorage operations and list management
- **Clipboard Manager**: Test copy functionality with mocked APIs

### Integration Testing
- **Search Flow**: Test complete search-to-copy user journey
- **Category Navigation**: Test category switching and emoji display
- **Recently Used Flow**: Test emoji usage tracking and persistence

### Cross-Browser Testing
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Clipboard API Support**: Test fallback mechanisms

### Accessibility Testing
- **Keyboard Navigation**: Tab navigation through emojis and categories
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliance for all text and interactive elements

### Performance Testing
- **Load Time**: Measure initial page load and emoji data loading
- **Search Performance**: Test search responsiveness with large datasets
- **Memory Usage**: Monitor memory consumption with extensive emoji usage

## Implementation Notes

### Emoji Dataset
- Use Unicode Emoji Standard data (latest version)
- Include comprehensive keyword mapping for search
- Organize by official Unicode categories
- Consider using CDN for emoji data delivery

### Browser Compatibility
- **Clipboard API**: Modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+)
- **Fallback**: `document.execCommand('copy')` for older browsers
- **CSS Grid**: IE 11+ with fallback to Flexbox
- **LocalStorage**: Universal support (IE 8+)

### Performance Optimizations
- **Virtual Scrolling**: For large emoji lists
- **Image Sprites**: Consider for custom emoji icons
- **Lazy Loading**: Load emoji data progressively
- **Caching**: Aggressive caching of emoji data and assets