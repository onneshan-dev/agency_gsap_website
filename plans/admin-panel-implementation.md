# Admin Panel Implementation Plan

## Overview
Pixel-perfect implementation of the Admin Dashboard designs from `Design/Admin Panel.pen` into the existing Onneshon codebase.

## Clarifications Received
- **Priority**: Start with Admin Dashboard v2
- **Branding**: Keep "Onneshon", replace "StoreBuilder" references
- **Approach**: Desktop-first (1280px+), then mobile
- **Skip**: Milestone tasks, online status avatars, interactive Gantt charts, file previews, drag-and-drop

---

## Phase 1: Admin Dashboard v2

### Design Specifications (from pen file)

#### Layout Structure
- **Container**: 1440px width, light theme
- **Sidebar**: 273px width, fill height, `#F1F0ED` background
- **Main Content**: Flexible width, `#F8F7F4` background
- **Header**: 64px height, white background

#### Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--admin-primary` | `#2D5A3D` | Primary buttons, active nav, progress bars |
| `--admin-accent` | `#C76F30` | Badges, alerts, highlights |
| `--admin-bg` | `#F8F7F4` | Main background |
| `--admin-surface` | `#FFFFFF` | Cards, modals, inputs |
| `--admin-sidebar` | `#F1F0ED` | Sidebar background |
| `--admin-border` | `#E5E3DE` | Borders, dividers |
| `--admin-text-primary` | `#1A1A1E` | Headings, primary text |
| `--admin-text-secondary` | `#5F5F67` | Body text |
| `--admin-text-muted` | `#9A9AA0` | Labels, placeholders |

#### Typography
- **Font Family**: Inter (primary), Outfit (brand/logo)
- **Brand Name**: 14px, weight 700, color `#1A1A1E`
- **Brand Subtitle**: 11px, weight 500, color `#2D5A3D`
- **Nav Label**: 10px, weight 600, letter-spacing 1px, uppercase
- **Nav Item**: 13.5px, weight 500
- **Section Title**: 20px, weight 600
- **Card Title**: 14px, weight 600
- **Body**: 13px, weight 400

#### Spacing Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px

#### Border Radius
- **sm**: 6px (buttons, inputs)
- **md**: 8px (cards, nav items)
- **lg**: 10px (badges, avatars)
- **xl**: 12px (large cards, modals)

---

### Component Breakdown

#### 1. Sidebar Updates

**Brand Header Section**
```
Height: auto (padding 16px 20px)
Border-bottom: 1px solid #E5E3DE
Content: Logo icon (32x32) + Brand text
Gap: 10px
```

**Logo Icon**
```
Size: 32x32px
Border-radius: 8px
Background: linear-gradient(180deg, #2D5A3D 0%, #1A3C28 100%)
Text: "O" (white, 16px, weight 700, Outfit font)
```

**Search Bar**
```
Height: 34px
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 8px
Padding: 0 10px
Icon: Search (14px, #9A9AA0)
Placeholder: "Search..." (12.5px, #9A9AA0)
Shortcut badge: "/" key (22x20px, #F8F7F4 bg, 5px radius)
```

**Navigation Sections**
```
Padding: 8px 12px
Gap between sections: 20px
Section label: 10px uppercase, #9A9AA0, letter-spacing 1px
Nav item: padding 9px 10px, gap 10px, border-radius 6px
Active state: bg #2D5A3D, text white
Inactive state: hover bg white
```

**Nav Items (MAIN section)**
- Dashboard (layout-grid icon)
- Setup Wizard (zap icon)
- All Orders (shopping-bag icon) - with badge "3"
- Abandoned (shopping-cart icon)
- Products (tag icon)
- Categories (folder icon)
- Customers (users icon)

**Nav Items (MANAGEMENT section)**
- Projects (folder-kanban icon)
- Tasks (list-todo icon)
- Calendar (calendar icon)
- Analytics (bar-chart-3 icon)
- Settings (settings icon)

**Bottom Section**
- Separator: 1px solid #E5E3DE
- Help Center (help-circle icon)
- Collapse Sidebar (panel-left icon)

---

#### 2. Header Component

**Structure**
```
Height: 64px
Background: #FFFFFF
Border-bottom: 1px solid #E5E3DE
Padding: 0 24px
```

**Left Side**
- Page title: 20px, weight 600, #1A1A1E
- Breadcrumb: Home icon > Dashboard (14px, #9A9AA0 > #5F5F67)

**Right Side**
```
Gap: 16px
Items: Search button, Notifications, Messages, User dropdown
```

**Notification Button**
```
Size: 40x40px
Background: #F8F7F4
Border-radius: 8px
Icon: Bell (20px, #5F5F67)
Badge: Red dot (8px) positioned top-right
```

**User Dropdown**
```
Gap: 10px
Avatar: 36x36px, border-radius 50%
Text block:
  - Name: 14px, weight 600, #1A1A1E
  - Role: 12px, #9A9AA0
Chevron: 16px, #9A9AA0
```

---

#### 3. Dashboard Content Layout

**Container**
```
Padding: 24px 32px
Gap: 24px (between sections)
```

**Section 1: Stats Cards Row**
```
Display: flex
Gap: 16px
4 cards in a row (equal width)
```

**Stat Card Design**
```
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 20px
Layout: vertical, gap 16px
```

**Stat Card Header**
```
Icon container: 40x40px, border-radius 10px
Icon size: 20px
Background colors:
  - Active Projects: #DBEAFE (blue), icon #2563EB
  - Pending Tasks: #FEF3C7 (yellow), icon #D97706
  - Total Revenue: #D1FAE5 (green), icon #059669
  - New Clients: #F3E8FF (purple), icon #7C3AED
```

**Stat Card Content**
```
Label: 13px, #9A9AA0, weight 500
Value: 24px, #1A1A1E, weight 700
Trend: 
  - Up: #22C55E with trending-up icon
  - Down: #EF4444 with trending-down icon
  - Text: 12px, "+12% from last month"
```

---

#### 4. Main Content Grid

**Two Column Layout**
```
Left column: 65% width (flexible)
Right column: 380px fixed
Gap: 24px
```

**Left Column Content**
1. Active Projects Card
2. Recent Activity Feed

**Right Column Content**
1. Tasks Overview Card
2. Top Clients Card
3. Upcoming Deadlines Card

---

#### 5. Active Projects Card

**Card Container**
```
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 24px
```

**Header**
```
Title: "Active Projects" (16px, weight 600, #1A1A1E)
View All link: 13px, #2D5A3D, weight 500
```

**Project List Item**
```
Height: 72px
Border-bottom: 1px solid #E5E3DE (except last)
Padding: 16px 0
Layout: flex, align-items center
Gap: 16px
```

**Project Item Structure**
```
1. Project Badge: 44x44px, border-radius 10px
   - Background: Project color (blue #DBEAFE, green #D1FAE5, etc.)
   - Text: First letter, 16px, weight 700, color matches theme

2. Project Info (flex: 1)
   - Name: 14px, weight 600, #1A1A1E
   - Type: 12px, #9A9AA0

3. Progress Section (140px width)
   - Percentage: 13px, weight 600, #2D5A3D
   - Bar: 100% width, 6px height, #E5E3DE bg, 3px radius
   - Fill: #2D5A3D, same radius

4. Status Badge
   - Padding: 4px 10px
   - Border-radius: 20px
   - Font: 12px, weight 500
   - Colors:
     - In Progress: bg #DBEAFE, text #2563EB, dot #2563EB
     - Completed: bg #D1FAE5, text #059669, dot #059669
     - On Hold: bg #F3F4F6, text #6B7280, dot #6B7280

5. Due Date
   - Text: 13px, #5F5F67
   - Format: "Mar 15"

6. Team Avatars
   - Overlapping stack (gap: -8px)
   - Each avatar: 28x28px, border-radius 50%
   - Border: 2px solid #FFFFFF
   - Max 3 visible, +N indicator if more
```

---

#### 6. Recent Activity Feed Card

**Card Container**
```
Same as Active Projects
Height: auto (max 400px scrollable)
```

**Header**
```
"Recent Activity" + Filter dropdown
```

**Activity Item**
```
Padding: 16px 0
Border-bottom: 1px solid #E5E3DE
Layout: flex, gap 12px
```

**Activity Structure**
```
1. Avatar/Icon (40x40px, border-radius 8px)
   - User action: User avatar
   - System action: Icon in colored circle

2. Content (flex: 1)
   - Description: 14px, #1A1A1E
     - Format: "[User] [action] [target]"
     - Example: "Sarah Wilson completed task Homepage Design"
   - Timestamp: 12px, #9A9AA0
     - Format: "2 hours ago", "Yesterday", "Mar 3"

3. Context (optional)
   - Project name badge: bg #F8F7F4, text #5F5F67, 11px
```

**Activity Types & Icons**
```
- Task completed: CheckCircle, bg #D1FAE5, icon #059669
- Comment added: MessageSquare, bg #DBEAFE, icon #2563EB
- File uploaded: FileUp, bg #F3E8FF, icon #7C3AED
- Project created: FolderPlus, bg #FEF3C7, icon #D97706
- Status changed: RefreshCw, bg #F3F4F6, icon #6B7280
```

---

#### 7. Tasks Overview Card (Right Column)

**Card Container**
```
Width: 380px
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 20px
```

**Header**
```
"Tasks Overview" + "View All" link
```

**Donut Chart**
```
Size: 160x160px
Centered in card
Stroke width: 24px
Colors:
  - Completed: #2D5A3D
  - In Progress: #3B82F6
  - Pending: #E5E3DE
Center text:
  - Value: 28px, weight 700, #1A1A1E
  - Label: 12px, #9A9AA0
```

**Legend**
```
Layout: flex, justify-between
Each item:
  - Dot: 8px circle
  - Label: 13px, #5F5F67
  - Count: 13px, weight 600, #1A1A1E
```

**Task List (bottom 3 items)**
```
Each item:
  - Checkbox: 18x18px, border #E5E3DE, radius 4px
  - Task name: 14px, #1A1A1E (strikethrough if completed)
  - Priority dot: 6px
    - High: #EF4444
    - Medium: #D97706
    - Low: #22C55E
```

---

#### 8. Top Clients Card

**Card Container**
```
Same as Tasks Overview
```

**Header**
```
"Top Clients" + "View All"
```

**Client List Item**
```
Padding: 12px 0
Border-bottom: 1px solid #E5E3DE
Layout: flex, align-items center, gap 12px
```

**Client Item Structure**
```
1. Rank number: 16px, weight 600, #9A9AA0, width 20px
2. Client name: 14px, #1A1A1E, flex: 1
3. Project count: 13px, #9A9AA0
   Format: "8 projects"
4. Revenue: 14px, weight 600, #1A1A1E
```

---

#### 9. Upcoming Deadlines Card

**Card Container**
```
Same as other right column cards
```

**Header**
```
"Upcoming Deadlines"
```

**Deadline Item**
```
Padding: 16px
Background: #F8F7F4 (subtle highlight)
Border-radius: 8px
Margin-bottom: 8px
Layout: flex, gap 12px
```

**Deadline Structure**
```
1. Date block:
   - Day: 20px, weight 700, #2D5A3D
   - Month: 11px, #9A9AA0, uppercase
   - Background: #FFFFFF
   - Border: 1px solid #E5E3DE
   - Border-radius: 8px
   - Size: 48x48px

2. Content (flex: 1):
   - Task name: 14px, weight 500, #1A1A1E
   - Project name: 12px, #9A9AA0

3. Days left badge:
   - Text: "2 days" or "Tomorrow"
   - Color: #EF4444 if < 3 days, #D97706 if < 7 days, #22C55E otherwise
```

---

### Implementation Steps

#### Step 1: Update Sidebar Component
**File**: `Codebase/src/components/layout/Sidebar.tsx`

Tasks:
1. Update brand section with gradient logo icon
2. Add search bar with keyboard shortcut badge
3. Reorganize nav sections (MAIN, MANAGEMENT)
4. Update nav item styling (padding, gaps, border-radius)
5. Add bottom help/collapse section

#### Step 2: Update Header Component
**File**: `Codebase/src/components/layout/Header.tsx`

Tasks:
1. Add page title and breadcrumb
2. Update notification button with badge
3. Update user dropdown layout
4. Adjust spacing and alignment

#### Step 3: Create/Update Dashboard Page
**File**: `Codebase/src/pages/admin/DashboardPage.tsx`

Tasks:
1. Implement stats cards row
2. Implement two-column layout
3. Add Active Projects card
4. Add Recent Activity card
5. Add Tasks Overview card (with chart)
6. Add Top Clients card
7. Add Upcoming Deadlines card

#### Step 4: Create Reusable Components

**New Components Needed**:
1. `StatCard.tsx` - For dashboard stats
2. `ProjectListItem.tsx` - For project rows
3. `ActivityItem.tsx` - For activity feed
4. `DonutChart.tsx` - For tasks overview
5. `DeadlineCard.tsx` - For deadline items

#### Step 5: Update Tailwind Config (if needed)
Verify all admin colors are properly mapped in `tailwind.config.js`.

---

### Pixel-Perfect Checklist

- [ ] Sidebar width exactly 273px
- [ ] All border-radius values match design
- [ ] All spacing values match 4px grid
- [ ] Typography weights and sizes match
- [ ] Icon sizes consistent (14px, 16px, 18px, 20px)
- [ ] Color hex values exact match
- [ ] Card shadows subtle (0 1px 3px rgba(0,0,0,0.05))
- [ ] Hover states implemented
- [ ] Active nav item has exact bg color
- [ ] All gaps and paddings match design

---

### Files to Modify

1. `Codebase/src/components/layout/Sidebar.tsx`
2. `Codebase/src/components/layout/Header.tsx`
3. `Codebase/src/pages/admin/DashboardPage.tsx`
4. `Codebase/src/components/dashboard/StatCards.tsx`
5. `Codebase/src/components/dashboard/RecentActivityFeed.tsx`
6. `Codebase/src/components/dashboard/RecentProjects.tsx`
7. `Codebase/src/components/dashboard/RevenueChart.tsx`

### Files to Create

1. `Codebase/src/components/dashboard/TasksOverview.tsx`
2. `Codebase/src/components/dashboard/TopClients.tsx`
3. `Codebase/src/components/dashboard/UpcomingDeadlines.tsx`
4. `Codebase/src/components/dashboard/StatCard.tsx`
5. `Codebase/src/components/ui/DonutChart.tsx`

---

## Phase 2: Projects Page (Future)
- Filters bar with search, status dropdown, client dropdown
- Grid/List view toggle
- Project table with columns
- Pagination

## Phase 3: Project Details (Future)
- Tab navigation (Overview, Tasks, Files, Team, Timeline)
- Project header with stats
- Simplified task list (no milestones)
- Static team avatars
- Chronological activity list
