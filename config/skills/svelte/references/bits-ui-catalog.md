# Bits UI v1 (Svelte 5) Reference Manual

Bits UI provides headless, unstyled, ARIA-compliant primitives built natively for Svelte 5 Runes.

---

## Core Architectural Rules

1. **`child` Snippets Replace `asChild` & `builders`**: Render delegation uses `{#snippet child({ props })}`.
2. **`ref` Prop Replaces `el`**: Element reference binding uses `ref = $bindable(null)`.
3. **`forceMount` + Svelte Transitions**: Transition props are removed. Set `forceMount` on content/overlay elements and handle animation via Svelte `in:`, `out:`, or `transition:` directives within the `child` snippet.
4. **Declarative Behavior Props**: Configure dismissal policies via props instead of cancelling events:
   - `escapeKeydownBehavior`: `'close'` | `'ignore'` | `'defer-otherwise-close'` | `'defer-otherwise-ignore'`
   - `interactOutsideBehavior`: `'close'` | `'ignore'` | `'defer-otherwise-close'` | `'defer-otherwise-ignore'`
5. **Nested Dialog CSS Variables**: Bits UI automatically exposes nesting depth attributes and CSS variables on `Dialog.Content` and `Dialog.Overlay`:
   - `--bits-dialog-depth`: Nesting depth (0 for root, 1 for first nested, etc.)
   - `--bits-dialog-nested-count`: Reactively tracks open child dialogs.
   - `data-nested-open`: Present when child dialogs are open.
   - `data-nested`: Present on child dialog instances.
6. **Discriminant `type` Prop**: Components like `Select.Root`, `Combobox.Root`, and `Slider.Root` require `type="single"` or `type="multiple"`.
7. **Static Positioning Opt-Out**: Use `Select.ContentStatic` to bypass Floating UI auto-positioning when handling alignment manually.
8. **Functional Scroll Delays**: `Select.ScrollUpButton` and `Select.ScrollDownButton` accept a `delay={(tick) => number}` function to customize auto-scroll acceleration.
9. **Global Portal Target Overrides**: Wrap component trees in `<BitsConfig defaultPortalTo={targetElement}>` to redirect default portal mounting locations.

---

## Primitive Directory

- **Overlays**: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `ContextMenu`, `DropdownMenu`
- **Navigation**: `Accordion`, `Collapsible`, `Menubar`, `NavigationMenu`, `Tabs`, `Pagination`
- **Inputs**: `Button`, `Checkbox`, `Combobox`, `Select`, `Slider`, `Switch`, `Toggle`, `ToggleGroup`, `PinInput`, `RadioGroup`
- **Date/Time**: `Calendar`, `RangeCalendar`, `DatePicker`, `DateRangePicker`, `DateField`, `TimeField`
- **Feedback & Layout**: `AspectRatio`, `Avatar`, `Meter`, `Progress`, `RatingGroup`, `ScrollArea`, `Separator`

---

## Type Helpers & Utilities

- `mergeProps(...props)`: Merges prop objects safely.
- `useId(prefix?)`: Generates SSR-safe unique element IDs.
- `WithoutChild<T>` / `WithoutChildrenOrChild<T>`: Helper types for building clean wrapper components.
