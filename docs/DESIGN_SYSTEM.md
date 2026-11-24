# ClaimFlow AI Design System

The ClaimFlow AI interface is modeled around a commercial auto claims adjuster's desk: physical claim jackets, formal policy documents with numbered clauses, repair invoices, and definitive rulings. The user experience prioritizes immediate clarity: any first-time visitor or adjuster can understand what happened to a claim and why, without consulting documentation.

---

## 1. Palette & Design Tokens

Defined once as CSS variables in `frontend/src/index.css` and mapped into `tailwind.config.js`. No arbitrary hard-coded hex colors are used in UI components.

| Token | Hex | Role | Usage |
|---|---|---|---|
| `--color-ink` | `#18304F` | Primary Text & Interactive | Main headings, primary buttons, active tab borders, high-emphasis text |
| `--color-paper` | `#F4F6F8` | Canvas Background | Global application background, nested grouping backdrops |
| `--color-surface` | `#FFFFFF` | Content Cards | Data panels, drawers, modals, tables, input backgrounds |
| `--color-rule` | `#D5DBE3` | Dividers & Borders | Subtle card dividers, table borders, panel outlines |
| `--color-field` | `#7D8A9C` | Form Field Outlines | Input borders and select outlines for WCAG AA form visibility |
| `--color-muted` | `#5B6B82` | Secondary Text | Metadata labels, timestamps, subheadings, non-active icons |
| `--color-highlighter`| `#FFE58A` | Policy Quote Highlighting | Verbatim cited policy text background (emulating adjuster physical highlighter) |

---

## 2. Status Tokens & Rules

A status **always** displays three elements together:
1. Color tint
2. Icon
3. Explicit words

Never display color alone.

| Status Enum | Label | Color | Background Tint | Icon | Meaning |
|---|---|---|---|---|---|
| `APPROVED_STP` | Auto-approved | `#1E7B4F` | `rgba(30, 123, 79, 0.12)` | `CheckCircle2` | Passed all governance rules straight-through |
| `PENDING_HITL` | Needs review | `#9A5B00` | `rgba(154, 91, 0, 0.12)` | `AlertTriangle` | Governance gate paused execution for adjuster sign-off |
| `DENIED` | Denied | `#B42318` | `rgba(180, 35, 24, 0.12)` | `XCircle` | Policy exclusion or intentional damage affirmed |
| `SIU_INVESTIGATION`| Sent to SIU | `#5B3FA0` | `rgba(91, 63, 160, 0.12)` | `ShieldAlert` | Fraud score $\ge 60$ or severe staged collision mismatch |
| `SUBROGATION` | Subrogation | `#0E7C7B` | `rgba(14, 124, 123, 0.12)` | `TrendingUp` | Third-party commercial carrier liability recovery |
| `ANALYZING` | Processing | `#2457C5` | `rgba(36, 87, 197, 0.12)` | `Loader2` | Multi-agent graph in flight (also focus ring) |

---

## 3. Typography Scale & Fonts

All fonts are self-hosted offline via npm (`@fontsource/*`) with zero runtime external CDN requests.

- **Interface UI:** IBM Plex Sans (`400`, `500`, `600`, `700`)
- **Document Texts:** IBM Plex Serif (`400`, `400i`, `600`) — used exclusively for verbatim policy citations, claimant narratives, denial/settlement letters, and adjuster notes.
- **Payloads & IDs:** IBM Plex Mono (`400`, `500`) — used for JSON viewers, code snippets, and raw GUIDs.
- **Tabular Figures (`tnum`):** Enforced globally on currency, dates, percentages, VINs, claim numbers, and latencies.

### Type Scale

| Size | Line Height | Usage |
|---|---|---|
| `11px` | `14px` | Micro metadata, badges, table subtext |
| `12px` | `16px` | Standard interface labels, button text, table cells |
| `14px` | `20px` | Table row titles, card subheadings, body reading |
| `16px` | `24px` | Reading prose, narrative previews (max 75 characters per line) |
| `18px` | `26px` | Panel headers, drawer section titles |
| `21px` | `28px` | Screen titles, wizard step headers |
| `24px` | `32px` | Ruling block status words, big currency totals |
| `36px` | `40px` | Executive KPI hero metrics |

---

## 4. Spacing & Shape Hierarchy

- **8px Spacing Grid:** Standard increments: `4px` (gap-1), `8px` (p-2), `12px` (p-3), `16px` (p-4), `24px` (p-6), `32px` (p-8).
- **Corner Radii Hierarchy:**
  - `4px` (`rounded-tag`): Small status tags, pill chips, micro badges.
  - `6px` (`rounded-input`): Form inputs, select dropdowns, standard buttons.
  - `10px` (`rounded-panel`): Data panels, dialogs, drawers, sticky headers.
- **Content Grouping:** Content is segmented with spacing and thin rules (`#D5DBE3`) rather than nesting identical drop-shadow cards.

---

## 5. The Ruling Block ("The One Bold Element")

Located at the top of every claim in the Case File view.
- Prominent uppercase status banner with tabular net payout figure in 24px bold.
- Thick 4px status rule dividing the header from the governance rules checklist.
- Transparent "Why" checklist displaying rule, threshold, actual value, and pass/fail indicator.
- Kept clean and quiet around it to maintain visual focus.

---

## 6. Prohibited Practices ("Avoid List")

1. No gradients or glassmorphism backgrounds.
2. No identical cards with heavy drop shadows.
3. No ALL-CAPS text outside of compact status badges.
4. No metadata joined by bullet strings (`·`).
5. No trailing decorative arrows in button labels (`Proceed ->`).
6. No emoji anywhere in user-facing text.
