# JoGo Learning Lab — product specification

## Purpose

Create one dependable place for Mr Jo to catalogue interactive learning builds and share approved activities with learners. The public product must read as curriculum-led practice, not as an arcade or free-play collection.

## Users

- Learners in Grades 2–7 who receive a direct class link.
- Parents and colleagues who want to understand the educational purpose quickly.
- Mr Jo, who needs one build catalogue with source, host, status and QA information.

## Product names

- Public: **JoGo Learning Lab**
- Developer catalogue: **JoGo Studio**
- Public item noun: **activity** or **interactive learning experience**

Avoid `game hub`, `arcade`, `playground`, `gaming portal` and reward-first descriptions in public copy.

## User stories

- As a learner, I can find an activity by subject or grade and open it without reading developer information.
- As a parent or colleague, I can see what concept the activity teaches, what the learner does and what evidence it produces.
- As Mr Jo, I can see published, testing, review and local builds in one catalogue.
- As Mr Jo, I can add or update one registry entry without editing page markup.
- As Mr Jo, I can share the public page without exposing local paths or unfinished builds.

## Information architecture

### Public Learning Lab

- Purpose-led introduction
- Trust strip explaining the classroom use
- Subject, grade and text filters
- Published activity cards
- What learners do and evidence of learning
- External `Open activity` link
- Short parent and colleague explanation

### JoGo Studio

- Unlinked hash route: `#studio`
- Clear warning that the view is unlinked, not authenticated
- Counts by build status
- Search and status filters
- Source folder, repository, live link, last check and learning-design score
- No credentials, absolute paths, learner information or secret notes

## Data model

`src/data/experiences.json` is the single catalogue. Public visibility requires:

- `public: true`
- `status: published`
- a verified HTTPS URL
- `lastChecked`
- learning objective, learner action and evidence fields

## Constraints

- Static Vite site suitable for GitHub Pages.
- Each activity remains in its current repository and hosting environment.
- No accounts or database in V1.
- The Studio route is not presented as private or secure.
- Public copy follows South African English and the public-language guide.
- No activity project may be changed as part of this portal build.

## Non-goals

- Moving every activity into one repository.
- Adding learner accounts or storing learner results centrally.
- Rebuilding or redesigning existing activities.
- Claiming curriculum approval that has not been formally obtained.
- Treating an unlinked route as authentication.

## Acceptance checks

- The public page shows only entries marked published and public.
- Every public card states concept, learner action and evidence.
- Subject, grade and text filters work on desktop and mobile.
- Every public URL passes the automated link check.
- Studio shows all registry entries and is absent from public navigation.
- Registry tests reject broken visibility rules, unsafe paths and malformed scores.
- Production build passes.
- Desktop and mobile screenshots are inspected.
- Existing activity repositories remain unchanged.
