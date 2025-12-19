# Campaigns Component - CSS Class Reference

## Quick Lookup Guide

### Form Elements

| Element | CSS Class | Purpose |
|---------|-----------|---------|
| Form Container | `.campaign-form` | Main form background and styling |
| Form Grid | `.campaign-form-grid` | 2-column layout for form fields |
| Form Section | `.campaign-form-section` | Section spacing and organization |
| Labels | `.campaign-form-label` | All form labels |
| Text Inputs | `.campaign-form-input` | All text input fields |
| Input Focus | `.campaign-form-input:focus` | Green border on focus |
| Input Placeholder | `.campaign-form-input::placeholder` | Gray placeholder text |

### Buttons

| Element | CSS Class | Style |
|---------|-----------|-------|
| Primary Button | `.campaign-btn-create` | Green (#4caf50) |
| Submit Button | `.campaign-btn-submit` | Green, full width with hover |
| Submit Disabled | `.campaign-btn-submit:disabled` | Gray, not-allowed cursor |
| Cancel Button | `.campaign-btn-cancel` | Gray (#6c757d) |
| Select All Button | `.campaign-selection-btn-all` | Blue (#2196F3) |
| Segments Button | `.campaign-selection-btn-segments` | Teal (#17a2b8) |
| Send Button (Card) | `.campaign-card-btn-send` | Green with hover |
| Duplicate Button | `.campaign-card-btn-duplicate` | Purple (#6f42c1) |
| Delete Button | `.campaign-card-btn-delete` | Red (#dc3545) |

### Selection Elements

| Element | CSS Class | Feature |
|---------|-----------|---------|
| Selection Box | `.campaign-selection-box` | Container with scroll |
| Selection Item | `.campaign-selection-item` | Hoverable item with border |
| Selection Item Hover | `.campaign-selection-item:hover` | Green border highlight |
| Checkbox Input | `.campaign-checkbox` | Green accent color |
| Checkbox Wrapper | `.campaign-selection-checkbox` | Container for checkbox |
| Selection Content | `.campaign-selection-content` | Text area next to checkbox |
| Selection Title | `.campaign-selection-title` | Item title (white) |
| Selection Preview | `.campaign-selection-preview` | Item preview text (gray) |
| Selection List | `.campaign-selection-list` | Scrollable list container |
| Warning Box | `.campaign-warning-box` | Dark warning container |
| Warning Text | `.campaign-warning-text` | Warning message text |

### Campaign Summary

| Element | CSS Class | Layout |
|---------|-----------|--------|
| Summary Container | `.campaign-summary` | Dark green background |
| Summary Title | `.campaign-summary-title` | Light green title |
| Summary Grid | `.campaign-summary-grid` | 3-column grid |
| Summary Item | `.campaign-summary-item` | Individual stat |
| Summary Label | `.campaign-summary-label` | "RECIPIENTS", "SEGMENTS" etc |
| Summary Value | `.campaign-summary-value` | Large green number |

### Campaign Cards (Listed Campaigns)

| Element | CSS Class | Feature |
|---------|-----------|---------|
| Card Container | `.campaign-card` | Dark background, hover effect |
| Card (Sent) | `.campaign-card.campaign-card-sent` | Green border for sent |
| Card Header | `.campaign-card-header` | Flex layout with title/actions |
| Card Title | `.campaign-card-title` | White, 18px font |
| Card Description | `.campaign-card-description` | Gray text |
| Card Meta | `.campaign-card-meta` | Date, status, sent info |
| Card Status | `.campaign-card-status` | Status badge styling |
| Status Sent | `.campaign-status-sent` | Green color |
| Status Ready | `.campaign-status-ready` | Blue color |
| Status Draft | `.campaign-status-draft` | Yellow color |
| Card Actions | `.campaign-card-actions` | Flex container for buttons |
| Card Sending | `.campaign-card-sending` | Orange "Sending..." state |
| Content Grid | `.campaign-card-content-grid` | 2-column grid for details |
| Card Section | `.campaign-card-section` | Email/Segment section |
| Section Title | `.campaign-card-section-title` | Section heading |
| Items List | `.campaign-card-items-list` | Scrollable items area |

### Card Content Items

| Element | CSS Class | Style |
|---------|-----------|-------|
| Email Body Item | `.campaign-card-item` | Gray background with border |
| Item Name | `.campaign-card-item-name` | Bold white text |
| Item Preview | `.campaign-card-item-preview` | Gray preview text |
| Segment Item | `.campaign-segment-item` | Green-tinted background |
| Segment Name | `.campaign-segment-item-name` | Light green bold |
| Segment Desc | `.campaign-segment-item-desc` | Medium green text |
| Segment Count | `.campaign-segment-item-count` | Green badge |
| Contacts Badge | `.campaign-contacts-badge` | Green pill with count |

### Card Statistics

| Element | CSS Class | Format |
|---------|-----------|--------|
| Stats Container | `.campaign-card-stats` | Dark background |
| Stats Grid | `.campaign-card-stats-grid` | Auto-fit columns |
| Stat Item | `.campaign-card-stat-item` | Centered item |
| Stat Value | `.campaign-card-stat-value` | Large green number |
| Stat Label | `.campaign-card-stat-label` | Uppercase gray text |

### Header & Layout

| Element | CSS Class | Purpose |
|---------|-----------|---------|
| Main Header | `.campaign-header` | Page header with spacing |
| Header Actions | `.campaign-header-actions` | Button/stats area |
| Stats Display | `.campaign-stats` | Semi-transparent stats box |
| List Title | `.campaign-list-title` | "Your Campaigns (n)" title |
| Button Container | `.campaign-button-container` | Wrapper for action buttons |
| Action Buttons | `.campaign-action-buttons` | Flex container at form bottom |
| Segments Header | `.campaign-segments-header` | Flex layout for segments button |
| Recipients Count | `.campaign-recipients-count` | Green recipient count display |

### Empty State

| Element | CSS Class | Feature |
|---------|-----------|---------|
| Empty State | `.campaign-empty-state` | Dark container with dashed border |
| Empty Icon | `.campaign-empty-icon` | Large emoji (48px) |
| Empty Title | `.campaign-empty-title` | "No campaigns yet" text |
| Empty Description | `.campaign-empty-description` | Gray description text |
| Empty Button | `.campaign-empty-btn` | Blue "Get Started" button |

### Header Components

| Element | CSS Class | Style |
|---------|-----------|-------|
| Container | `.campaign-container` | Padding with dark background |
| Main Button | `.campaign-btn` | Base button style |
| Primary CTA | `.campaign-btn-create` | Green button for create |
| Test Button | `.campaign-btn-test` | Secondary button |

---

## Usage Examples

### Form Input
```jsx
<input
  type="text"
  className="campaign-form-input"
  placeholder="Enter campaign name..."
/>
```

### Selection Item with Checkbox
```jsx
<div className="campaign-selection-item">
  <div className="campaign-selection-checkbox">
    <input type="checkbox" className="campaign-checkbox" />
  </div>
  <div className="campaign-selection-content">
    <div className="campaign-selection-title">Email Name</div>
    <div className="campaign-selection-preview">Preview text...</div>
  </div>
</div>
```

### Campaign Card
```jsx
<div className="campaign-card campaign-card-sent">
  <div className="campaign-card-header">
    <div>
      <h4 className="campaign-card-title">Campaign Name</h4>
      <p className="campaign-card-description">Description</p>
      <div className="campaign-card-meta">
        <span className="campaign-status-sent">Status: Sent</span>
      </div>
    </div>
    <div className="campaign-card-actions">
      <button className="campaign-card-btn-send">Send</button>
      <button className="campaign-card-btn-delete">Delete</button>
    </div>
  </div>
</div>
```

### Summary Box
```jsx
<div className="campaign-summary">
  <h4 className="campaign-summary-title">Campaign Summary</h4>
  <div className="campaign-summary-grid">
    <div className="campaign-summary-item">
      <div className="campaign-summary-value">10</div>
      <div className="campaign-summary-label">Recipients</div>
    </div>
  </div>
</div>
```

---

## Color Reference

```css
/* Primary Colors */
--color-dark: #1a1a1a;        /* Page background */
--color-surface: #2a2a2a;     /* Card/form background */
--color-surface-light: #3a3a3a; /* Hover/border color */
--color-text: #ffffff;         /* Main text */
--color-text-secondary: #aaa;  /* Secondary text */

/* Accent Colors */
--color-success: #4caf50;      /* Green */
--color-info: #2196F3;         /* Blue */
--color-warning: #ff9800;      /* Orange */
--color-danger: #dc3545;       /* Red */
--color-secondary: #17a2b8;    /* Teal */
```

---

## Dark Theme Specifications

- **Background**: `#1a1a1a` (nearly black)
- **Surface Level 1**: `#2a2a2a` (darker gray)
- **Surface Level 2**: `#3a3a3a` (medium gray)
- **Borders**: `#444` (light gray)
- **Text**: `#ffffff` (white)
- **Text Secondary**: `#999` (medium gray)
- **Text Tertiary**: `#aaa` (light gray)

---

**Last Updated**: CSS Refactoring Complete
**Total Classes**: 80+
**Lines of CSS**: 350+
