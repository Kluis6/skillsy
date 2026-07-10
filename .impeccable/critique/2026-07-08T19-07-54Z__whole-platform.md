---
target: whole-platform
total_score: 23
p0_count: 0
p1_count: 3
timestamp: 2026-07-08T19-07-54Z
slug: whole-platform
---
Method: dual-agent (A: 019f431d-933d-75c0-9466-4cca7b81ae4a · B: 019f431d-b5a5-7af2-99a9-78e8bbf27f74)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Strong route skeletons, but some authenticated gates/admin states still fall back to centered spinners or plain loading copy. |
| 2 | Match System / Real World | 3 | The marketplace/member-directory model is understandable, but provider visibility and verification expectations need clearer framing. |
| 3 | User Control and Freedom | 2 | Admin/destructive flows lean on immediate actions, native prompts, or thin confirmations. |
| 4 | Consistency and Standards | 2 | Two token systems, mixed radii, mixed button styles, custom controls, and repeated blue gradients fragment trust. |
| 5 | Error Prevention | 2 | Long settings/admin flows have validation, but high-risk actions need stronger prevention and consequence copy. |
| 6 | Recognition Rather Than Recall | 3 | Labels are mostly explicit, but hidden custom filters, icon-only buttons, and dense category lists add recall burden. |
| 7 | Flexibility and Efficiency | 2 | Search/admin filters exist, but repeat users lack faster narrowing, bulk patterns, and clear active filter controls. |
| 8 | Aesthetic and Minimalist Design | 2 | Too many oversized rounded cards, shadows, badges, repeated gradients, and generated-looking public visuals. |
| 9 | Error Recovery | 2 | Toasts and error pages exist, but inline recovery paths and guided next steps are uneven. |
| 10 | Help and Documentation | 2 | Some microcopy helps, but onboarding around trust, public readiness, contact safety, and moderation is thin. |
| **Total** | | **23/40** | **Solid foundation, uneven product craft** |

## Anti-Patterns Verdict

**LLM assessment**: The product is useful and coherent enough to not fail the "AI made this" test outright, but it has moderate AI-template risk. The strongest tells are oversized rounded cards, repeated soft shadows, one-note blue-on-blue visual language, generic community-safe copy, long card grids, and generated-looking public imagery. Authenticated surfaces feel more task-real than the public homepage, but the visual system is not yet disciplined enough for a trust-sensitive marketplace.

**Deterministic scan**: The bundled Impeccable detector found 1 warning:

- `side-tab` / Side-tab accent border at `components/admin-users-client.tsx:828` (`border-l-4 border-primary`).

This is technically on a section heading rather than a card, so it is a partial false positive, but it still uses the same side-accent trope and should be replaced with normal hierarchy.

**Web Interface Guidelines evidence**:

- Icon-only buttons missing accessible names in navbar, search, pagination, profile settings, and admin.
- Several image/background treatments have weak or unavailable alt text.
- Nested interactive controls appear where `<Button>` is placed inside `<Link>`.
- Some labels near inputs lack `htmlFor`.
- Opacity-muted small text risks contrast failures.
- `whitespace-nowrap` on the base button can overflow translated or long labels.
- `transition-all`, large radii, and high z-index values appear in several surfaces.

**Visual overlays**: Browser overlay was not available in this session. The critique used dual-agent source review plus the local Impeccable detector and Web Interface Guidelines scan.

## Overall Impression

Skillsy already has the right primitives: public profiles, search, verification, contacts, posts, reports, admin moderation, skeleton loaders, and social previews. The biggest opportunity is not adding more UI; it is making the existing UI feel more deliberate, accessible, and trustworthy. The platform needs one clear visual system and stronger guidance around the flows where trust matters most: finding a provider, creating a public listing, and moderating users/posts.

## What's Working

1. **The product model is real**: ratings, reports, public profiles, contacts, provider fields, and admin controls are the right ingredients for a community marketplace.
2. **Loading coverage is unusually complete**: route-level skeletons cover many public/private pages, which keeps navigation from feeling broken.
3. **Admin surfaces have useful structure**: user/post management includes filters, statuses, reports, actions, and enough information density to be operational.

## Priority Issues

### [P1] Visual System Fragmentation

**Why it matters**: Users see different button shapes, radii, shadows, blues, gradients, and form vocabularies across homepage, search, settings, posts, and admin. That erodes trust because the product feels assembled rather than governed.

**Fix**: Collapse onto one shadcn-compatible token system, one radius scale, and restrained product surfaces. Remove most ad hoc `bg-blue-500`, `rounded-[2rem+]`, `shadow-2xl`, custom hex color overlap, and decorative gradients on product screens.

**Suggested command**: `$impeccable polish`

### [P1] Accessibility Gaps in Core Navigation & Controls

**Why it matters**: Users relying on screen readers or keyboard navigation will hit unnamed icon buttons, weak labels, nested interactive elements, and unclear image alternatives. These are not polish issues; they affect basic operation.

**Fix**: Add explicit `aria-label` or visible text to icon-only buttons, render buttons-as-links correctly, associate labels with inputs, improve alt text, and replace brittle custom filters with accessible controls.

**Suggested command**: `$impeccable audit`

### [P1] Profile Settings Form Is Too Dense

**Why it matters**: Providers must manage identity, location, ward/member info, listing status, service details, business address, contact links, media, and gallery in one long flow. They can complete fields without understanding what makes them visible or trustworthy in search.

**Fix**: Split the form into progressive sections: identity, public profile, provider listing, contact, media. Add a "public profile readiness" panel, required-field summary, and preview of what search/profile visitors will see.

**Suggested command**: `$impeccable distill`

### [P2] Search Filtering Is Mechanically Fine but Cognitively Heavy

**Why it matters**: A marketplace depends on fast narrowing. A long custom category list, hidden checkbox inputs, mobile drawer friction, and weak active-filter summary slow the moment of finding help.

**Fix**: Use searchable category select or popular-category chips, show active filters with one-tap remove, add clear filters, and ensure mobile search exposes the most useful narrowing first.

**Suggested command**: `$impeccable layout`

### [P2] Public Homepage Feels More Generated Than Proven

**Why it matters**: The public side is the trust funnel. Generated-looking hero/category imagery and broad community copy do not prove that Skillsy has real people, real services, and real usefulness.

**Fix**: Replace generic visual storytelling with product evidence: member cards, service examples, location/category coverage, verified profile samples, and a quieter brand frame.

**Suggested command**: `$impeccable bolder`

### [P2] Admin Actions Need Stronger Confirmation & Recovery

**Why it matters**: Publishing, rejecting, blocking, featuring, and seeding affect trust. Native prompts or casual toasts make serious actions feel too easy to misfire.

**Fix**: Use designed confirmation dialogs, explicit consequence copy, per-row loading states, undo where safe, and visible moderation context before committing destructive changes.

**Suggested command**: `$impeccable harden`

## Persona Red Flags

**First-time service seeker**: The search box is clear, but category browsing feels decorative before it feels useful. On mobile, filtering is pushed into a drawer and active filters are not strong enough. This user may search once, see too many loosely sorted options, and leave.

**Provider creating a profile**: The user sees many fields and warnings but not a strong readiness model. "Quero Anunciar" changes the meaning of the form, yet the UI does not clearly say what makes the provider discoverable or credible.

**Admin moderator**: The admin has access to the right actions, but serious operations are not visually or procedurally distinct enough from routine edits. Blocking/rejecting/publishing should feel intentional and recoverable.

## Minor Observations

- `activeTab` appears passed into navbar logic but does not clearly drive a useful active state.
- Dark mode likely diverges from brand because custom hex tokens and shadcn OKLCH tokens overlap.
- Empty states exist but often stop at "nothing here" instead of teaching next action.
- Product screens use motion and hover effects more as decoration than state feedback.
- Some helper text uses `text-[10px]`/`text-[11px]`, which is brittle for accessibility and localization.

## Questions to Consider

1. Is Skillsy primarily a **trusted member directory** or a **community marketplace**? The UI currently tries to be both.
2. What would the homepage look like if it proved trust with real member/service artifacts instead of generated-feeling category scenery?
3. Should provider onboarding optimize for "complete a profile" or "become discoverable in search"?
4. Which admin action would be most damaging if clicked by mistake? That action needs a different interaction pattern first.
