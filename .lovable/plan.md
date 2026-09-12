# Customer template browsing restructure

## Goal
Replace the customer’s flat template gallery with a guided flow:

```text
Templates → Choose a category → Browse that category → Preview → Select template
```

Admin category and template management remains unchanged. Only active categories already created by Admin will appear; Baby Shower will appear automatically when Admin adds it.

## What will change

### 1. Templates becomes the category landing page
- Keep the existing customer navigation item named **Templates**.
- Change `/app/templates` to show premium category cards rather than every template at once.
- Read categories from the existing category data and show only active categories.
- Calculate each card’s available-template count from the customer’s assigned, active templates.
- Preserve categories with zero currently available templates, with a clear empty count/state.
- Use locally stored category artwork for current categories and a polished generic fallback for future Admin-created categories.

### 2. Add a category collection page
- Add `/app/templates/$categorySlug` for each category gallery.
- Resolve the category from database data and filter templates through their existing category relationship.
- Include `Templates / Category` breadcrumbs and a clear **Back to Categories** action.
- Present the category name, description, available count, and a responsive grid of existing premium template cards.
- Preserve Live Preview and Select Template behavior exactly as it works today.
- Handle unknown, inactive, and empty categories gracefully.

### 3. Preserve the invitation workflow
- Selecting a template still opens the existing invitation-details flow with the same template ID.
- The invitation form, personalization, template registry, unique guest links, sharing, Sent/Pending state, and Opened tracking remain unchanged.
- “Change template” will return to the selected template’s category when possible.

### 4. Mobile and visual treatment
- Use one-column category cards on small phones, two columns where space allows, and a wider desktop grid.
- Give category cards a large image area, refined typography, subtle motion, visible template count, and an Explore cue.
- Reuse InviteHub’s existing colors, shadows, typography, buttons, and premium invitation previews rather than introducing a new visual system.

## Files and technical details
- Update the customer template query to expose active category records alongside assigned templates, without changing tables or policies.
- Refactor `src/routes/_authenticated/app/templates.tsx` into the category landing page.
- Add `src/routes/_authenticated/app/templates.$categorySlug.tsx` for category-specific galleries.
- Add a focused reusable category-card component and local artwork assets.
- Update invitation-form return navigation while keeping the existing template search parameter.
- Leave all `/admin/*` category and template routes untouched.
- Add route-specific title, description, Open Graph, and Twitter metadata for the new category route.

## Verification
- Verify active Admin-created categories render dynamically and inactive categories do not.
- Verify counts match assigned active templates.
- Verify Wedding opens the three premium wedding designs.
- Verify preview, selection, and personalized invitation creation still work.
- Check the category and gallery screens at desktop and mobile sizes.
- Confirm the build and browser console are clean.
