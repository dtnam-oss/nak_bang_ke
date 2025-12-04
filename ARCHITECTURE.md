# Architecture Documentation

## 📐 Kiến trúc tổng quan

Dự án sử dụng **3-Layer Architecture** trong môi trường Google Apps Script:

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Client)           │
│  Index.html, Styles.html, UI Components         │
└─────────────────┬───────────────────────────────┘
                  │ google.script.run
┌─────────────────▼───────────────────────────────┐
│         APPLICATION LAYER (Server)              │
│  Main.gs, API Endpoints, Controllers            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            SERVICE LAYER                        │
│  BigQueryService.gs, ErrorHandler.gs            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│             DATA LAYER                          │
│         BigQuery Database                       │
└─────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Request Flow
```
User Action (Click)
    ↓
App.navigate() (AppController.html)
    ↓
UIComponents.renderDashboard()
    ↓
ApiClient.getDashboardStats()
    ↓
google.script.run.getDashboardStats()  [Client → Server]
    ↓
getDashboardStats() (Main.gs)
    ↓
BigQueryService.getDashboardStats()
    ↓
BigQuery.Jobs.query()  [Server → BigQuery]
    ↓
Result parsing & formatting
    ↓
Return to client  [Server → Client]
    ↓
UIComponents.updateDashboardStats()
    ↓
UI Update (DOM manipulation)
```

### 2. Error Flow
```
Error occurs anywhere
    ↓
ErrorHandler.log()
    ↓
Stackdriver Logging
    ↓
ErrorHandler.createErrorResponse()
    ↓
Return to client
    ↓
Display error to user
```

## 📦 Module Responsibilities

### Server-side (.gs files)

#### Main.gs
**Role:** Application Controller & Entry Points
- **doGet()**: Web app entry point, return HTML
- **include()**: Template helper để inject CSS/JS
- **API Endpoints**: Functions được gọi từ client
- **Utilities**: Helper functions cho testing

**Dependencies:** Config.gs, BigQueryService.gs

#### Config.gs
**Role:** Configuration Management
- BigQuery credentials
- SQL queries as functions
- Feature flags
- Error messages
- Application settings

**Dependencies:** None (pure configuration)

#### BigQueryService.gs
**Role:** Data Access Layer
- Query execution
- Result parsing
- Data transformation
- BigQuery-specific error handling

**Dependencies:** Config.gs, ErrorHandler.gs

#### ErrorHandler.gs
**Role:** Error Management
- Centralized logging
- Error response formatting
- Function wrapping for error catching
- Stackdriver integration

**Dependencies:** Config.gs

### Client-side (.html files)

#### Index.html
**Role:** Application Shell
- HTML structure
- DOM elements
- Include other modules via `<?!= include() ?>`

**Dependencies:** All client modules

#### Styles.html
**Role:** Presentation Layer
- CSS variables
- Component styling
- Responsive design
- Animations

**Dependencies:** None

#### ClientConfig.html
**Role:** Client Configuration
- Menu configuration
- UI constants
- Messages
- Client-side settings

**Dependencies:** None

#### ApiClient.html
**Role:** API Communication Layer
- Promise wrapper cho google.script.run
- API call methods
- Request/response handling
- Client-side error handling

**Dependencies:** None (pure API layer)

#### UIComponents.html
**Role:** UI Rendering & State Management
- Render functions
- DOM manipulation
- State management
- UI animations

**Dependencies:** ClientConfig.html

#### AppController.html
**Role:** Application Controller
- Event handling
- Navigation
- Business logic orchestration
- Glue code between UI & API

**Dependencies:** ClientConfig.html, ApiClient.html, UIComponents.html

## 🔀 Dependency Graph

```
Server-side:
Config.gs (no deps)
    ↓
ErrorHandler.gs → Config.gs
    ↓
BigQueryService.gs → Config.gs, ErrorHandler.gs
    ↓
Main.gs → Config.gs, BigQueryService.gs, ErrorHandler.gs

Client-side:
ClientConfig.html (no deps)
    ↓
ApiClient.html (no deps)
    ↓
UIComponents.html → ClientConfig.html
    ↓
AppController.html → ClientConfig.html, ApiClient.html, UIComponents.html
    ↓
Index.html → ALL
```

## 🎯 Design Patterns

### 1. **Module Pattern**
Mỗi file là một module với scope riêng:
```javascript
var BigQueryService = {
  executeQuery: function() { ... },
  getDashboardStats: function() { ... }
};
```

### 2. **Service Layer Pattern**
Tách biệt business logic khỏi data access:
```
Controller (Main.gs)
    ↓
Service (BigQueryService.gs)
    ↓
Data Source (BigQuery)
```

### 3. **Dependency Injection**
Config được inject vào services:
```javascript
// Config.gs defines
var CONFIG = { BIGQUERY: { PROJECT_ID: '...' } };

// BigQueryService.gs uses
BigQuery.Jobs.query(request, CONFIG.BIGQUERY.PROJECT_ID);
```

### 4. **Promise Pattern**
Client-side API calls sử dụng Promises:
```javascript
_callServerFunction: function(functionName, ...args) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](...args);
  });
}
```

### 5. **MVC-like Pattern**
- **Model**: BigQueryService.gs (data)
- **View**: UIComponents.html (rendering)
- **Controller**: AppController.html (logic)

## 🔐 Security Layers

### 1. OAuth Scopes
Defined in appsscript.json:
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/bigquery",
  "https://www.googleapis.com/auth/drive",
  ...
]
```

### 2. Server-side Validation
All data access goes through server:
```
Client → google.script.run → Server Functions → BigQuery
```

### 3. Error Information Hiding
ErrorHandler filters sensitive info:
```javascript
return {
  success: false,
  message: 'User-friendly message',
  // NO stack traces to client
};
```

## 🚀 Performance Optimizations

### 1. **DOM Caching**
```javascript
// UIComponents.html
elements: {
  sidebar: null,
  mainWrapper: null,
  // ... cached once during init
}
```

### 2. **Lazy Loading**
Dashboard data chỉ load khi navigate đến overview page

### 3. **Async/Await**
Non-blocking API calls:
```javascript
_loadDashboardPage: async function() {
  const stats = await ApiClient.getDashboardStats();
  UIComponents.updateDashboardStats(stats);
}
```

### 4. **Animation with RAF**
Smooth number animations:
```javascript
requestAnimationFrame(animate);
```

## 📊 State Management

### Client State
```javascript
// UIComponents.html
state: {
  activeTab: 'overview',      // Current page
  isCollapsed: false,         // Sidebar state
  isMobile: false            // Responsive state
}
```

State được update qua:
- `App.navigate()` → activeTab
- `App.toggleSidebar()` → isCollapsed
- Window resize → isMobile

## 🧪 Testing Strategy

### Unit Tests (Manual)
Test individual functions trong Apps Script Editor:
```javascript
function testBigQueryConnection() {
  var result = BigQueryService.getDashboardStats();
  Logger.log(result);
}
```

### Integration Tests
Test full flow từ UI:
1. Open web app
2. Click menu items
3. Check browser console
4. Verify data display

### Debug Modes
```javascript
// Config.gs
FEATURES: {
  ENABLE_LOGGING: true  // Toggle for debug
}
```

## 🔄 Extension Points

### Adding New Data Source
1. Create new Service file (e.g., `SheetsService.gs`)
2. Follow BigQueryService pattern
3. Add to Main.gs API endpoints

### Adding New Page
1. Add menu item to ClientConfig.html
2. Create render function in UIComponents.html
3. Update App.navigate() logic

### Adding New Feature
1. Add config to Config.gs
2. Create service method
3. Create API endpoint in Main.gs
4. Create client API method in ApiClient.html
5. Update UI in UIComponents.html

## 📝 Code Standards

### Naming Conventions
- **Variables**: camelCase (`myVariable`)
- **Functions**: camelCase (`myFunction()`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Classes/Objects**: PascalCase (`MyObject`)
- **Private methods**: _prefixed (`_privateMethod()`)

### File Naming
- Server: PascalCase.gs (`BigQueryService.gs`)
- Client: PascalCase.html (`AppController.html`)

### Comments
- Function headers: JSDoc style
- Inline: Explain "why", not "what"
- Section headers: Clear separators

---

**Document Version:** 1.0
**Last Updated:** 2025
