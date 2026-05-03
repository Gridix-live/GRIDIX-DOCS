---
name: gridix-knowledge-base
description: Use this skill when answering questions about GRIDIX documentation, helping developers launch real estate projects, explaining project types, genplans, lots, widgets, CRM integrations, developer agent network flows, developer-partner cabinet scenarios, partner/referral scenarios, or implementation steps for integrators.
license: MIT
compatibility: Public Mintlify documentation at https://docs.gridix.live. Use the Russian documentation paths first for Russian-speaking users.
metadata:
  author: GRIDIX
  version: "1.1"
  primary_language: ru
  docs_url: "https://docs.gridix.live"
---

# GRIDIX Knowledge Base Skill

## Purpose

Use this skill to help users understand and implement GRIDIX based on the public documentation at `https://docs.gridix.live`.

GRIDIX is a platform for real estate developers and sales teams. It helps manage projects, lots, prices, statuses, floor plans, genplans, smart catalogs, public catalogs, website widgets, leads, CRM integrations, developer agent networks, developer-partner cabinet scenarios, partner/referral scenarios, analytics, notifications, subscriptions, team access, and branded domains.

## Language and audience rules

- If the user writes in Russian, answer in Russian.
- Write for both a regular user and an integrator: explain what to click or prepare, then explain dependencies and implementation checks.
- Do not treat `usertour` as knowledge base content. It is in-product help and should not be used as the primary documentation source.
- Prefer confirmed documentation facts. If a page says information is being prepared, say that the topic needs confirmation instead of inventing details.
- Do not invent prices, payout terms, legal guarantees, CRM field mappings, exact implementation timelines, or unsupported widget parameters.
- Keep GRIDIX product boundaries clear: developer agent network, developer-partner cabinet, GRIDIX partner/referral program, and integrator model are different scenarios.

## Start from these pages

| Task | Page |
| --- | --- |
| Understand GRIDIX | `/ru/intro` |
| Choose the right user path | `/ru/welcome/quick-routes` |
| Learn basic terms | `/ru/welcome/terms` |
| Prepare launch materials | `/ru/developer-start/launch-preparation` |
| Create a first project | `/ru/getting-started/first-project` |
| Choose project type | `/ru/projects/project-types` |
| Configure genplan and subprojects | `/ru/projects/genplan` |
| Manage lots, statuses, prices, and fields | `/ru/projects/apartments` |
| Explain smart catalog | `/ru/widgets/smart-catalog` |
| Prepare public catalog | `/ru/widgets/public-catalog` |
| Embed website widget | `/ru/widgets/embedding` |
| Debug widget issues | `/ru/widgets/common-errors` |
| Explain leads and requests | `/ru/leads/what-is-lead` |
| Manage leads | `/ru/leads/overview` |
| Check CRM lead flow | `/ru/leads/crm-flow` |
| Connect CRM | `/ru/crm-integrations/amocrm` and `/ru/crm-integrations/bitrix24` |
| Set up developer agent network | `/ru/broker-network/overview` |
| Explain developer-partner cabinet | `/ru/broker-cabinet/overview` |
| Explain partner program | `/ru/partners/overview` |
| Plan integrator implementation | `/ru/integrators/launch-checklist` |

## Product concepts

### Project types

- **Здание**: use for one building or corpus with floors and lots.
- **Объекты**: use for villas, houses, townhouses, land plots, standalone commercial objects, or other lots without floor logic.
- **Генплан**: use when one top-level project contains several corpuses, phases, towers, houses, zones, or subprojects.

### Lots

A lot can be an apartment, office, commercial space, villa, townhouse, house, land plot, or another sellable object. Lot data usually includes number, floor if applicable, area, rooms, price, status, plan, images, custom fields, and public visibility.

### Public catalog and widget

The public catalog is the buyer-facing experience. The widget embeds that catalog into an external website. Before publishing, check project visibility, lots, statuses, prices, media, lead form, mobile view, and test lead delivery.

### Developer agent network vs partner program

- Developer agent network: a developer invites developer partners, agencies, brokers, or agents to work with the developer's projects and leads.
- Developer-partner cabinet: the production user scenario where a developer partner gets access to a developer's projects, lots, materials, links, and related leads.
- GRIDIX partner/referral program: a GRIDIX partner introduces or helps onboard new GRIDIX clients.
- Integrator model: a partner helps the client prepare data, configure the platform, connect website/CRM, and run launch checks.

## Recommended answer pattern

1. Identify the user's role: developer, broker/agency, partner, or integrator.
2. Name the relevant documentation page.
3. Give a short practical path for a regular user.
4. Add implementation checks for an integrator.
5. Warn about missing or unconfirmed information when needed.
6. Suggest screenshots or videos only where the documentation marks them as needed.

## Implementation checklists

### Project launch

1. Prepare project name, location, project type, currency, languages, lots, statuses, prices, floor plans or object images.
2. Decide whether to import from Excel/Google Sheets or create manually.
3. Check project type before importing large data.
4. Verify lots, public catalog, mobile view, and test lead.
5. Connect widget and CRM only after the catalog shows correct data.

### Widget embed

1. Confirm the project is published and has current lot data.
2. Generate the embed code in GRIDIX.
3. Use `projectId` for one project or `userId` for all projects of a developer/agency.
4. Insert code into a real HTML/Embed block, not a regular text block that strips scripts.
5. Use `window.GridixWidget.init(...)` as the widget API.
6. The widget script is normally loaded from `/widget/index.js` on the GRIDIX app domain.
7. Set a stable container height, for example `min-height: 640px`.
8. Test desktop, mobile, and lead submission after publishing.

### Integrator handoff

Ask for:

- table of lots;
- status mapping;
- media and floor plans;
- public catalog requirements;
- website/CMS access or developer contact;
- CRM admin access;
- lead assignment rules;
- languages and currencies;
- developer agent network rules if developer partners, brokers, agents, or agencies are involved.

## Content gap handling

If the user asks about a topic that is not fully documented yet, say: "Информация готовится, нужно подтвердить у команды GRIDIX." Do not point users to internal preparation files.
