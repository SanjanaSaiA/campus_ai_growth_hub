# Campus AI Growth Hub

A polished prototype for the NxtWave Growth Challenge.

## What this asset demonstrates

The core working asset is a referral-driven growth system:

Partner → Referral Link → Student Registration → Source Attribution → Campus AI League → Growth Dashboard

### Student side
- Conversion-focused workshop landing page
- Student registration
- Referral capture
- Duplicate registration protection
- Confirmation page
- Calendar `.ics` generation
- Invite/referral link

### Partner side
- Partner onboarding
- Unique referral code
- Personalized referral link
- English campaign message
- Telugu-English campaign message
- Copy/share controls

### Growth side
- Verified registration count
- Channel tracking
- 500-registration target
- College leaderboard
- Partner leaderboard
- 7-day pace
- Operating decision rules
- Reminder automation prototype

## Run locally

Requirements:
- Node.js 18+

Commands:

```bash
npm install
npm run dev
```

Open the URL shown by Vite (normally http://localhost:5173).

Build for production:

```bash
npm run build
npm run preview
```

## Important

This is a simulation/prototype. It does not claim access to NxtWave internal systems, student lists, WhatsApp APIs, or official reward/certificate programs.

Demo data is stored in browser localStorage so the prototype works without a backend.


## Updated UI / interaction pass

This version adds:
- More polished typography using Manrope, DM Sans and Space Grotesk.
- Student-first conversion copy and visual hierarchy.
- Animated route transition when moving to registration.
- Registration form loading state ("Securing your seat...").
- Duplicate-registration error shake animation.
- Animated confirmation/checkmark treatment.
- Confetti celebration after successful registration.
- "Invite 3 friends" referral/share CTA.
- WhatsApp share action on confirmation.
- Hover and micro-interactions on cards and CTAs.
- Responsive mobile behavior.

The core product remains one working asset: referral + registration + attribution + leaderboard + measurement.


### Student conversion redesign
- Denser, less-empty student landing page
- Stronger placement/interview-focused copy
- Campus AI League and referral motivation section
- Reward/priority messaging explicitly marked as subject to organizer approval
- Centered registration experience with benefits panel
- More visual hierarchy, hover effects and responsive layout


## Student Conversion v2
- Filled homepage with student value, Campus AI League, referral motivation and reward eligibility.
- Centered registration experience with a student-benefit panel.
- Added clear priority-recognition/reward language without claiming guaranteed NxtWave approval.
- Added mobile-responsive layouts and stronger visual hierarchy.


## Dark Radium Theme
The UI has been switched to a midnight/dark-blue visual system with electric blue, cyan and violet glow accents. Student conversion flows, registration, confirmation, leaderboard, dashboard and partner pages share the same dark visual language.


## Final Unified Theme Pass
The previous mixed light/dark sections were replaced with a consistent midnight navy + electric blue/cyan/violet radium theme. Text contrast was explicitly overridden for all major sections so headings and body copy remain visible.

## Partner + Stats Refinement
- Fixed the top stats strip so it stays dark and readable.
- Rebuilt the Partner With Us page into a campus-partner conversion flow.
- Added partner benefits, 3-step process, stronger form, and generated kit success state.
- Added ready-to-share WhatsApp copy and Campus AI League next step.
