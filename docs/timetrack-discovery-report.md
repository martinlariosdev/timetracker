# TimeTrack Desktop Application - Discovery Report
**Date:** April 10, 2026  
**Purpose:** Mobile App Development Planning  
**User Perspective:** Single User (Martin Larios - Software Engineer)

---

## Executive Summary

TimeTrack is a web-based time tracking application built with ASP.NET WebForms, using Okta for authentication. The application focuses on bi-monthly timesheet management with critical submission deadlines (7th and 22nd of each month).

---

## 1. Authentication & Access

### Login Flow
1. **Initial Page:** `https://timetrack.number8.com/Login.aspx`
2. **Primary Auth:** "Sign In with Okta" button (SSO)
3. **Alternative:** Username/Password with "Get Started" button
4. **Additional:** "Forgot Password?" link

### Authentication Details
- **SSO Provider:** Okta (`number8.okta.com`)
- **OAuth Flow:** OAuth 2.0 redirect flow
- **Session Management:** ASP.NET session cookies + Okta tokens

**Screenshots:**
- `screenshots/01-login-page.png` - Initial login
- `screenshots/02-okta-login.png` - Okta SSO form

---

## 2. Application Navigation Structure

### Main Navigation Bar
Located at top of page with 4 primary sections:

#### 🏠 Home
- Returns to main timesheet view
- URL: `Default.aspx`

#### ⏱️ My (4 submenu items)
1. **ETO** - Earned Time Off management
   - URL: `/v2/My/ETO`
   - View balance: 33.92 hours remaining
   - Track accrued/used ETO
   
2. **Preferences** - User settings
   - URL: `/v2/My/Preferences`
   - Time Off Reminders:
     - 1 business day before
     - 3 business days before
     - Every 3 business days
   
3. **Time Off Events** - Time off tracking
   - URL: `/v2/My/TimeOffEvents`
   - Add time off entries
   - View scheduled time off
   - Fields: Consultant, Period Range, Reason, Client Aware
   
4. **Timesheet** - Back to main view
   - URL: `Default.aspx`

#### 📊 Reports (2 submenu items)
1. **Timesheet Details** 
   - URL: `Reports2.aspx`
   - Historical timesheet data
   
2. **Timesheet Timeliness**
   - URL: `/v2/Reports/TimesheetTimeliness`
   - Metrics on submission timeliness
   - Current metric: 2.83 days average

#### 👤 User Menu (Martin) - 3 items
1. **Change Password**
   - URL: `ChangePassword.aspx`
   
2. **Help Center**
   - URL: `/v2/Support`
   
3. **Logout**
   - JavaScript postback action

**Screenshots:**
- `screenshots/04-my-menu-expanded.png` - My menu
- `screenshots/08-reports-menu-expanded.png` - Reports menu
- `screenshots/09-user-menu-expanded.png` - User menu

---

## 3. Main Dashboard (Timesheet View)

### Page Components

#### Header Section
- **Period Selector:** Dropdown with bi-monthly periods
  - Format: `MM/DD/YYYY - MM/DD/YYYY`
  - Example: `04/01/2026 - 04/15/2026`
  - Note: "If you wish to view previous periods from the ones appearing in the dropdown, go to Reports > Timesheet Details."
  
- **User Selector:** Disabled for single users, shows current user only
  - Display: "Martin Larios"
  
- **View Button:** Refresh/load selected period

#### Info Cards (3 cards)

**Card 1: Team Lead Info**
- Name: Alessandro Silveira
- Email: alessandro.silveira@softwaremind.com
- Organization chart icon (clickable)

**Card 2: Timesheet Timeliness**
- Current metric: 2.83 days
- Links to trends report: `/v2/Reports/TimelinessTrends?consultantId=24563`

**Card 3: (Not visible in single user view - likely admin/manager only)**

#### Action Toolbar (6 actions)

1. **➕ Add** - Add new time entry
2. **📄 Import Timesheet** - Bulk import
3. **✅ Post/Submit** - Submit timesheet for approval
4. **💰 Expenses** - Manage expenses
5. **📤 Upload Invoice** - Upload invoice document
6. **🖨️ Print** - Print timesheet

**All actions trigger:** `javascript:__doPostBack('ctl00$body$btn[ActionName]','')`

#### Summary Metrics

Display in horizontal card layout:

| Metric | Value | Description |
|--------|-------|-------------|
| Total Regular Time | 56.00 hours | Billable hours logged this period, excludes ETO |
| Converted ETO Time | 0.00 | ETO hours converted |
| Used ETO Time | 0.00 | ETO hours used this period |
| Total Time | 56.00 hours | All hours: regular + ETO/time-off |
| ETO Hours Remaining | 33.92 + 0.00 hours | Pre-period balance + net change |
| Pending Days | 4 days | Days not yet logged/submitted |

#### Time Entries Table

**Columns:**
- Date (with timestamp of entry creation)
- Project/Task # (often empty)
- Client
- Description
- In (time 1)
- Out (time 1)
- In (time 2)
- Out (time 2)
- Total (h)
- Actions (Edit, Duplicate icons)

**Example Entry:**
```
Date: 04/01/2026 (Created: 04/08/2026 10:08 EST)
Client: Aderant
Description: Worked on: PR #239, #189, Review PR #9, #54, #261
Times: 08:00-12:00, 13:00-17:00
Total: 8.00 hours
Actions: [Edit] [Duplicate]
```

**Per-Entry Actions:**
- **Edit:** `javascript:__doPostBack('ctl00$body$datagrid1$ctl[N]$lnkEdit','')`
- **Duplicate:** `javascript:__doPostBack('ctl00$body$datagrid1$ctl[N]$lnkDuplicate','')`

#### Floating Add Button
- Appears at bottom right
- Same function as toolbar Add button

**Screenshot:**
- `screenshots/03-post-login.png` - Main dashboard

---

## 4. Add/Edit Time Entry Interface

### Calendar Component
- Visual calendar picker appears
- Allows date selection for time entry
- Integrated into main page (not modal)

### Form Fields (inferred from network data)
Based on ViewState and form post data:

```
- Date selector
- Project/Task # (optional)
- Client selector
- Description (text area)
- In time 1
- Out time 1  
- In time 2
- Out time 2
- Total hours (calculated)
```

### Validation Rules
From network payload analysis:
- Working hours per period tracked: 88 hours expected
- Time mismatch justification may be required
- Period validation: entries must be within selected period

**Screenshot:**
- `screenshots/10-add-time-entry.png` - Add time entry with calendar

---

## 5. ETO (Earned Time Off) Management

### ETO Page Components
- **Current Balance Display:** 33.92 hrs
- **Table with columns:**
  - Date
  - Project
  - Description
  - ETO
  - Hours
  - Actions (Edit, Delete)
  
- **Actions:**
  - Add ETO entry button
  - View/edit existing ETO records

**Screenshot:**
- `screenshots/05-eto.png` - ETO management screen

---

## 6. User Preferences

### Available Settings
**Time Off Reminders section** with 3 options:

1. Send reminder 1 business day before time-off events
2. Send reminder 3 business days before time-off events  
3. Send recurring reminder every 3 business days for upcoming time-off events

All settings are checkbox-based, email delivery.

**Screenshot:**
- `screenshots/06-preferences.png` - User preferences

---

## 7. Time Off Events

### Page Features
- **Consultant selector** (dropdown)
- **View button** to load data
- **Add Time button** (green, top right)
- **Search box**
- **Entries per page** selector (10 default)

### Table Structure
- Consultant
- Period Range
- Reason
- Client Aware? (Yes/No)
- Actions

**Current State:** Empty table ("No data available in table")

**Screenshot:**
- `screenshots/07-time-off-events.png` - Time off events

---

## 8. Critical Workflows & Business Rules

### From User Manual Analysis

#### Submission Deadlines
**CRITICAL:** Submit timesheets by **7th and 22nd** of each month

**Consequences of Late Submission:**
- Service Complaint on permanent record
- Affects payment timing (bank account deposits delayed)
- Impacts contract renewal negotiations
- Added to "List of Recurrent Late Posters"
- Can affect rate in future contracts
- Disrupts client processes (even for monthly-paid consultants)
- Creates awkward client calls about missing timesheets
- Gives accounting team extra administrative work

#### Invoice Workflow (3 steps)

**Step 1:** Upload invoice and Post
- Select second icon from right in upper orange ribbon
- Labeled "Upload invoice and Post"

**Step 2:** Check hours and amount
- Verify hours match your rate
- Click "Next" button to advance

**Step 3:** Generate or upload invoice
- System auto-generates invoice (use provided)
- OR upload custom invoice via "Choose File" button

#### Time Entry Best Practices
- Set calendar reminders for time-off events
- Add alarm in phone/computer
- Check "10 Easy Tips to Remember to Enter Your Hours Every Day"
- Use accrued ETO days freely (but add to timesheet)

---

## 9. Technical Architecture

### Frontend Technology
- **Framework:** ASP.NET WebForms (.NET Framework)
- **State Management:** ViewState (heavy, ~10KB+ per page)
- **UI Library:** Material Icons (Google)
- **Responsive:** Appears mobile-responsive (needs testing)

### Backend Patterns
- **Primary Endpoint:** `Default.aspx` (handles most actions via postback)
- **Newer Endpoints:** `/v2/` prefix for modern pages (likely MVC/API)
- **Form Submission:** POST with encoded form data + ViewState
- **AJAX:** Uses ASP.NET AJAX (`__ASYNCPOST=true`)

### Network Request Patterns

#### ASP.NET Postback Structure
```
POST https://timetrack.number8.com/Default.aspx
Content-Type: application/x-www-form-urlencoded

Key fields:
- __EVENTTARGET: ctl00$body$btn[ActionName]
- __EVENTARGUMENT: (empty or parameters)
- __VIEWSTATE: (large encrypted state blob)
- __VIEWSTATEGENERATOR: CA0B0334
- Form fields: ddlPayPeriods, ddlUser, etc.
- __ASYNCPOST: true (for AJAX requests)
```

#### Modern API Endpoints
- `/v2/My/ETO` - ETO management
- `/v2/My/Preferences` - User preferences
- `/v2/My/TimeOffEvents` - Time off tracking
- `/v2/Reports/TimesheetTimeliness` - Reports
- `/v2/Support` - Help center

### Data Flow
1. User action → JavaScript `__doPostBack(target, args)`
2. Form serialization with ViewState
3. POST to server
4. Server processes, updates ViewState
5. Partial page update (AJAX) or full page reload
6. Client renders updated state

### Analytics
- **Google Analytics:** G-QVCT0RTT0Z
- Tracks page views, user engagement
- Tag manager integration

---

## 10. Call-to-Action (CTA) Mapping

### Authentication CTAs
| CTA | Type | Trigger | Destination |
|-----|------|---------|-------------|
| Sign In with Okta | Button | Click | `number8.okta.com/login` |
| Get Started | Button | Form submit | `Default.aspx` (username/password auth) |
| Forgot Password? | Link | Click | Password recovery flow |

### Main Dashboard CTAs
| CTA | Icon | Action | JavaScript Call |
|-----|------|--------|----------------|
| Add | ➕ | Add time entry | `__doPostBack('ctl00$body$btnAddUp','')` |
| Import | 📄 | Import timesheet | `__doPostBack('ctl00$body$btnImportTimesheet','')` |
| Post | ✅ | Submit timesheet | `__doPostBack('ctl00$body$btnPostUp','')` |
| Expenses | 💰 | Manage expenses | `__doPostBack('ctl00$body$btnExpenses','')` |
| Upload | 📤 | Upload invoice | `__doPostBack('ctl00$body$btnUpload','')` |
| Print | 🖨️ | Print timesheet | `__doPostBack('ctl00$body$btnPrintableUP','')` |
| View | 🔍 | Load period | `__doPostBack('ctl00$body$btnChange','')` |
| Edit (per entry) | ✏️ | Edit entry | `__doPostBack('ctl00$body$datagrid1$ctl[N]$lnkEdit','')` |
| Duplicate (per entry) | 📋 | Duplicate entry | `__doPostBack('ctl00$body$datagrid1$ctl[N]$lnkDuplicate','')` |
| Floating Add | ➕ | Add time entry | `__doPostBack('ctl00$body$btnAddFloating','')` |

### Navigation CTAs
| Menu Item | URL | Method |
|-----------|-----|--------|
| Home | `Default.aspx` | GET |
| My → ETO | `/v2/My/ETO` | GET |
| My → Preferences | `/v2/My/Preferences` | GET |
| My → Time Off Events | `/v2/My/TimeOffEvents` | GET |
| My → Timesheet | `Default.aspx` | GET |
| Reports → Timesheet Details | `Reports2.aspx` | GET |
| Reports → Timesheet Timeliness | `/v2/Reports/TimesheetTimeliness` | GET |
| Martin → Change Password | `ChangePassword.aspx` | GET |
| Martin → Help Center | `/v2/Support` | GET |
| Martin → Logout | Postback | POST |

---

## 11. User Roles & Permissions

### Single User View (Current: Martin Larios)
**Observed Permissions:**
- ✅ View own timesheet
- ✅ Add/edit/duplicate time entries
- ✅ Submit timesheet for approval
- ✅ Manage own ETO
- ✅ Add time off events
- ✅ View reports (own data)
- ✅ Upload invoices
- ✅ Print timesheets
- ❌ View other users' data (User dropdown disabled)

**Relationships:**
- **Team Lead:** Alessandro Silveira
- **Consultant ID:** 24563

### Manager/Lead View (Not Currently Visible)
**Expected Features (from user manual context):**
- View team members' timesheets
- Approve submitted timesheets
- Manage team ETO
- View team reports
- Access to "List of Recurrent Late Posters"
- Organization chart view

**Screenshot Context Clues:**
- "Your Organization" button visible (device_hub icon)
- User dropdown exists but disabled for single user
- Likely enables for managers to view team members

### Admin View (Not Accessible)
**Inferred from form data:**
- `hIsAdminOrPayrollSpecialist=false` in ViewState
- Different permission levels exist
- Payroll specialists have specific access

---

## 12. Mobile Readiness Assessment

### Current State
- **Responsive Design:** Appears partially responsive
- **Mobile Navigation:** Hamburger menu pattern not visible
- **Touch Targets:** Buttons/links appear adequately sized
- **Forms:** Standard HTML inputs (should work on mobile)
- **Calendar:** Desktop calendar widget (may need mobile alternative)

### Challenges for Mobile App
1. **Heavy ViewState:** 10KB+ state management (not suitable for mobile API)
2. **Postback Architecture:** Full page reloads (not ideal for mobile UX)
3. **Session Management:** Cookie-based (need token-based for mobile)
4. **Offline Support:** None (required for mobile)
5. **Push Notifications:** Not available (needed for deadline reminders)

### Opportunities
- `/v2/` endpoints suggest modern API layer exists
- Okta integration provides OAuth tokens (usable for mobile)
- Clear data structures (can be replicated in mobile API)
- Simple workflows (translate well to mobile screens)

---

## 13. Key Findings for Mobile Development

### Must-Have Features
1. **Okta SSO** - Mobile OAuth flow
2. **Period Selection** - Bi-monthly periods
3. **Time Entry CRUD** - Add, edit, duplicate, delete
4. **Timesheet Submission** - Post for approval
5. **ETO Management** - View balance, add entries
6. **Deadline Reminders** - Push notifications for 7th/22nd
7. **Offline Mode** - Draft entries offline, sync later
8. **Quick Entry** - Simplified mobile-first time entry form

### Nice-to-Have Features
1. Time off events management
2. Expense tracking
3. Invoice upload
4. Reports viewing
5. Team organization chart
6. Timesheet import
7. Print functionality (export PDF)

### Technical Requirements
1. **API Development** - RESTful API layer (likely extend `/v2/` endpoints)
2. **OAuth Integration** - Okta mobile SDK
3. **Offline Storage** - SQLite or similar
4. **Sync Engine** - Bidirectional sync with conflict resolution
5. **Push Notifications** - FCM (Android) / APNS (iOS)
6. **Biometric Auth** - Touch ID / Face ID

---

## 14. Data Models (Inferred)

### TimeEntry
```typescript
{
  id: number,
  consultantId: number,
  date: string, // YYYY-MM-DD
  payPeriodId: number,
  projectTaskNumber: string | null,
  clientName: string,
  description: string,
  inTime1: string, // HH:mm
  outTime1: string,
  inTime2: string | null,
  outTime2: string | null,
  totalHours: number,
  createdAt: string, // timestamp
  modifiedAt: string | null
}
```

### PayPeriod
```typescript
{
  id: number,
  startDate: string,
  endDate: string,
  displayText: string, // "MM/DD/YYYY - MM/DD/YYYY"
  isCurrent: boolean
}
```

### Consultant
```typescript
{
  id: number,
  name: string,
  email: string,
  teamLeadId: number,
  etoBalance: number,
  paymentType: string, // "Hourly" | "Monthly"
  workingHoursPerPeriod: number
}
```

### ETO Entry
```typescript
{
  id: number,
  consultantId: number,
  date: string,
  hours: number,
  description: string,
  projectName: string | null
}
```

---

## 15. Next Steps: Mobile App Planning

### Phase 1: Requirements & Design
1. **User Stories** - Define user journeys for mobile
2. **Wireframes** - Mobile-first UI design
3. **API Specification** - Define needed endpoints
4. **Architecture** - Choose tech stack (React Native, Flutter, native)

### Phase 2: MVP Features
1. Authentication (Okta)
2. View timesheet (current period)
3. Add time entry (simple form)
4. Edit time entry
5. View ETO balance
6. Submit timesheet

### Phase 3: Enhanced Features
1. Offline mode with sync
2. Push notifications (deadlines)
3. Duplicate time entries
4. Multi-period view
5. Time off events
6. Preferences

### Phase 4: Advanced Features
1. Expense tracking
2. Invoice upload (camera)
3. Reports
4. Team view (managers)
5. Biometric auth
6. Widget support (iOS/Android)

---

## Appendices

### A. Screenshots Captured
1. `01-login-page.png` - Initial login
2. `02-okta-login.png` - Okta SSO
3. `03-post-login.png` - Main dashboard
4. `04-my-menu-expanded.png` - My menu
5. `05-eto.png` - ETO management
6. `06-preferences.png` - User preferences
7. `07-time-off-events.png` - Time off events
8. `08-reports-menu-expanded.png` - Reports menu
9. `09-user-menu-expanded.png` - User menu
10. `10-add-time-entry.png` - Add time entry

### B. Snapshots Captured
- Accessibility tree snapshots for all screens (11 files)
- Network request logs (2 files)

### C. Network Logs
- `network-logs/01-login-flow.json` - Authentication flow
- `network-logs/02-full-session.json` - Full session requests

---

**End of Report**
