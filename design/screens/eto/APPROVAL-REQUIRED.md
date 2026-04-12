# ETO Screen - Design Approval Required

## Overview

Three design variations have been created for the ETO (Earned Time Off) screen, each optimized for different user workflows and usage patterns. This document compares the variations and requires user approval before implementation.

---

## Variations Summary

### Variation A: Balance-Focused with Visual Chart
**Concept:** Emphasize current balance with visual chart showing accrual trends over time

**Key Features:**
- Large gradient balance card (prominent, beautiful)
- Line chart showing 6-month balance history
- Quick action buttons (Use ETO, Details)
- Recent transactions list (3-5 items)
- "View All Transactions" link for full list
- Visual, trend-focused approach

### Variation B: Transaction-First List View
**Concept:** Desktop-like transaction list optimized for mobile, similar to bank statement

**Key Features:**
- Sticky gradient balance bar at top
- Comprehensive transaction list grouped by month
- Search and filter functionality
- Running balance visible for each transaction
- Swipe actions for edit/delete
- Infinite scroll pagination
- Data-dense, audit-friendly

### Variation C: Hybrid Card View with Quick Actions
**Concept:** Balanced approach with prominent balance, quick actions, and card-based transaction view

**Key Features:**
- Large balance card with border accent
- Prominent "Use ETO" action button
- Stats button for quick summary
- Card-based recent transactions (4-5 items)
- Progressive disclosure (modals for details)
- Modern, touch-friendly design
- Best of both worlds

---

## Detailed Comparison

| Aspect | Variation A: Balance + Chart | Variation B: Transaction List | Variation C: Hybrid Cards |
|--------|----------------------------|------------------------------|---------------------------|
| **Balance Visibility** | Excellent (large gradient card) | Good (sticky bar) | Excellent (large bordered card) |
| **Transaction Focus** | Low (recent only) | High (full list primary) | Medium (recent cards) |
| **Visual Appeal** | Highest (chart, gradient) | Moderate (functional) | High (cards, modern) |
| **Quick Actions** | Prominent (2 buttons) | Hidden in menu | Very Prominent (large button) |
| **Data Density** | Low (chart takes space) | Highest (list view) | Medium (card spacing) |
| **Trend Visibility** | Excellent (chart) | Poor (no visualization) | Low (stats modal only) |
| **Search/Filter** | Limited (Details screen) | Excellent (primary feature) | Available (via menu) |
| **Scrolling Required** | Minimal (chart above fold) | Significant (long lists) | Moderate (4-5 cards) |
| **Touch Targets** | Large (good) | Medium (list rows) | Largest (cards, buttons) |
| **Desktop Similarity** | Low | High | Medium |
| **Learning Curve** | Easy (visual) | Easy (familiar pattern) | Easy (intuitive) |
| **Power User Efficiency** | Medium | High (search/filter) | Medium |
| **Mobile-Optimized** | Excellent | Good | Excellent |
| **Implementation Complexity** | High (chart library) | Medium (standard list) | Medium-High (modals) |

---

## Use Case Scenarios

### Scenario 1: Quick Balance Check
**User:** Manager quickly checking ETO balance during meeting

**Variation A:**
- Balance immediately visible (large)
- Chart shows trend at a glance
- Time: 2 seconds
- ✅ Excellent

**Variation B:**
- Balance visible in sticky bar
- Need to read smaller text
- Time: 3 seconds
- ⚠️ Good

**Variation C:**
- Balance immediately visible (large)
- Clean, uncluttered
- Time: 2 seconds
- ✅ Excellent

**Winner:** A & C (tie)

---

### Scenario 2: Using ETO for Time Off
**User:** Employee wants to apply ETO hours to today's time entry

**Variation A:**
- Tap "Use ETO" quick action button
- Fill modal form
- Time: 8 seconds
- ✅ Efficient

**Variation B:**
- Tap more menu (⋮)
- Select "Use ETO"
- Fill modal form
- Time: 12 seconds
- ⚠️ Extra steps

**Variation C:**
- Tap large "Use ETO" button
- Fill modal form
- Time: 6 seconds
- ✅ Most efficient (largest button)

**Winner:** Variation C

---

### Scenario 3: Reviewing ETO Transaction History
**User:** HR auditing ETO transactions for the last 6 months

**Variation A:**
- Tap "Details" button
- Navigate to transaction list
- Search/filter as needed
- Time: 15+ seconds to get to full list
- ⚠️ Extra navigation

**Variation B:**
- Already viewing transaction list
- Use search/filter immediately
- Scroll through months
- Time: 5 seconds to start reviewing
- ✅ Optimal

**Variation C:**
- Tap "View All" link
- Navigate to full list screen
- Time: 10 seconds to get to full list
- ⚠️ Requires navigation

**Winner:** Variation B

---

### Scenario 4: Understanding ETO Accrual Pattern
**User:** Employee wants to know if their ETO is growing as expected

**Variation A:**
- Chart immediately visible
- Shows 6-month trend
- Can see if accrual is consistent
- Time: 5 seconds
- ✅ Perfect for this

**Variation B:**
- Must mentally calculate from list
- Can see amounts but no visualization
- Time: 30+ seconds
- ❌ Difficult

**Variation C:**
- Tap stats button
- View summary (numerical)
- No chart visualization
- Time: 10 seconds
- ⚠️ Lacks visual trend

**Winner:** Variation A

---

### Scenario 5: Finding Specific Transaction
**User:** Need to find that vacation ETO usage from December

**Variation A:**
- Tap "Details" → full list
- Use search/filter
- Time: 20 seconds
- ⚠️ Multiple steps

**Variation B:**
- Tap search icon
- Type "vacation"
- Immediate results
- Time: 8 seconds
- ✅ Fastest

**Variation C:**
- Tap menu → Search
- Type "vacation"
- Time: 12 seconds
- ⚠️ Extra tap

**Winner:** Variation B

---

### Scenario 6: First-Time User Exploring ETO
**User:** New employee checking out ETO feature for first time

**Variation A:**
- Chart might be confusing initially
- Balance is clear
- Actions clear with icons
- ⚠️ Chart adds complexity

**Variation B:**
- Familiar list pattern
- Everything visible
- Might be overwhelming (data-heavy)
- ⚠️ Functional but not inviting

**Variation C:**
- Clean, modern layout
- Clear balance and actions
- Cards are inviting
- ✅ Most approachable

**Winner:** Variation C

---

## Visual & UX Highlights

### Variation A Strengths
✅ Chart provides immediate visual feedback on trends  
✅ Large gradient balance card is beautiful and prominent  
✅ Quick actions clearly labeled  
✅ Great for understanding accrual patterns  
✅ Minimal scrolling for primary info  
✅ Modern, polished aesthetic  

### Variation A Weaknesses
❌ Chart requires library (implementation complexity)  
❌ Chart may not be used by all users (wasted space)  
❌ Transaction list is secondary (requires navigation)  
❌ Limited transaction visibility (only recent)  
❌ Search/filter buried in Details screen  

---

### Variation B Strengths
✅ Maximum transaction visibility  
✅ Search and filter as primary features  
✅ Familiar bank statement pattern  
✅ Running balance for every transaction  
✅ Efficient for power users  
✅ Great for auditing/reviewing history  
✅ Sticky balance bar always visible  
✅ Most similar to desktop version  

### Variation B Weaknesses
❌ Balance less prominent (smaller, sticky bar)  
❌ Data-dense can feel overwhelming  
❌ No visual trend representation  
❌ "Use ETO" action buried in menu  
❌ Less visually appealing (functional over form)  
❌ Requires more scrolling for long histories  

---

### Variation C Strengths
✅ Best balance between form and function  
✅ Large "Use ETO" button (most common action)  
✅ Card-based design feels modern and native  
✅ Progressive disclosure reduces overwhelm  
✅ Large touch targets (mobile-optimized)  
✅ Clean visual hierarchy  
✅ Stats button for quick summaries  
✅ Approachable for new users  

### Variation C Weaknesses
❌ Transaction history requires navigation (not immediate)  
❌ No chart/visual trend (stats modal only has numbers)  
❌ Cards take more space (fewer items visible)  
❌ Search/filter in menu (extra tap)  
❌ More modals = more taps for detailed info  

---

## Technical Implementation Considerations

### Development Complexity

**Variation A:**
- Complexity: High
- Key Challenges:
  - Chart library integration (react-native-chart-kit or Victory Native)
  - Chart data formatting and touch interactions
  - Tooltip positioning on chart
  - Gradient backgrounds
  - Multiple modal views
- Estimated Time: 12-14 hours
- Dependencies: Chart library (~50KB added)

**Variation B:**
- Complexity: Medium
- Key Challenges:
  - Sticky header with gradient
  - Section list with month grouping
  - Search overlay with real-time filtering
  - Swipe-to-action gestures
  - Infinite scroll pagination
  - Filter action sheet
- Estimated Time: 8-10 hours
- Dependencies: Standard React Native components

**Variation C:**
- Complexity: Medium-High
- Key Challenges:
  - Multiple bottom sheet modals
  - Smooth modal animations
  - Card-based layout consistency
  - Progress bar/circular progress
  - Large number input with chips
  - Pull-to-refresh
- Estimated Time: 10-12 hours
- Dependencies: Bottom sheet library

---

### Maintenance Considerations

**Variation A:**
- Chart library updates needed
- Chart data transformation logic
- Two navigation paths (recent vs. full list)
- Gradient styling consistency

**Variation B:**
- Straightforward list maintenance
- Search/filter logic centralized
- Swipe gesture reliability testing
- Pagination logic

**Variation C:**
- Multiple modal components to maintain
- Animation performance critical
- Card component reusability
- Modal state management

---

## Recommended Variation

### Recommendation: **Variation C - Hybrid Card View**

**Rationale:**

1. **Best for Primary Use Case:** Most users will:
   - Check their balance (large card, immediate)
   - Use ETO when needed (huge button, one tap)
   - Occasionally review recent transactions (cards visible)
   - Rarely need full history (accessible via "View All")

2. **Mobile-First Design:** 
   - Large touch targets (64px button)
   - Card-based layout (modern, native feel)
   - Progressive disclosure (no overwhelm)
   - Gesture-friendly (pull-to-refresh, swipe modals)

3. **Visual Appeal:**
   - Clean, modern aesthetic
   - Not too minimal (like A's chart dependence)
   - Not too dense (like B's data-heavy approach)
   - Professional yet approachable

4. **Balanced Approach:**
   - Balance is prominent but not dominating
   - Actions are accessible without being intrusive
   - Transactions visible without cluttering
   - Details available on demand

5. **User Feedback Optimization:**
   - New users: Clear, inviting, easy to understand
   - Regular users: Fast access to "Use ETO" (most common action)
   - Power users: Stats and full list available when needed
   - HR/Managers: Detail modals provide full info

6. **Implementation Feasibility:**
   - Medium-high complexity (manageable)
   - No heavy dependencies (no chart library)
   - Standard React Native patterns
   - Bottom sheet libraries well-established

7. **Future Expandability:**
   - Easy to add chart later (in stats modal)
   - Card pattern can extend to other screens
   - Modal architecture allows new features
   - Can add more quick actions if needed

**When NOT to Choose Variation C:**
- If users frequently audit full transaction history (choose B)
- If visual trend analysis is critical requirement (choose A)
- If development timeline is very tight (choose B, simpler)
- If users explicitly prefer desktop-like dense data views (choose B)

---

## Alternative Recommendation: Variation A

**If visual trends are important**, consider Variation A:

**Choose Variation A if:**
- Users need to understand ETO accrual patterns
- Visual feedback is valued over transaction list
- You want the most polished, modern look
- Development timeline allows for chart implementation
- Users prefer visual dashboards over data lists

**Advantages over C:**
- Chart provides unique value (trend visualization)
- Slightly more visually impressive
- Better for understanding long-term patterns

**Disadvantages vs C:**
- Longer implementation time
- Chart may not be frequently used
- Transaction access requires more navigation

---

## Hybrid Approach: Best of Both Worlds

**Consider a phased implementation:**

**Phase 1:** Implement Variation C (Hybrid Card View)
- Fast time to market
- Covers all primary use cases
- Modern, mobile-optimized

**Phase 2:** Add chart to stats modal (borrowing from Variation A)
- Tap stats button → shows numerical summary + chart
- Best of both worlds
- Incremental enhancement

**Phase 3:** Add advanced search/filter (borrowing from Variation B)
- Enhance "View All" screen with B's powerful filters
- Power user features without cluttering main screen

This staged approach provides immediate value while leaving room for enhancement based on actual usage patterns.

---

## Questions for Stakeholder

Before proceeding with implementation, please clarify:

1. **Primary Use Case Priority:**
   - Quick balance checks (most common) → Variation C
   - Full transaction history review (frequent) → Variation B
   - Understanding accrual trends (visual learners) → Variation A

2. **User Profile:**
   - Are most users tech-savvy? → Variation B or C work well
   - Are users new to ETO concepts? → Variation C most approachable
   - Are users visual learners? → Variation A's chart helps

3. **"Use ETO" Frequency:**
   - Used frequently (weekly/monthly) → Variation C (prominent button)
   - Used rarely (quarterly) → Any variation works
   - Used often with complex needs → Variation B (more data context)

4. **Audit/Compliance Requirements:**
   - High (HR needs detailed review) → Variation B
   - Medium (occasional checks) → Variation C
   - Low (balance is enough) → Variation A or C

5. **Development Timeline:**
   - Need it ASAP → Variation B (8-10 hours)
   - Standard timeline → Variation C (10-12 hours) ⭐ RECOMMENDED
   - Can invest time → Variation A (12-14 hours)

6. **Future Features:**
   - Planning to add ETO policies/rules info? → C's modal architecture helps
   - Planning to add ETO transfer between users? → B's detailed view helps
   - Planning to add ETO forecasting? → A's chart architecture helps

---

## Next Steps

**APPROVAL REQUIRED:**

Please review all three variations and approve ONE of the following:

- [ ] **Approve Variation A** (Balance-Focused with Chart)
- [ ] **Approve Variation B** (Transaction-First List View)
- [ ] **Approve Variation C** (Hybrid Card View) ⭐ RECOMMENDED
- [ ] **Approve Hybrid Approach** (Phase 1: C, Phase 2: Add A's chart, Phase 3: Add B's filters)
- [ ] **Request Modifications** (specify changes)

**Once approved, the following will be created:**
1. React Native + NativeWind component code (`apps/mobile/app/(tabs)/eto.tsx`)
2. Modal components for transaction details, use ETO, stats
3. ETO service integration with timetrack API
4. State management (balance, transactions, filters)
5. Pull-to-refresh and loading states
6. Error handling and empty states

**Additional Deliverables:**
- Transaction list screen component (for "View All")
- Reusable card components
- Reusable modal components
- Form validation for "Use ETO"

---

## Reference Materials

- **Desktop Reference:** `/screenshots/05-eto.png`
- **Design System:** `/design/bento-box-system.md`
- **Variation A Specs:** `/design/screens/eto/variation-a-balance-focused.md`
- **Variation B Specs:** `/design/screens/eto/variation-b-transaction-list.md`
- **Variation C Specs:** `/design/screens/eto/variation-c-hybrid-card-view.md`

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 4 - ETO Screen Design  
**Status**: AWAITING APPROVAL  
**Recommended**: Variation C (Hybrid Card View)  
**Alternative**: Hybrid Approach (Phased Implementation)
