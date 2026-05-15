# Membership and Protected Routes Runbook

## Overview

Phase 15 adds the first public membership foundation to NexPress. This includes:

- a dedicated `members` auth collection separate from admin/dashboard `users`
- server-side sign-up, login, logout, and profile update routes
- an HTTP-only member session cookie that does not reuse the dashboard/admin session
- protected public account routing
- published content visibility rules for public vs members-only pages and posts

## Identity boundary

- `users` remains the admin/dashboard identity model
- `members` is a separate public identity model
- public sign-up does not accept or persist admin roles
- member sessions do not grant `/dashboard` or `/admin` access

## Routes

Public routes:

- `/login`
- `/signup`
- `/account`

Server-side auth handlers:

- `POST /api/members/signup`
- `POST /api/members/login`
- `POST /api/members/logout`
- `POST /api/members/profile`

## Session model

- member sessions are stored in the HTTP-only cookie `nexpress-member-token`
- the cookie is `SameSite=Lax`, `path=/`, and `secure` in production
- the cookie is distinct from the Payload admin auth session
- tokens are never stored in `localStorage` or exposed in URLs

## Content protection

Pages and posts now include an `accessLevel` field:

- `public`
- `members`

Behavior:

- anonymous visitors can only resolve `published` content with `accessLevel=public`
- authenticated members can resolve `published` public and members-only content
- draft content remains unavailable publicly
- members-only content is excluded from the sitemap
- metadata generation fails closed for protected anonymous requests and does not expose protected content details

## Payload access notes

- `members.create` is denied at the collection access layer
- sign-up uses a server-only `overrideAccess: true` create path after validation
- member profile updates use `overrideAccess: false` with the authenticated member attached to the local request
- published content reads continue to use `overrideAccess: false`
- internal protected-content existence checks use a narrow `overrideAccess: true` lookup only to decide between login redirect and not-found

## Validation rules

- emails are trimmed, normalized to lowercase, and validated server-side
- passwords must be at least 12 characters and include lowercase, uppercase, number, and symbol characters
- public auth errors stay generic for failed login and duplicate-account scenarios

## Known gaps

- no password reset flow yet
- no email verification flow yet
- no member-facing session management UI beyond profile and logout
- no live Payload migration file was generated because migration creation still requires a live database connection
