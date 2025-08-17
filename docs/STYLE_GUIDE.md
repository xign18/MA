# Vehicle Maintenance System - Style Guide

This document outlines the design system and style guidelines for the Vehicle Maintenance System to ensure consistency across all components and interfaces.

## Design Principles

### 1. Clarity
- Use clear, readable typography
- Maintain sufficient contrast ratios
- Provide clear visual hierarchy

### 2. Consistency
- Use standardized components and patterns
- Maintain consistent spacing and sizing
- Apply uniform color schemes

### 3. Accessibility
- Support keyboard navigation
- Provide proper ARIA labels
- Ensure color contrast compliance

### 4. Responsiveness
- Design for mobile-first approach
- Ensure usability across all device sizes
- Optimize for touch interactions

## Color System

### Primary Colors
- **Blue 600** (`#2563eb`) - Primary actions, links, focus states
- **Blue 50** (`#eff6ff`) - Light backgrounds, subtle highlights

### Status Colors
- **Success**: Green 600 (`#059669`) - Completed, approved states
- **Warning**: Yellow 600 (`#d97706`) - Pending, caution states  
- **Error**: Red 600 (`#dc2626`) - Errors, cancelled states
- **Info**: Blue 600 (`#2563eb`) - Information, in-progress states

### Neutral Colors
- **Gray 900** (`#111827`) - Primary text (dark mode: white)
- **Gray 600** (`#4b5563`) - Secondary text
- **Gray 400** (`#9ca3af`) - Placeholder text, disabled states
- **Gray 100** (`#f3f4f6`) - Light backgrounds, borders

### Role-Based Colors
- **Admin**: Blue tones - Authority and control
- **Supervisor**: Green tones - Management and oversight
- **Technician**: Orange tones - Action and execution

## Typography

### Font Family
- **Primary**: Inter (system fallback: system-ui, -apple-system, sans-serif)
- **Monospace**: JetBrains Mono (fallback: Menlo, Monaco, monospace)

### Font Sizes
- **xs**: 12px (0.75rem) - Small labels, captions
- **sm**: 14px (0.875rem) - Body text, form inputs
- **base**: 16px (1rem) - Default body text
- **lg**: 18px (1.125rem) - Subheadings
- **xl**: 20px (1.25rem) - Section headings
- **2xl**: 24px (1.5rem) - Page headings
- **3xl**: 30px (1.875rem) - Main titles

### Font Weights
- **Normal** (400) - Body text
- **Medium** (500) - Emphasized text
- **Semibold** (600) - Subheadings
- **Bold** (700) - Headings, important text

## Spacing System

Based on 4px grid system:

- **1** = 4px - Tight spacing
- **2** = 8px - Small spacing
- **3** = 12px - Default spacing
- **4** = 16px - Medium spacing
- **6** = 24px - Large spacing
- **8** = 32px - Extra large spacing
- **12** = 48px - Section spacing
- **16** = 64px - Page spacing

## Component Guidelines

### Buttons

#### Primary Button
```tsx
<Button variant="primary" size="base">
  Save Changes
</Button>
```
- Use for main actions (Save, Submit, Create)
- Limit to one per section
- Always include clear action text

#### Secondary Button
```tsx
<Button variant="secondary" size="base">
  Cancel
</Button>
```
- Use for secondary actions
- Pair with primary buttons
- Use for navigation actions

#### Sizes
- **sm**: Compact spaces, table actions
- **base**: Default size for most use cases
- **lg**: Prominent actions, hero sections

### Form Inputs

#### Text Input
```tsx
<Input
  label="Owner Name"
  placeholder="Enter owner name"
  error={errors.ownerName}
/>
```
- Always include labels
- Use placeholder text for examples
- Show validation errors clearly

#### Select Dropdown
```tsx
<Select
  label="Status"
  options={statusOptions}
  placeholder="Select status"
/>
```
- Include "Select..." placeholder
- Group related options
- Sort alphabetically when appropriate

### Status Badges

#### Status Display
```tsx
<StatusBadge status="pending" size="base" />
<StatusBadge status="completed" size="base" />
```
- Use consistent status terminology
- Include icons for quick recognition
- Maintain color consistency

#### Priority Indicators
```tsx
<PriorityBadge priority="high" size="sm" />
```
- Use for request prioritization
- Color-code by urgency level
- Position prominently in lists

### Cards and Containers

#### Dashboard Cards
```tsx
<DashboardCard
  title="Request Details"
  subtitle="View and manage request information"
>
  {content}
</DashboardCard>
```
- Use consistent padding (24px default)
- Include clear titles and descriptions
- Maintain proper visual hierarchy

#### Stats Cards
```tsx
<StatsCard
  title="Total Requests"
  value={42}
  icon={<FileText />}
  color="blue"
/>
```
- Use for key metrics display
- Include relevant icons
- Show trend indicators when applicable

## Layout Guidelines

### Grid System
- Use CSS Grid for complex layouts
- Maintain consistent gutters (24px)
- Ensure responsive breakpoints

### Responsive Breakpoints
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablet portrait
- **lg**: 1024px - Tablet landscape
- **xl**: 1280px - Desktop
- **2xl**: 1536px - Large desktop

### Navigation
- Sticky header for easy access
- Clear visual hierarchy
- Breadcrumb navigation for deep pages

## Dark Mode Support

### Implementation
- Use CSS custom properties for theme switching
- Maintain contrast ratios in both modes
- Test all components in both themes

### Color Adjustments
- Invert background colors appropriately
- Adjust text contrast for readability
- Maintain brand color recognition

## Accessibility Standards

### WCAG Compliance
- Maintain AA level contrast ratios (4.5:1 minimum)
- Provide keyboard navigation support
- Include proper ARIA labels and roles

### Focus Management
- Clear focus indicators
- Logical tab order
- Skip links for main content

### Screen Reader Support
- Descriptive alt text for images
- Proper heading hierarchy
- Status announcements for dynamic content

## Animation and Transitions

### Duration
- **Fast** (150ms) - Hover states, small changes
- **Base** (200ms) - Default transitions
- **Slow** (300ms) - Complex animations, page transitions

### Easing
- Use `ease-out` for entering animations
- Use `ease-in` for exiting animations
- Use `ease-in-out` for continuous animations

### Reduced Motion
- Respect `prefers-reduced-motion` setting
- Provide alternative feedback methods
- Disable non-essential animations

## Best Practices

### Component Usage
1. Always use design system components
2. Avoid custom styling when possible
3. Extend components through props, not CSS overrides
4. Maintain consistent spacing using design tokens

### Performance
1. Optimize images and icons
2. Use appropriate image formats (WebP, SVG)
3. Implement lazy loading for large lists
4. Minimize CSS bundle size

### Maintenance
1. Document component changes
2. Update style guide with new patterns
3. Regular accessibility audits
4. Cross-browser testing

## Code Examples

### Consistent Form Layout
```tsx
<form className="space-y-6">
  <Input
    label="Owner Name"
    placeholder="Enter owner name"
    required
  />
  <Select
    label="Priority"
    options={priorityOptions}
    placeholder="Select priority"
  />
  <div className="flex justify-end space-x-3">
    <Button variant="secondary">
      Cancel
    </Button>
    <Button variant="primary" type="submit">
      Save Request
    </Button>
  </div>
</form>
```

### Dashboard Layout
```tsx
<DashboardLayout
  title="Admin Panel"
  subtitle="Manage system settings and requests"
  userInfo={userInfo}
  onSignOut={handleSignOut}
>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatsCard title="Total Requests" value={stats.total} />
    <StatsCard title="Pending" value={stats.pending} />
    <StatsCard title="In Progress" value={stats.inProgress} />
    <StatsCard title="Completed" value={stats.completed} />
  </div>
  
  <DashboardCard title="Recent Requests">
    {/* Request list content */}
  </DashboardCard>
</DashboardLayout>
```

This style guide ensures consistent, accessible, and maintainable UI across the entire Vehicle Maintenance System.
