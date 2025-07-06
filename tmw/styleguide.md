# Texas Metal Works - Design System & Style Guide

## Brand Colors

### Primary Brand Color
- **Red**: `bg-red-600`, `text-red-600`, `border-red-200`, `bg-red-50`
- **Red Hover States**: `hover:bg-red-700`

### Neutral Color Palette
- **Background Light**: `bg-neutral-50`
- **Background Dark**: `bg-neutral-900`
- **White Cards**: `bg-white`
- **Text Primary**: `text-neutral-900`
- **Text Secondary**: `text-neutral-600`
- **Text Muted**: `text-neutral-500`
- **Text Light**: `text-neutral-400`
- **Text On Dark**: `text-neutral-300`
- **Borders**: `border-neutral-200/60`
- **Borders Dark**: `border-neutral-700`
- **Backgrounds**: `bg-neutral-200`

### Accent Colors
- **Yellow (Stars/Ratings)**: `text-yellow-400`, `bg-yellow-400`
- **Green (Verification)**: `text-green-500`

## Typography

### Headings
- **Hero/Main Headlines**: `text-4xl lg:text-5xl font-bold`
- **Section Headlines**: `text-3xl lg:text-4xl font-bold`
- **Subsection Headlines**: `text-xl font-semibold`
- **Card Headlines**: `text-lg font-semibold`

### Body Text
- **Large Body**: `text-xl`
- **Regular Body**: `text-lg`
- **Small Body**: `text-sm`
- **Micro Text**: `text-xs`

### Font Weights
- **Bold**: `font-bold`
- **Semibold**: `font-semibold`
- **Medium**: `font-medium`

## Layout & Spacing

### Container
- **Max Width**: `max-w-7xl mx-auto`
- **Padding**: `px-4 sm:px-6 lg:px-8`

### Section Spacing
- **Vertical Padding**: `py-20`
- **Component Spacing**: `mb-12`, `mb-16`

### Grid Systems
- **Two Column**: `grid grid-cols-1 lg:grid-cols-2 gap-12`
- **Three Column**: `grid grid-cols-1 lg:grid-cols-3 gap-8`
- **Review Cards**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## Components

### Section Tags
```html
<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-red-600 border-red-200 bg-red-50 mb-4">
  Tag Text
</div>
```

### Cards
```html
<div class="bg-white rounded-lg border border-neutral-200/60 p-6">
  <!-- Card Content -->
</div>
```

### Feature Cards (with Icons)
```html
<div class="bg-white rounded-lg border border-neutral-200/60 p-6">
  <div class="flex items-center mb-4">
    <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
      <!-- Icon SVG -->
    </div>
    <h3 class="text-lg font-semibold text-neutral-900">Feature Title</h3>
  </div>
  <p class="text-neutral-600 text-sm">Feature description</p>
</div>
```

### Feature Lists (with Checkmarks)
```html
<div class="flex items-center space-x-3">
  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
    <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
  </div>
  <span class="text-neutral-900 font-medium">Feature Name</span>
</div>
```

## Buttons

### Primary CTA (Red)
```html
<a href="#" class="inline-flex items-center justify-center bg-red-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg">
  Button Text
</a>
```

### Secondary CTA (Black/Dark)
```html
<a href="#" class="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors">
  Button Text
</a>
```

### Tertiary CTA (White/Light)
```html
<a href="#" class="inline-flex items-center justify-center border border-neutral-200 bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors">
  Button Text
</a>
```

### Outline CTA (Border Only)
```html
<a href="#" class="inline-flex items-center justify-center border-2 border-white text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-neutral-900 transition-colors">
  Button Text
</a>
```

## Images

### Consistent Image Heights
- **Fixed Height Containers**: `h-48` with `object-cover`
- **Full Height Matching**: `h-full` with `object-cover`
- **Auto Height**: `h-auto` for natural aspect ratios

### Image Styling
- **Rounded Corners**: `rounded-lg`
- **Subtle Shadow**: `shadow-sm`

## Section Backgrounds

### Alternating Pattern
- **Light Sections**: `bg-neutral-50`
- **White Sections**: No background class (defaults to white)
- **Dark Sections**: `bg-neutral-900`

## Responsive Design

### Breakpoints
- **Mobile First**: Base styles
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)

### Common Responsive Patterns
- **Grid Responsive**: `grid-cols-1 lg:grid-cols-2`
- **Text Responsive**: `text-3xl lg:text-4xl`
- **Spacing Responsive**: `px-4 sm:px-6 lg:px-8`
- **Flex Direction**: `flex-col sm:flex-row`

## Animation & Transitions

### Standard Transitions
- **Color Transitions**: `transition-colors`
- **Hover States**: Always include hover states for interactive elements

## Accessibility

### Color Contrast
- Ensure sufficient contrast between text and background colors
- Use semantic HTML elements where appropriate

### Focus States
- Include focus states for keyboard navigation
- Use `focus:` pseudo-classes for interactive elements

---

This style guide ensures consistency across all Texas Metal Works components and maintains the professional, industrial aesthetic that reflects the brand's quality and craftsmanship.