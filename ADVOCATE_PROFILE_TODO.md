# Advocate profile — TODO (moved out of registration)

Advocate registration flow is now:
`personal → professional → expertise → stats → review`
(`STEPS_BY_TYPE.advocate` in `components/register/RegisterFlow.tsx`).

## Still pending: move into the profile editor

Only **one** step is deferred to the advocate profile editor
(`app/[locale]/portal/advocate/profile/page.tsx`):

1. **Tajriba / Work history** (`experience` step)
   - Component: `components/register/WorkHistoryEditor.tsx`
   - Data: `ProfessionalProfile.workHistory: WorkEntry[]`
   - i18n: `register.advocate.work.*`
   - The JSX lived in `RegisterFlow.tsx` — recover from git history.

When the profile editor collects work history, add it back to the advocate
completeness checks in `lib/services/registration.ts` (`scoreCompleteness`).

## Restored / current behaviour (for reference)

- **Yo'nalishlar / Practice areas** (`expertise` step) — restored, **optional**
  (no `canContinue` gate). Now uses the categorized catalog
  `lib/legalServices.ts` via `components/register/LegalServicePicker.tsx`
  (accordion: category → sub-services). Selected sub-service keys are stored in
  `ProfessionalProfile.practiceAreas: string[]`.
- **Statistika / Stats** (`stats` step) — restored, reworked:
  - removed *years of practice* and *clients represented*;
  - *cases won* split into two inputs: `fullyWonCases` (fully won) and
    `partiallyWonCases` (charge mitigated / partly granted), each with a short
    note (`register.advocate.stats.fullyWonNote` / `partiallyWonNote`);
  - `successRate` is computed from (fully + partially) / total.
  - Backend `PUT /lawyers/me` maps these to `wins_count` / `partial_wins_count`
    (see `upsertMyLawyer` in `lib/services/backend.ts`).

## Professional step (unchanged from previous change)

- **Specialization** is a dropdown (`register.advocate.specOptions`).
- **Bar association** field removed.
- Two experience inputs: `advocateYears` / `lawyerYears`
  (`register.advocate.advExp` / `lawExp`).
