# Your Invitation Story

# INVITEHUB — PERSONALIZED DIGITAL INVITATION PLATFORM

You are a senior full-stack engineer, software architect, UI/UX engineer, and product engineer.

We are building a production-quality MVP called **InviteHub**.

The product is a personalized digital invitation platform initially targeted toward the Gujarat/Indian market.

Your job is NOT to blindly start coding.

First understand the product, architecture, workflow, constraints, and future roadmap described below. Then create the application systematically.

---

# 1. PRODUCT VISION

Traditional invitation cards are increasingly being replaced by digital invitations such as PDFs, images, and WhatsApp-forwarded cards.

The problem is that a forwarded PDF/image feels generic.

Our core idea is:

> ONE INVITATION DESIGN → UNIQUE PERSONALIZED INVITATION FOR EVERY GUEST

For example, a wedding has 200 guests.

We should NOT create 200 separate designs manually.

Instead:

Template

    ↓

Invitation Data

    ↓

Guest Data

    ↓

Unique Invitation Token

    ↓

Personalized Invitation

Guest #1 receives:

/i/abc123

and sees:

"Dear Amit..."

Guest #2 receives:

/i/x7k921

and sees:

"Dear Neha..."

The visual template can remain the same, but every guest receives a unique invitation experience.

This personalization is the CORE DIFFERENTIATOR of InviteHub.

---

# 2. DEVELOPMENT PHILOSOPHY

We have a maximum roadmap of 3 versions.

V1 = MVP / market validation

V2 = business expansion

V3 = advanced platform

We are ONLY building V1 now.

However, the architecture must not prevent V2/V3.

IMPORTANT:

Do NOT build V2/V3 features now.

Instead:

- design extensible database relationships

- use reusable components

- keep business configuration data-driven

- avoid hard-coded assumptions

- use clean service boundaries

- make future roles possible

- make future template expansion possible

But do not add unnecessary complexity.

The principle is:

> SIMPLE NOW, EXTENSIBLE LATER.

---

# 3. VERSION 1 ROLES

V1 has ONLY TWO ROLES.

## SUPER ADMIN

This is the platform owner.

Admin has complete control.

Admin can:

- create customers

- edit customers

- activate/deactivate customers

- set invitation limits

- assign templates

- set start date

- set expiry date

- manage categories

- manage templates

- view invitations

- view basic analytics

- manage platform settings

## CUSTOMER

V1 customer means a direct/individual customer.

There is NO Studio role in V1.

There is NO Event Manager role in V1.

There is NO marketing role in V1.

There is NO multi-client workspace in V1.

However, the data model should allow these roles to be introduced in V2.

---

# 4. ADMIN-CONTROLLED CUSTOMER ACCESS

When the admin creates a customer, admin should configure:

Customer Name

Email

Mobile Number

Status

Invitation Limit

Allowed Templates

Start Date

End Date

Example:

Customer:

Rahul Shah

Limit:

200

Used:

143

Remaining:

57

Allowed Templates:

Wedding Template 01

Wedding Template 03

Wedding Template 07

Start:

01 Dec 2026

End:

25 Dec 2026

The customer MUST NOT be able to:

- increase their limit

- assign themselves templates

- modify their expiry

- access unauthorized templates

- access admin functionality

These restrictions must be enforced server-side, not just hidden in the frontend.

---

# 5. V1 CUSTOMER EXPERIENCE

The customer experience should be extremely simple.

Customer logs in.

Then:

Dashboard

    ↓

Templates

    ↓

Select Template

    ↓

Enter Invitation Details

    ↓

Add Guests

    ↓

Unique Links Generated

    ↓

Preview Guest Invitation

    ↓

Copy / Share Link

The customer should not need technical knowledge.

---

# 6. IMPORTANT: NO COMPLEX EVENT MANAGEMENT IN V1

Do NOT create a complicated event-management system.

V1 should focus on the core invitation workflow.

The customer needs:

- invitation/template

- invitation information

- guests

- unique invitation links

Future versions can introduce multiple events and professional accounts.

The architecture should support that later.

---

# 7. TEMPLATE SYSTEM

Templates are reusable React components.

DO NOT hard-code customer information inside templates.

Bad:

const bride = "Priya";

Good:

const invitationData = {

  brideName,

  groomName,

  date,

  venue,

  guestName,

  personalizedMessage

};

The same template should render different guests dynamically.

Example:

Template:

WeddingTemplate01

Guest A:

Dear Amit,

Guest B:

Dear Neha,

Guest C:

Dear Rahul,

Same component.

Different data.

---

# 8. TEMPLATE CATEGORIES

Initial categories:

- Wedding

- Engagement

- Birthday

- Anniversary

- Housewarming

- Religious

- Other

Categories must be database/configuration driven.

Do NOT hard-code the category list into business logic.

Admin should eventually be able to:

- create category

- edit category

- activate/deactivate category

- see template count

---

# 9. INITIAL TEMPLATE COUNT

Start with approximately 8–10 templates.

Example:

Wedding:

- Traditional Wedding 01

- Modern Wedding 02

- Elegant Wedding 03

- Minimal Wedding 04

Engagement:

- Elegant Engagement 01

Birthday:

- Birthday Celebration 01

Housewarming:

- New Home 01

Religious:

- Religious Celebration 01

The exact designs can use attractive placeholder/sample artwork.

The architecture MUST support 50+ templates later without changing the application architecture.

---

# 10. CUSTOMER CANNOT EDIT DESIGN IN V1

Very important.

The customer can select a template.

The customer CANNOT:

- drag/drop elements

- change layout

- change fonts

- modify colors

- move sections

- create custom templates

They only provide data.

Template design is controlled by the platform/admin.

Advanced customization belongs to V3.

---

# 11. PERSONALIZATION SYSTEM

Every guest gets a unique invitation.

Example database concept:

Customer

   ↓

Invitation

   ↓

Guest

   ↓

PersonalizedInvitation

   ↓

UniqueToken

A guest URL might look like:

/i/8FJ29KD

or:

/i/x72kP91m

The token must be random/opaque.

DO NOT put guest names or phone numbers directly in the URL.

Example BAD:

/i/rahul-shah

Example GOOD:

/i/a8Kx91Pq

---

# 12. GUEST DATA

V1 guest fields:

- id

- invitation_id

- name

- mobile_number (optional)

- group (optional)

- token

- status

- created_at

- last_viewed_at

Possible status:

- Not Opened

- Opened

Do NOT implement RSVP in V1.

---

# 13. MANUAL GUEST ENTRY

V1 should use manual guest entry.

Customer clicks:

+ Add Guest

Form:

Guest Name

Mobile Number (optional)

Group (optional)

Submit.

System:

1. validates limit

2. creates guest

3. generates secure unique token

4. creates invitation link

5. displays link

Example:

Guest:

Amit Shah

Link:

/i/7Fk3Pq

---

# 14. INVITATION LIMIT

Suppose admin gives customer:

200 invitations.

Customer has:

143 used.

Then:

57 remaining.

When they reach 200:

Do NOT allow another guest to be created.

Show:

"You've reached your invitation limit. Please contact support to increase your limit."

The limit must be enforced in backend/server/database logic.

Never rely only on frontend validation.

---

# 15. PERSONALIZED INVITATION PAGE

Public route:

/i/:token

This page does NOT require customer login.

The system:

1. receives token

2. validates token

3. checks invitation/customer status

4. checks start date

5. checks expiry

6. retrieves guest

7. retrieves invitation data

8. retrieves template

9. renders personalized invitation

Example:

Dear Amit,

Your presence would make our special day even more meaningful.

Rahul & Priya

20 December 2026

The Grand Palace

Ahmedabad

The guest should feel:

"This invitation was made for ME."

---

# 16. GUEST-SPECIFIC PREVIEW

This is extremely important.

Inside customer dashboard:

Guest Invitations

Amit Shah

Neha Patel

Karan Mehta

Priya Desai

When customer selects Amit:

Preview shows:

"Dear Amit..."

When customer selects Neha:

Preview changes to:

"Dear Neha..."

The customer should be able to verify exactly what each guest will receive.

The UI should clearly say:

"Personalized invitation for Amit"

This should be a major visual feature.

---

# 17. CUSTOMER MY INVITATION SCREEN

Design this page carefully.

Header:

Rahul & Priya Wedding

Status:

Active

Statistics:

200 Total Guests

200 Personalized Invitations

143 Opened

57 Not Opened

Main section:

## Guest Invitations

Search

Filter

Bulk Actions (basic UI only)

Table:

Guest Name

Group

People

Invitation Status

Last Activity

Actions

Actions:

Preview

Copy Link

Share

More

Right side:

## Guest Invitation Preview

Selected guest:

Amit Shah

Tabs:

Invitation View

Message

Details

Large invitation preview.

Buttons:

Copy Link

Share

Open in New Tab

And a clear message:

"Every guest receives a unique personalized invitation."

---

# 18. SHARING

V1 needs:

Copy Link

Share

Browser/device native sharing where supported.

WhatsApp can be supported using a simple share/deep-link mechanism.

DO NOT build:

- official WhatsApp Business API

- bulk WhatsApp automation

- scheduled WhatsApp messages

- WhatsApp CRM

Those belong to future versions.

---

# 19. CUSTOMER DASHBOARD

Customer dashboard should be much simpler than Admin.

Example:

Hi Rahul 👋

Let's create something special for your guests.

Stats:

1 Active Invitation

143 Guests

120 Opened

57 Remaining

Sections:

Popular Templates

Recent Guests

Invitation Usage

Quick Actions

Help/Support

Quick actions:

Choose Template

Add Guest

View Invitation

Share Invitation

---

# 20. CUSTOMER TEMPLATES SCREEN

Show only templates assigned by admin.

Template card:

[Template Preview]

Traditional Wedding 01

Wedding

[Select Template]

Customer should NOT see templates they don't have access to.

---

# 21. CUSTOMER GUESTS SCREEN

Page:

My Guests

Stats:

Total Guests

Opened

Not Opened

Remaining

Actions:

+ Add Guest

Search

Guest table:

Name

Mobile

Group

Invitation

Status

Actions

Actions:

Preview

Copy

Share

NO CSV upload in V1.

---

# 22. LINKS & SHARING SCREEN

Create a clean page for:

Links & Sharing

Show:

Selected guest

Unique invitation URL

Copy button

Share button

Invitation preview

Optional:

QR Code

The QR code is useful but should not complicate the architecture.

---

# 23. CUSTOMER ANALYTICS

Keep it simple.

Metrics:

Total Guests

Total Invitations

Opened

Not Opened

Open Rate

Used

Remaining

Example:

200 invitations

143 opened

57 not opened

72% open rate

No advanced location/device tracking in V1.

---

# 24. ACCOUNT SETTINGS

Customer can manage:

Profile

Basic Preferences

Password/Security

Notifications

Customer CANNOT change:

Invitation Limit

Assigned Templates

Start Date

End Date

Admin permissions

---

# 25. ADMIN PAGES

Create:

/admin/dashboard

/admin/customers

/admin/customers/new

/admin/customers/:id

/admin/templates

/admin/categories

/admin/invitations

/admin/analytics

/admin/settings

---

# 26. ADMIN DASHBOARD

Create a premium SaaS dashboard.

Metrics:

Total Customers

Active Customers

Total Templates

Total Invitations

Total Views

Charts:

Invitation Activity

Popular Categories

Popular Templates

Sections:

Recent Customers

Recent Activity

Use realistic fictional demo data.

---

# 27. ADMIN CUSTOMERS

Customer table:

Name

Email

Mobile

Type

Limit

Used

Remaining

Status

Created

Actions

Filters:

Search

Status

Type

Add Customer

Customer detail screen should show:

Profile

Access

Limits

Templates

Dates

Usage

Analytics

---

# 28. ADMIN TEMPLATE MANAGEMENT

Visual template gallery.

Each card:

Preview

Name

Category

Status

Created Date

Actions

Actions:

Edit

Activate/Deactivate

Preview

Admin should be able to assign templates to customers.

---

# 29. ADMIN CATEGORIES

Page:

Categories

Metrics:

Total Categories

Active Categories

Inactive Categories

Total Templates

Table:

Category

Description

Templates

Status

Created

Actions

Add Category.

---

# 30. ADMIN INVITATIONS

Table:

Invitation

Customer

Template

Guests

Opened

Status

Start Date

End Date

Actions

Filters:

Customer

Status

Date

Category

---

# 31. ADMIN ANALYTICS

Basic:

Total invitations

Total views

Opened

Not opened

Active customers

Popular templates

Popular categories

Keep charts simple and useful.

---

# 32. ADMIN SETTINGS

Settings sections:

General

Branding

Notifications

Security

System

Admin settings may include:

Platform Name

Logo

Support Email

Support Phone

Timezone

Default Language

Maintenance Mode

Danger Zone should be visually separated.

---

# 33. AUTHENTICATION

Implement proper authentication.

At minimum:

Login

Logout

Protected routes

Role-based access:

SUPER_ADMIN

CUSTOMER

A customer attempting:

/admin/dashboard

must be rejected.

An unauthenticated user must be redirected to login for protected pages.

The public:

/i/:token

route remains accessible without login.

---

# 34. DATABASE ARCHITECTURE

Use a relational structure.

Recommended conceptual entities:

users

profiles

customers

categories

templates

customer_template_access

invitations

guests

invitation_views

platform_settings

Potential relationships:

users

  ↓

profiles

  ↓

customers

customers

  ↓

customer_template_access

  ↓

templates

  ↓

categories

customers

  ↓

invitations

  ↓

guests

  ↓

unique invitation tokens

guests

  ↓

invitation_views

Do not duplicate invitation data unnecessarily.

---

# 35. FUTURE-PROOF ROLE MODEL

V1:

SUPER_ADMIN

CUSTOMER

But database architecture should allow:

SUPER_ADMIN

CUSTOMER

STUDIO

EVENT_MANAGER

in V2.

Do NOT expose Studio/Event Manager UI in V1.

---

# 36. FUTURE VERSION PLAN

## VERSION 2

Potential:

Studio role

Event Manager role

Multiple clients

Multiple events

50+ templates

CSV import

Advanced WhatsApp sharing

Bulk operations

Better analytics

Professional workspace

## VERSION 3

Potential:

Drag-and-drop builder

Template customization

RSVP

AI-generated content

Advanced personalization

QR check-in

Calendar integration

Advanced analytics

Custom domains

Premium features

Do not implement these now.

---

# 37. UI DESIGN

The UI should NOT look like a generic Bootstrap/admin dashboard.

We want:

Premium

Elegant

Modern

Soft

Warm

Indian wedding inspired

Professional

Simple

Color direction:

- soft white

- very light lavender

- subtle blue

- restrained purple

- soft pink

- peach

- light green

Use:

- rounded cards

- subtle shadows

- generous spacing

- elegant typography

- clean icons

- subtle gradients

- delicate floral elements

- tasteful wedding motifs

Avoid:

- excessive gradients

- overly saturated colors

- clutter

- too many animations

- childish wedding graphics

- generic dashboard appearance

---

# 38. TWO DIFFERENT VISUAL EXPERIENCES

ADMIN:

Professional SaaS.

CUSTOMER:

Warm + elegant + invitation-focused.

PUBLIC INVITATION:

Beautiful, emotional, premium wedding/invitation experience.

Do not make the public invitation look like an admin dashboard.

---

# 39. RESPONSIVENESS

Desktop-first because admin/customer dashboards will primarily be used on desktop.

But customer and guest experiences MUST work beautifully on mobile.

Especially:

/i/:token

must be mobile-first.

A guest will very likely open the invitation from WhatsApp on their phone.

The public invitation page should therefore feel like a premium mobile digital card.

---

# 40. PERFORMANCE

Prioritize:

- fast initial loading

- optimized images

- lazy loading where useful

- reusable components

- minimal unnecessary JavaScript

- efficient database queries

- proper indexes for invitation tokens

Invitation pages should load quickly on mobile networks.

---

# 41. SECURITY

Important:

- secure authentication

- role-based authorization

- server-side authorization

- secure random invitation tokens

- never expose private customer information in URL

- validate all user input

- enforce limits server-side

- enforce expiry server-side

- prevent unauthorized template access

- prevent customer privilege escalation

Invitation token should be sufficiently random and unguessable.

---

# 42. DEMO DATA

Create realistic fictional demo data.

Example:

Customer:

Rahul Shah

Invitation:

Rahul & Priya Wedding

Guests:

Amit Shah

Neha Patel

Karan Mehta

Priya Desai

Rahul Joshi

Simran Thakkar

Deepak Kumar

Patel Family

Use fictional data only.

---

# 43. EMPTY STATES

Every major screen needs a good empty state.

Examples:

No guests yet.

"No guests added yet. Add your first guest to create a personalized invitation."

No templates.

"No templates are currently assigned to your account."

No invitations.

"No invitations created yet."

---

# 44. LOADING STATES

Use proper skeleton/loading states.

Do not show blank white screens.

---

# 45. ERROR STATES

Errors should be understandable.

Bad:

"500 Error"

Better:

"We couldn't load your invitation. Please try again."

---

# 46. SUCCESS STATES

Examples:

"Guest added successfully."

"Invitation link copied."

"Customer created successfully."

"Template access updated."

---

# 47. IMPORTANT UX DETAIL

When a customer adds a guest:

Guest added

   ↓

Unique invitation generated

   ↓

Show success

Example:

"Invitation created for Amit Shah."

[Preview Invitation]

[Copy Link]

[Share]

This should feel satisfying and obvious.

---

# 48. INVITATION EXPIRY

Before rendering /i/:token:

Check:

Customer status

Invitation status

Start date

End date

Token validity

If expired:

Show a beautiful minimal page:

"This invitation is no longer active."

Do not show an application error.

---

# 49. ARCHITECTURE RULE

Do NOT create a separate React application for:

Admin

Customer

Invitation

Use one application with clear route boundaries and reusable components.

Conceptually:

src/

components/

features/

layouts/

pages/

services/

hooks/

lib/

types/

Organize code cleanly.

---

# 50. COMPONENT PHILOSOPHY

Create reusable components for:

Button

Card

Modal

Table

Search

Filter

StatusBadge

StatsCard

TemplateCard

GuestTable

InvitationPreview

Sidebar

Topbar

EmptyState

LoadingState

Avoid duplicating UI code.

---

# 51. BUSINESS LOGIC SEPARATION

Keep business logic separate from presentation.

For example:

Invitation service:

createGuestInvitation()

generateInvitationToken()

validateInvitationToken()

checkInvitationLimit()

checkInvitationExpiry()

recordInvitationView()

Template service:

getAvailableTemplates()

getCustomerTemplates()

assignTemplateToCustomer()

Customer service:

createCustomer()

updateCustomer()

updateCustomerLimit()

updateCustomerAccess()

This will make V2 much easier.

---

# 52. DO NOT OVER-ENGINEER

This is a startup MVP.

We have limited budget.

We need to test the market quickly.

Do NOT introduce unnecessary:

- microservices

- event buses

- Kubernetes

- complicated infrastructure

- excessive abstraction

- enterprise architecture

- unnecessary third-party services

A clean modular monolith is preferred.

---

# 53. DEPLOYMENT PHILOSOPHY

Prefer low-cost/free-tier services initially.

Architecture should be inexpensive to run.

Target:

Frontend/application hosting:

Free/low-cost tier

Database:

Supabase/PostgreSQL or equivalent low-cost managed PostgreSQL

Authentication:

Supabase Auth or equivalent

Storage:

Low-cost/free object storage if required

Do not introduce paid infrastructure unless genuinely necessary.

---

# 54. DEVELOPMENT PROCESS

DO NOT immediately generate hundreds of files.

Follow this process:

STEP 1

Analyze requirements.

STEP 2

Create architecture proposal.

STEP 3

Create database schema.

STEP 4

Create route map.

STEP 5

Create component/design system plan.

STEP 6

Create V1 implementation plan.

STEP 7

Implement authentication + roles.

STEP 8

Implement admin customer management.

STEP 9

Implement templates/categories.

STEP 10

Implement customer template selection.

STEP 11

Implement invitation details.

STEP 12

Implement guest management.

STEP 13

Implement unique invitation generation.

STEP 14

Implement public personalized invitation.

STEP 15

Implement preview.

STEP 16

Implement copy/share.

STEP 17

Implement basic analytics.

STEP 18

Test complete workflow.

---

# 55. CRITICAL END-TO-END TEST

The following must work:

Admin logs in

↓

Creates customer

↓

Sets limit = 200

↓

Assigns Wedding Template 01

↓

Sets expiry

↓

Customer logs in

↓

Customer sees Wedding Template 01

↓

Customer selects template

↓

Customer enters wedding details

↓

Customer adds Amit

↓

System generates unique token

↓

System creates unique URL

↓

Customer previews Amit's invitation

↓

Preview says "Dear Amit"

↓

Customer copies link

↓

Guest opens /i/token

↓

Invitation loads

↓

Guest name is Amit

↓

View is recorded

↓

Customer sees invitation as Opened

This complete chain is the PRIMARY V1 success criterion.

---

# 56. IMPORTANT PRODUCT RULE

Never lose sight of this:

We are NOT simply building:

"an online invitation template website."

We are building:

"A platform where every guest receives a unique personalized digital invitation."

Every major UI and architectural decision should support this idea.

---

# 57. BEFORE CODING

Before writing implementation code, provide me with:

1. Recommended architecture

2. Technology stack

3. Database schema

4. Entity relationships

5. Route structure

6. Authentication/authorization approach

7. Folder structure

8. V1 development phases

9. Security considerations

10. Estimated complexity of each module

Then wait for approval before doing large-scale implementation.

If something in this specification conflicts with another requirement, prioritize:

1. Core personalization

2. V1 simplicity

3. Security

4. Admin control

5. Extensibility

6. UI polish

Do not add features simply because they might be useful.

Build only what V1 needs.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c38e06f-dd9d-4905-949d-b893470d37d1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
