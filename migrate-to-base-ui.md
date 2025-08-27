# Migration from Radix UI to Base UI

## Status: In Progress

This document tracks the migration from Radix UI components to Base UI components.

## Completed Components ✅

1. **Button** - Migrated (removed @radix-ui/react-slot dependency)
2. **Dialog** - Migrated to @base-ui-components/react/dialog
3. **Checkbox** - Migrated to @base-ui-components/react/checkbox

## Components to Migrate 🚧

### High Priority (Commonly Used)

- [ ] **Select** - Used in forms and filters
- [ ] **Dropdown Menu** - Used in navigation
- [ ] **Tabs** - Used in detail views
- [ ] **Badge** - Currently uses Slot
- [ ] **Alert Dialog** - Used for confirmations

### Medium Priority

- [ ] **Avatar** - Used in user interfaces
- [ ] **Switch** - Used in settings
- [ ] **Label** - Used in forms
- [ ] **Radio Group** - Used in forms
- [ ] **Tooltip** - Used for help text
- [ ] **Popover** - Used for additional content

### Low Priority

- [ ] **Accordion** - Used for collapsible content
- [ ] **Progress** - Used for loading states
- [ ] **Slider** - Used for range inputs
- [ ] **Separator** - Used for dividing content
- [ ] **Scroll Area** - Used for custom scrollbars
- [ ] **Sheet** - Used for side panels
- [ ] **Hover Card** - Used for preview content
- [ ] **Context Menu** - Used for right-click menus
- [ ] **Navigation Menu** - Used for navigation
- [ ] **Menubar** - Used for menu systems
- [ ] **Toggle** - Used for on/off states
- [ ] **Toggle Group** - Used for multiple toggles
- [ ] **Collapsible** - Used for expandable content
- [ ] **Aspect Ratio** - Used for maintaining ratios

## Migration Notes

### Base UI Package

- Package: `@base-ui-components/react`
- Version: `^1.0.0-beta.2`

### Key Differences

1. **Import Structure**: Base UI uses named exports under component namespaces
   - Radix: `import * as Dialog from "@radix-ui/react-dialog"`
   - Base UI: `import { Dialog } from "@base-ui-components/react/dialog"`

2. **Component Names**: Some components have different names
   - Radix: `DialogPrimitive.Overlay`
   - Base UI: `Dialog.Backdrop`

3. **Slot Component**: Need to implement custom asChild functionality

### ESLint Configuration Issue

The ESLint error about `@typescript-eslint/recommended` config not being found needs to be resolved:

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## Next Steps

1. ✅ Install Base UI package
2. ✅ Migrate Dialog component (completed)
3. ✅ Migrate Checkbox component (completed)
4. 🚧 Migrate Select component (in progress)
5. [ ] Migrate remaining high-priority components
6. [ ] Test all components thoroughly
7. [ ] Remove unused Radix UI dependencies
8. [ ] Update documentation

## Testing Checklist

After migration, ensure:

- [ ] All dialogs open and close properly
- [ ] Form components (checkboxes, selects) work correctly
- [ ] Styling is preserved
- [ ] Accessibility features are maintained
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
