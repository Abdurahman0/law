# Advocate profile — TODO (moved out of registration)

Three steps were **removed from advocate registration** to keep sign-up short.
They must be re-added later inside the **advocate profile editor**, not the
registration wizard.

- Registration flow: `components/register/RegisterFlow.tsx`
  (`STEPS_BY_TYPE.advocate` is now `["personal", "professional", "review"]`).
- Target for re-adding: `app/[locale]/portal/advocate/profile/page.tsx`.

## Steps to move into the profile

1. **Tajriba / Work history** (`experience` step)
   - Component: `components/register/WorkHistoryEditor.tsx`
   - Data: `ProfessionalProfile.workHistory: WorkEntry[]`
   - i18n: `register.advocate.work.*`

2. **Yo'nalishlar / Practice areas** (`expertise` step)
   - Component: `components/register/ChipMulti.tsx` fed by `AREA_KEYS`
   - Data: `ProfessionalProfile.practiceAreas: string[]` (enum `enums.areas`)
   - i18n: `register.advocate.expertiseTitle`, `expertiseSubtitle`

3. **Statistika / Stats** (`stats` step)
   - Component: `components/register/StatsEditor.tsx`
   - Data: `ProfessionalProfile.stats: AdvocateStats`
   - i18n: `register.advocate.stats.*`

The old JSX for all three lived in `RegisterFlow.tsx` (git history: the commit
that trimmed the advocate steps) — copy from there when wiring the profile
editor.

## Also changed in the professional step

- **Specialization** is now a dropdown (`register.advocate.specOptions`:
  `criminalAdmin`, `economicCivil`, `both`) instead of a free-text input.
- **Bar association** (`register.advocate.bar`) field was removed from
  registration.
- Single "experience (years)" replaced by **two** inputs:
  `ProfessionalProfile.advocateYears` and `ProfessionalProfile.lawyerYears`
  (i18n `register.advocate.advExp` / `lawExp`).

When the profile editor collects work history / practice areas / stats again,
update the advocate completeness checks in
`lib/services/registration.ts` (`scoreCompleteness`) to include them.
