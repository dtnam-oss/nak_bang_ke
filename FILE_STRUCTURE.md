# 📁 File Structure

Cấu trúc hoàn chỉnh của project sau khi refactoring.

## 📂 Project Root

```
system_nak/
├── .clasp.json                    # CLASP deployment config
├── appsscript.json                # Apps Script configuration
│
├── 🔧 SERVER-SIDE (.gs files)
│   ├── Main.gs                    # Entry points & API endpoints
│   ├── Config.gs                  # Configuration & constants
│   ├── BigQueryService.gs         # BigQuery service layer
│   └── ErrorHandler.gs            # Error handling & logging
│
├── 🎨 CLIENT-SIDE (.html files)
│   ├── Index.html                 # Main HTML structure
│   ├── Styles.html                # CSS stylesheet
│   ├── ClientConfig.html          # Client config & menu
│   ├── ApiClient.html             # API communication
│   ├── UIComponents.html          # UI rendering
│   └── AppController.html         # App controller
│
└── 📚 DOCUMENTATION (.md files)
    ├── README.md                  # Project overview & guide
    ├── QUICKSTART.md              # 5-minute setup guide
    ├── ARCHITECTURE.md            # Technical architecture
    ├── DEPLOYMENT.md              # Deployment guide
    ├── REFACTORING_SUMMARY.md     # What changed
    └── FILE_STRUCTURE.md          # This file
```

---

## 📄 File Details

### Configuration Files

#### `.clasp.json` (276 bytes)
```json
{
  "scriptId": "1adOXj_Yg6K6w9Czl9Ge78LbtDGv3xhKeE3wzbD9o_7iJvqEAH9XJZKI8"
}
```
**Purpose:** CLASP deployment configuration
**When to edit:** When creating new Apps Script project

---

#### `appsscript.json` (790 bytes)
```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": { ... },
  "oauthScopes": [ ... ],
  "webapp": { ... }
}
```
**Purpose:** Apps Script manifest
**When to edit:** 
- Add new Advanced Services
- Add new OAuth scopes
- Change webapp settings

---

### Server-side Files (.gs)

#### `Main.gs` (2.6 KB, ~90 lines)
**Purpose:** Application entry points
**Contains:**
- `doGet()` - Web app entry
- `include()` - Template helper
- API endpoints (getDashboardStats, etc.)
- Test utilities

**When to edit:**
- Add new API endpoints
- Modify doGet() logic
- Add test functions

---

#### `Config.gs` (1.2 KB, ~50 lines)
**Purpose:** Centralized configuration
**Contains:**
- BigQuery credentials
- SQL queries
- Feature flags
- Error messages
- App settings

**When to edit:**
- Update BigQuery credentials
- Modify SQL queries
- Add new config
- Change feature flags

---

#### `BigQueryService.gs` (2.9 KB, ~110 lines)
**Purpose:** BigQuery service layer
**Contains:**
- `executeQuery()` - Execute queries
- `getDashboardStats()` - Get stats
- `parseRow()` - Parse results
- Error handling

**When to edit:**
- Add new query methods
- Modify data parsing
- Add new data sources

---

#### `ErrorHandler.gs` (1.7 KB, ~70 lines)
**Purpose:** Error management
**Contains:**
- `log()` - Structured logging
- `createErrorResponse()` - Error formatting
- `wrapFunction()` - Function wrapper

**When to edit:**
- Customize logging
- Add error types
- Modify error responses

---

### Client-side Files (.html)

#### `Index.html` (3.8 KB, ~110 lines)
**Purpose:** Main HTML structure
**Contains:**
- HTML skeleton
- Sidebar structure
- Header structure
- Content container
- Include directives

**When to edit:**
- Modify HTML structure
- Add new sections
- Change layout

---

#### `Styles.html` (10 KB, ~470 lines)
**Purpose:** Application stylesheet
**Contains:**
- CSS variables
- Component styles
- Responsive design
- Animations

**When to edit:**
- Change colors/theme
- Modify component styles
- Add new styles
- Update responsive breakpoints

---

#### `ClientConfig.html` (1.1 KB, ~45 lines)
**Purpose:** Client configuration
**Contains:**
- Menu items config
- UI settings
- Messages
- Constants

**When to edit:**
- Add/remove menu items
- Change messages
- Update UI settings

---

#### `ApiClient.html` (2.1 KB, ~75 lines)
**Purpose:** API communication layer
**Contains:**
- `getDashboardStats()` - Fetch stats
- `_callServerFunction()` - Promise wrapper
- Error handling

**When to edit:**
- Add new API methods
- Modify error handling
- Add new endpoints

---

#### `UIComponents.html` (6.5 KB, ~235 lines)
**Purpose:** UI rendering & state
**Contains:**
- `renderMenu()` - Menu rendering
- `renderDashboard()` - Dashboard UI
- `updateDashboardStats()` - Update data
- State management

**When to edit:**
- Add new pages
- Modify UI components
- Change rendering logic
- Add animations

---

#### `AppController.html` (4.6 KB, ~180 lines)
**Purpose:** Application controller
**Contains:**
- `init()` - App initialization
- `navigate()` - Navigation
- `toggleSidebar()` - Sidebar control
- Event handlers

**When to edit:**
- Add new routes
- Modify navigation
- Add event handlers
- Change app logic

---

### Documentation Files (.md)

#### `README.md` (6.0 KB)
**For:** All users
**Contains:**
- Project overview
- File structure
- Features
- Configuration
- Testing
- Troubleshooting

**Read first:** ✅ Yes

---

#### `QUICKSTART.md` (2.1 KB)
**For:** New users
**Contains:**
- 5-minute setup
- Quick commands
- Common tasks
- Quick troubleshooting

**Read first:** ✅ Yes

---

#### `ARCHITECTURE.md** (9.1 KB)
**For:** Developers
**Contains:**
- Architecture diagrams
- Data flow
- Module details
- Design patterns
- Code standards

**Read first:** After README

---

#### `DEPLOYMENT.md` (8.3 KB)
**For:** DevOps/Deployment
**Contains:**
- Deployment methods
- Step-by-step guide
- Configuration
- Troubleshooting
- Rollback

**Read first:** When deploying

---

#### `REFACTORING_SUMMARY.md` (7.2 KB)
**For:** Team/Review
**Contains:**
- Before/After comparison
- Improvements
- Metrics
- Technical details
- Success criteria

**Read first:** To understand changes

---

#### `FILE_STRUCTURE.md` (This file)
**For:** Navigation/Reference
**Contains:**
- Complete file list
- File purposes
- When to edit
- File sizes

**Read first:** When navigating project

---

## 📊 Statistics

### Code Files
- **Server-side:** 4 files (.gs)
- **Client-side:** 6 files (.html)
- **Config:** 2 files (.json)
- **Total code files:** 12

### Documentation
- **Markdown files:** 6 files
- **Total doc pages:** ~35 KB

### Lines of Code
- **Total:** ~2,733 lines
- **Code:** ~1,300 lines
- **Documentation:** ~1,400+ lines
- **Ratio:** 1:1 (excellent!)

---

## 🎯 Quick Reference

### Need to change...

| What | File to edit |
|------|-------------|
| BigQuery credentials | Config.gs |
| SQL query | Config.gs |
| Menu items | ClientConfig.html |
| Page content | UIComponents.html |
| CSS/Styling | Styles.html |
| API endpoint | Main.gs + ApiClient.html |
| Error messages | Config.gs |
| App logic | AppController.html |

---

## 📁 File Dependencies

```
Index.html
  ├─ includes Styles.html
  ├─ includes ClientConfig.html
  ├─ includes ApiClient.html
  ├─ includes UIComponents.html
  └─ includes AppController.html

Main.gs
  ├─ uses Config.gs
  ├─ uses BigQueryService.gs
  └─ uses ErrorHandler.gs

BigQueryService.gs
  ├─ uses Config.gs
  └─ uses ErrorHandler.gs

AppController.html
  ├─ uses ClientConfig.html
  ├─ uses ApiClient.html
  └─ uses UIComponents.html
```

---

## 🔍 Finding Things

**Looking for:**
- Configuration? → `Config.gs` or `ClientConfig.html`
- BigQuery code? → `BigQueryService.gs`
- UI rendering? → `UIComponents.html`
- API calls? → `ApiClient.html`
- Styling? → `Styles.html`
- Error handling? → `ErrorHandler.gs`
- Entry points? → `Main.gs`
- App logic? → `AppController.html`

---

**Last Updated:** 2025-11-28
**Total Files:** 18
**Total Size:** ~48 KB
