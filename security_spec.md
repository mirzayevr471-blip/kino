# KinoHub.uz Security Specification

## Data Invariants
1. A user profile can only be created with the same ID as the authenticated user.
2. Only the owner can read or write their own profile (PII protection).
3. Movies are "System-Only" writes (Admin only), but public read.
4. Watchlists are stored within the User document or a private subcollection.

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Attempt to create `users/victim_uid` while authenticated as `attacker_uid`.
2. **PII Leak**: Attempt to `get` `users/victim_uid` as an unauthenticated or different user.
3. **Ghost Writes**: Attempt to update `movies/123` as a standard user.
4. **Schema Poisoning**: Attempt to update user profile with `role: 'admin'`.
... (and 8 more)

## Test Runner (Logic Check)
All tests verified to return `PERMISSION_DENIED` for unauthorized relational access.
