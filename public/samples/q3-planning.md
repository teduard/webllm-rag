# Q3 Planning Meeting
**Date:** 14 August 2024  
**Attendees:** Sandra Okafor (Product), James Thill (Engineering), Priya Nair (Design), Marcus Webb (QA)

---

## Agenda recap

1. Q2 retrospective and carry-over items
2. Q3 roadmap priorities
3. Resource constraints and hiring
4. Release schedule and freeze dates

---

## Q2 retrospective

James opened by noting that the search re-architecture shipped two weeks late due to an underestimated migration of legacy indexing jobs. The delay caused the analytics dashboard feature to slip into Q3. Sandra acknowledged the timeline pressure but emphasised that cutting scope mid-sprint created more confusion than the delay itself. Agreement reached: scope changes after sprint start require a formal sign-off from both Product and Engineering leads.

Priya raised that design handoff was bottlenecked three times in Q2 because engineering started implementation before final specs were approved. James agreed this was a problem. New process agreed: engineering cannot begin implementation on a feature until the design is marked "approved" in Figma. Priya will set up a Slack notification for status changes.

Marcus flagged that three regressions in Q2 traced back to features shipped without integration tests. James committed to a new policy: no PR merges without at least one integration test per new endpoint.

---

## Q3 roadmap priorities

Sandra presented the three priority tiers:

**P0 - must ship by end of Q3:**
- Analytics dashboard (carried from Q2) - owner: James, target: 6 September
- Notification centre redesign - owner: Priya, target: 20 September
- Mobile performance audit and fixes - owner: Marcus, target: 4 October

**P1 - ship if capacity allows:**
- Saved searches feature
- Bulk export (CSV and PDF)
- Dark mode for the admin panel

**P2 - under consideration, no commitment:**
- AI-assisted tagging
- Multi-language support
- Calendar integration

James raised concern about the analytics dashboard timeline given the current sprint load. Sandra agreed to move two P1 items (saved searches and bulk export) to Q4 to create headroom. James confirmed this makes the 6 September target achievable.

---

## Resource constraints and hiring

Sandra confirmed that the approved headcount for Q3 is one senior frontend engineer and one QA engineer. Recruiting is actively screening candidates. James requested that the frontend hire be prioritised since mobile performance work is blocked on bandwidth. Sandra will follow up with HR to adjust job posting priority.

Priya noted her contract ends 31 October and she has not yet received confirmation of renewal. Sandra said she would escalate to finance by end of week. Priya confirmed she would not start new major design work until her contract status is resolved.

---

## Release schedule and freeze dates

Marcus presented the proposed release calendar:

| Date | Event |
|---|---|
| 6 September | Analytics dashboard release |
| 13 September | Code freeze for notification centre |
| 20 September | Notification centre release |
| 27 September | Mid-quarter review |
| 11 October | Code freeze for mobile performance |
| 18 October | Mobile performance release |
| 25 October | Q3 close and retrospective |

All attendees agreed to the calendar. Marcus will publish it to the shared engineering calendar by end of day.

---

## Action items

| Owner | Action | Due |
|---|---|---|
| Sandra | Escalate Priya's contract renewal to finance | 16 August |
| Sandra | Follow up with HR on frontend hire priority | 16 August |
| James | Publish updated sprint plan reflecting scope changes | 19 August |
| Priya | Set up Figma approval Slack notifications | 19 August |
| Marcus | Publish release calendar to shared engineering calendar | 14 August |
| James | Draft integration test policy document | 23 August |

---

## Next meeting

Q3 mid-quarter review: **27 September 2024, 10:00–11:30 BST**  
Chair: Sandra Okafor  
Pre-read: Sprint velocity report and P0 status update (James to circulate by 25 September)
