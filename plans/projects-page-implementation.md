# Projects Page Implementation Plan

## Overview
Pixel-perfect implementation of the Projects Page from `Design/Admin Panel.pen` for both Desktop (1440px) and Mobile (414px) breakpoints.

**Key Requirements:**
- Use existing global AppBar and SidePanel (AdminLayout)
- Implement both mobile and desktop versions
- Keep "Onneshon" branding

---

## Design Specifications

### Color Tokens (from pen file)
| Token | Value | Usage |
|-------|-------|-------|
| `$primary` | `#2D5A3D` | Primary buttons, active nav, progress bars |
| `$accent` | `#C76F30` | Badges, highlights |
| `$bg` | `#F8F7F4` | Main background |
| `$surface` | `#FFFFFF` | Cards, inputs |
| `$sidebar-bg` | `#F1F0ED` | Sidebar background |
| `$border` | `#E5E3DE` | Borders, dividers |
| `$text-primary` | `#1A1A1E` | Headings, primary text |
| `$text-secondary` | `#5F5F67` | Body text |
| `$text-muted` | `#9A9AA0` | Labels, placeholders |
| Status Blue | `#2563EB` / `#DBEAFE` | In Progress status |
| Status Green | `#16A34A` / `#DCFCE7` | Completed status |
| Status Yellow | `#B45309` / `#FEF3C7` | Pending status |

### Typography
- **Font**: Inter throughout
- **Page Title**: 22px, weight 700, `#1A1A1E`
- **Subtitle**: 13px, weight normal, `#9A9AA0`
- **Table Headers**: 11px, weight 600, uppercase, `#9A9AA0`
- **Project Name**: 14px, weight 600, `#1A1A1E`
- **Project Type**: 12px, weight normal, `#9A9AA0`
- **Status Badge**: 12px, weight 500

---

## Desktop Projects Page (1440px)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (272px) │ Main Content Area (flexible)              │
├─────────────────┴───────────────────────────────────────────┤
│                                                             │
│  [Page Header]                                              │
│  Projects                          [+ New Project]          │
│  24 total · 12 active                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Filters Bar]                                       │   │
│  │ 🔍 Search...  [Status ▼] [Client ▼] [Sort ▼]  ◫ ⊝  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PROJECT │ CLIENT │ STATUS │ PROGRESS │ BUDGET │ ... │   │
│  ├─────────┼────────┼────────┼──────────┼────────┼─────┤   │
│  │ [E] E-  │ Tech   │ ● In   │ ████ 75% │$45,000 │ 👥  │   │
│  │ Commerce│ Corp   │ Progress                                  │
│  ├─────────┼────────┼────────┼──────────┼────────┼─────┤   │
│  │ ...more rows...                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1. Page Header Section

**Container**
```
Padding: 24px 32px
Layout: flex, justify-between, align-center
```

**Left Side - Title Group**
```
Layout: vertical, gap 4px
- Title: "Projects", 22px, weight 700, #1A1A1E
- Subtitle: "24 total · 12 active", 13px, #9A9AA0
```

**Right Side - New Project Button**
```
Height: 36px
Background: #2D5A3D
Border-radius: 8px
Padding: 8px 16px
Gap: 6px
Icon: Plus (16px, white)
Text: "New Project", 13px, weight 500, white
Hover: darken background 10%
```

### 2. Filters Bar

**Container**
```
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 16px 20px
Margin: 0 32px
Layout: flex, gap 12px, align-center
```

**Search Input**
```
Height: 38px
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 8px
Padding: 0 12px
Gap: 8px
Icon: Search (16px, #9A9AA0)
Placeholder: "Search...", 14px, #9A9AA0
Flex: 1 (fills available space)
Focus: border-color #2D5A3D
```

**Filter Dropdowns** (Status, Client, Sort)
```
Height: 38px
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 8px
Padding: 0 12px
Gap: 6px
Text: 13px, weight 500, #5F5F67
Icon: ChevronDown (14px, #9A9AA0)
```

**View Toggle**
```
Background: #F8F7F4
Border-radius: 8px
Padding: 4px
Gap: 2px

Grid Button (active):
- Size: 30x30px
- Background: #2D5A3D
- Border-radius: 6px
- Icon: LayoutGrid (15px, white)

List Button (inactive):
- Size: 30x30px
- Background: transparent
- Border-radius: 6px
- Icon: List (15px, #9A9AA0)
```

### 3. Projects Table

**Container**
```
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Margin: 24px 32px
Overflow: hidden
```

**Table Header Row**
```
Height: 40px
Background: #F8F7F4
Border-bottom: 1px solid #E5E3DE
Padding: 0 20px
Layout: flex, align-center
Border-radius: 12px 12px 0 0

Columns:
1. PROJECT - flex: 1
2. CLIENT - width: 140px
3. STATUS - width: 130px
4. PROGRESS - width: 160px
5. BUDGET - width: 110px
6. DUE DATE - width: 110px
7. TEAM - width: 100px

Header Text: 11px, weight 600, #9A9AA0, uppercase
```

**Table Row**
```
Height: 64px
Border-bottom: 1px solid #E5E3DE
Padding: 0 20px
Layout: flex, align-center
Hover: background #FAFAFA

Columns same widths as header
```

**Project Column Content**
```
Layout: flex, gap 10px, align-center

Project Badge:
- Size: 36x36px
- Border-radius: 10px
- Background: project color (blue #DBEAFE, green #DCFCE7, etc.)
- Text: First letter, 14px, weight 700, color matches theme

Project Info:
- Name: 14px, weight 600, #1A1A1E
- Type: 12px, #9A9AA0
```

**Client Column**
```
Text: 13px, weight normal, #5F5F67
```

**Status Column**
```
Status Badge:
- Padding: 4px 10px
- Border-radius: 20px (pill shape)
- Gap: 5px
- Layout: flex, align-center

Status Dot: 6px circle
Status Text: 12px, weight 500

Variants:
- In Progress: bg #DBEAFE, text #2563EB, dot #2563EB
- Completed: bg #DCFCE7, text #16A34A, dot #16A34A
- Pending: bg #FEF3C7, text #B45309, dot #B45309
- On Hold: bg #F3F4F6, text #6B7280, dot #6B7280
```

**Progress Column**
```
Layout: vertical, gap 4px, width 160px

Progress Bar:
- Height: 6px
- Background: #E2E8F0
- Border-radius: 3px
- Fill: #2563EB (or status color)
- Fill border-radius: 3px

Percentage: 11px, #9A9AA0
```

**Budget Column**
```
Text: 13px, weight 600, #1A1A1E
```

**Due Date Column**
```
Text: 13px, weight normal, #5F5F67
Format: "Mar 15, 2025"
```

**Team Column**
```
Overlapping Avatar Stack:
- Gap: -8px (negative for overlap)
- Direction: row-reverse (so last appears on top)

Avatar:
- Size: 28x28px
- Border-radius: 50%
- Border: 2px solid #FFFFFF
- Background: user color or gray
- Text: initials, 10px, weight 600, white

Overflow Indicator (+N):
- Size: 28x28px
- Border-radius: 50%
- Background: #F3F4F6
- Text: "+2", 10px, #6B7280
```

---

## Mobile Projects Page (414px)

### Layout Structure
```
┌─────────────────────────────┐
│ ≡  Projects         +       │ <- AppBar
├─────────────────────────────┤
│                             │
│  Projects                   │
│  24 total · 12 active    [+]│
│                             │
│  ┌────┬────┬────┐          │
│  │ 12 │ 8  │ 4  │          │ <- KPI Cards
│  │In  │Comp│Pend│          │
│  └────┴────┴────┘          │
│                             │
│  ┌─────────────────────┐   │
│  │ 🔍 Search projects… │   │
│  └─────────────────────┘   │
│                             │
│  [All] [Active] [Completed]│ <- Tabs
│                             │
│  ┌─────────────────────┐   │
│  │ [E] E-Commerce      │   │
│  │     Web Development │   │
│  │ ● Active        75% │   │
│  │ ████████████        │   │
│  │ Tech Corp · Mar 15  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ [M] Mobile App      │   │
│  │     Development     │   │
│  │ ...more cards...    │   │
│  └─────────────────────┘   │
│                             │
│  ┌────┬────┬────┬────┐     │
│  │ 🏠 │ 📁 │ 👤 │ ⚙️  │     │ <- BottomNav
│  └────┴────┴────┴────┘     │
└─────────────────────────────┘
```

### 1. Mobile AppBar

**Container**
```
Height: 52px
Background: #FFFFFF
Border-bottom: 1px solid #E5E3DE
Padding: 0 16px
Layout: flex, justify-between, align-center
```

**Left Side**
```
Menu Button:
- Size: 36x36px
- Background: #F8F7F4
- Border-radius: 8px
- Icon: Menu (20px, #1A1A1E)

Title: "Projects", 18px, weight 600, #1A1A1E
```

**Right Side**
```
New Button:
- Size: 32x32px
- Background: #2D5A3D
- Border-radius: 8px
- Icon: Plus (16px, white)
```

### 2. Mobile Header Section

**Container**
```
Padding: 16px 20px
Layout: flex, justify-between, align-bottom
```

**Title Group**
```
Title: "Projects", 22px, weight 700, #1A1A1E
Subtitle: "24 total · 12 active", 13px, #9A9AA0
```

**New Project Button**
```
Height: 32px
Background: #2D5A3D
Border-radius: 8px
Padding: 8px 14px
Gap: 5px
Icon: Plus (14px, white)
Text: "New", 13px, weight 600, white
```

### 3. KPI Cards Row

**Container**
```
Padding: 0 20px
Layout: flex, gap 10px
Overflow: horizontal scroll (if needed)
```

**KPI Card**
```
Width: 33% (flex: 1)
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 14px
Layout: vertical, gap 6px

Icon Container:
- Size: 28x28px
- Border-radius: 8px
- Background: color based on status
- Icon: 14px, centered

Value: 22px, weight 700, #1A1A1E
Label: 11px, #9A9AA0

Variants:
- In Progress: bg #DBEAFE, icon #2563EB, icon-name: loader
- Completed: bg #DCFCE7, icon #16A34A, icon-name: circle-check
- Pending: bg #FEF3C7, icon #B45309, icon-name: triangle-alert
```

### 4. Mobile Search Bar

**Container**
```
Margin: 16px 20px
Height: 42px
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 10px
Padding: 0 14px
Gap: 8px
Layout: flex, align-center
```

**Content**
```
Icon: Search (16px, #9A9AA0)
Placeholder: "Search projects…", 14px, #9A9AA0
```

### 5. Filter Tabs

**Container**
```
Padding: 0 20px
Layout: flex, gap 6px
Overflow: horizontal scroll
```

**Tab Button**
```
Padding: 7px 14px
Border-radius: 20px (pill)
Font: 13px

Active Tab:
- Background: #2D5A3D
- Text: white, weight 600

Inactive Tab:
- Background: #FFFFFF
- Border: 1px solid #E5E3DE
- Text: #5F5F67, weight normal
```

**Tabs**: All, Active, Completed, Pending

### 6. Mobile Project Cards

**Container**
```
Padding: 0 20px
Layout: vertical, gap 12px
```

**Project Card**
```
Background: #FFFFFF
Border: 1px solid #E5E3DE
Border-radius: 12px
Padding: 16px
Layout: vertical, gap 12px
```

**Card Header**
```
Layout: flex, justify-between, align-center

Left Side:
- Layout: flex, gap 10px, align-center
- Badge: 38x38px, border-radius 10px
- Info: vertical, gap 2px
  - Name: 14px, weight 600, #1A1A1E
  - Type: 12px, #9A9AA0

Right Side:
- Status Badge (same as desktop but smaller)
```

**Progress Section**
```
Layout: vertical, gap 6px

Progress Row:
- Layout: flex, justify-between
- Label: "Progress", 12px, #9A9AA0
- Value: "75%", 12px, weight 600, #1A1A1E

Progress Bar:
- Height: 6px
- Background: #E2E8F0
- Border-radius: 3px
- Fill: #2563EB, border-radius 3px
```

**Card Footer**
```
Text: "Tech Corp · Mar 15", 12px, #9A9AA0
Dot separator: " · "
```

### 7. Mobile Bottom Navigation

Uses existing [`BottomNav.tsx`](Codebase/src/components/layout/BottomNav.tsx:1) component.

---

## Implementation Steps

### Step 1: Update ProjectsPage.tsx Structure
**File**: `Codebase/src/pages/admin/ProjectsPage.tsx`

Create responsive layout:
- Desktop: Full table view
- Mobile: Card-based view with horizontal scroll for tabs

### Step 2: Create Filter Bar Component
Create `ProjectsFilterBar.tsx`:
- Search input with icon
- Status dropdown
- Client dropdown
- Sort dropdown
- Grid/List toggle

### Step 3: Create Project Table Component
Create `ProjectsTable.tsx`:
- Table header with sortable columns
- Table rows with all columns
- Hover states
- Responsive: hide on mobile

### Step 4: Create Mobile Project Card Component
Create `MobileProjectCard.tsx`:
- Badge + Info header
- Status badge
- Progress bar
- Footer with client and date

### Step 5: Create KPI Cards Component
Create `ProjectKPICards.tsx`:
- 3-column grid on mobile
- Horizontal scroll if needed
- Color-coded icons

### Step 6: Create Filter Tabs Component
Create `ProjectFilterTabs.tsx`:
- Pill-style buttons
- Active/inactive states
- Horizontal scroll container

### Step 7: Update Sidebar Active State
**File**: `Codebase/src/components/layout/Sidebar.tsx`
- Ensure Projects nav item is highlighted when on /admin/projects

### Step 8: Add Responsive Logic
Use [`use-mobile.ts`](Codebase/src/hooks/use-mobile.ts:1) hook to switch between:
- Desktop: Table view with filters bar
- Mobile: Card view with tabs and KPI cards

---

## Component Architecture

```
ProjectsPage (main container)
├── Desktop View (lg breakpoint+)
│   ├── PageHeader
│   │   ├── TitleGroup
│   │   └── NewProjectButton
│   ├── FilterBar
│   │   ├── SearchInput
│   │   ├── StatusDropdown
│   │   ├── ClientDropdown
│   │   ├── SortDropdown
│   │   └── ViewToggle
│   └── ProjectsTable
│       ├── TableHeader
│       └── TableRow (mapped)
│           ├── ProjectCell
│           ├── ClientCell
│           ├── StatusCell
│           ├── ProgressCell
│           ├── BudgetCell
│           ├── DueDateCell
│           └── TeamCell
│
└── Mobile View (< lg breakpoint)
    ├── MobileAppBar
    ├── PageHeader (condensed)
    ├── KPICards
    ├── SearchBar
    ├── FilterTabs
    └── ProjectCards (vertical list)
        └── MobileProjectCard
            ├── CardHeader
            ├── ProgressSection
            └── CardFooter
```

---

## Files to Modify/Create

### Modify:
1. `Codebase/src/pages/admin/ProjectsPage.tsx` - Main page component

### Create:
1. `Codebase/src/components/projects/ProjectsFilterBar.tsx`
2. `Codebase/src/components/projects/ProjectsTable.tsx`
3. `Codebase/src/components/projects/ProjectTableRow.tsx`
4. `Codebase/src/components/projects/MobileProjectCard.tsx`
5. `Codebase/src/components/projects/ProjectKPICards.tsx`
6. `Codebase/src/components/projects/ProjectFilterTabs.tsx`
7. `Codebase/src/components/projects/StatusBadge.tsx` (reusable)
8. `Codebase/src/components/projects/ProgressBar.tsx` (reusable)
9. `Codebase/src/components/projects/TeamAvatars.tsx` (reusable)

---

## Pixel-Perfect Checklist

### Desktop
- [ ] Sidebar width: 272px (not 273px in this version)
- [ ] Page padding: 24px 32px
- [ ] Filter bar border-radius: 12px
- [ ] Table header height: 40px
- [ ] Table row height: 64px
- [ ] Project badge: 36x36px, border-radius 10px
- [ ] Status badge: pill shape (border-radius 20px)
- [ ] Progress bar: 6px height, 3px radius
- [ ] Team avatars: 28x28px, -8px overlap gap
- [ ] All gaps match 4px/8px/12px/16px grid

### Mobile
- [ ] AppBar height: 52px
- [ ] Horizontal padding: 20px consistently
- [ ] KPI cards: equal width, 10px gap
- [ ] KPI card icon: 28x28px, 8px radius
- [ ] Search bar: 42px height, 10px radius
- [ ] Filter tabs: pill shape (20px radius)
- [ ] Project cards: 12px radius, 16px padding
- [ ] Progress bar: 6px height
- [ ] Card gap: 12px vertical

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 1024px (lg) | Mobile card view with bottom nav |
| >= 1024px (lg) | Desktop table view with sidebar |

---

## Mock Data Structure

```typescript
interface Project {
  id: string;
  name: string;
  type: string; // "Web Development", "Mobile App", etc.
  client: string;
  status: 'in_progress' | 'completed' | 'pending' | 'on_hold';
  progress: number; // 0-100
  budget: string; // "$45,000"
  dueDate: string; // "Mar 15, 2025"
  team: {
    id: string;
    initials: string;
    color: string;
  }[];
}
```

## Next Steps

Once this plan is approved, switch to **Code mode** to begin implementation starting with the main `ProjectsPage.tsx` structure and the desktop filter bar.
