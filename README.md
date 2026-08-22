# Active usluge — summary of changes

This document describes all the features and fixes added in this session, grouped by area.

## 1. Contracts (Word/PDF generation)

- Added a Word contract template with placeholders (`ugovor_template.docx`).
- New backend module `contract.py`:
  - `generate_contract()` — returns the `.docx` version of the contract.
  - `generate_contract_pdf()` — fills the template (docxtpl) and converts it to PDF via LibreOffice (`soffice --headless`).
- New route `GET /api/reservations/{id}/contract` — generates and returns a PDF contract for a given reservation.
- Added a "Contract" button in the reservation menu (`ReservationAdmin.jsx` and `admin.jsx`) that downloads the PDF.
- Fixed an issue with Croatian diacritics in the filename (`slugify_filename` — transliterates to ASCII, since HTTP headers must be latin-1/ASCII-safe).

## 2. Reservations

- Restored the `POST /api/reservations` route, which was missing (cause of 405 errors) — most likely deleted by accident during manual edits.
- `AddReservation.jsx` and `EditReservation.jsx` reworked from a single `<select>` for equipment to a **checkbox multi-select** — a single reservation can now include multiple pieces of equipment (joined into one text string for storage).
- Added blocked-date validation (global block + per-equipment blocks) to `EditReservation.jsx`, mirroring `AddReservation.jsx`.
- Equipment with current availability (`real_available`) of 0 is now disabled for selection (unless it's already part of the reservation being edited) — no point reserving something that isn't available at all.
- Added monthly revenue calculation (`revenue`) to `GET /api/reservations` — sums the amount of confirmed reservations (`status = 'Potvrđeno'`) within the current calendar month, shown on the dashboard ("Revenue this month").
- The "+ New reservation" button on the dashboard (`admin.jsx`) opens the `AddReservation` modal.

## 3. Blocked dates (full-day blocks)

- `POST /api/blocked-dates` now checks whether an active reservation (status other than "Cancelled") already exists for the day being blocked — if so, it returns an error with the formatted date instead of silently succeeding.
- Added the ability to **edit** a blocked day:
  - New route `PUT /api/blocked-dates/{id}` (with the same conflict check against reservations).
  - New modal `EditBlockDate.jsx` — changes the date and/or reason for the block.
  - `BlockDateAdd.jsx` got an edit button (pencil) next to the existing delete button.

## 4. Equipment blocks (date ranges)

- Added the ability to view, edit, and delete all active blocks for a specific piece of equipment:
  - New modal `ManageBlockedEquipment.jsx` — opened via "Edit blocks" in the equipment card's menu, shows a list of blocks (dates, quantity, reason) with inline editing and deletion.
  - Uses the existing backend routes (`GET/PUT/DELETE /api/blocked-equipment`).
  - `EquipmentCard.jsx` updated to open this new modal.

## 5. Public reservation request form (`RentRequest.jsx`)

Clients can now submit a real reservation request without logging in:

- Equipment is pulled from the database (`GET /api/equipment/catalog`) instead of a hardcoded list.
- Checks blocked dates (globally + per selected equipment) before submitting.
- Equipment with 0 availability is disabled for selection.
- Total price is auto-calculated on the frontend for display, but the **backend is the source of truth** — it sums the prices of the selected equipment from the database itself and stores it as `amount` (the admin can add a delivery/shipping fee later by editing the reservation).
- The request is actually saved into the system as a reservation with status "Pending".
- New public (no-auth) backend routes:
  - `GET /api/public/blocked-dates`
  - `GET /api/public/blocked-equipment`
  - `POST /api/public/reservations`

## 6. Equipment — validation and fixes

- Added a check that **available quantity cannot exceed total quantity** (both on the frontend in `EditEquipment.jsx` and on the backend in `POST/PUT /api/equipment`).
- Fixed a bug in the required-fields validation — the `!value` check incorrectly treated the number `0` as "empty". Replaced with an `=== ""` check so that 0 counts as valid input.
- Fixed the error message text and a typo ("Spremni" → "Spremi") in `EditEquipment.jsx`.
- Fixed a missing space in the `UPDATE equipment` SQL query (`description = %sWHERE` → `description = %s WHERE`) — this was causing saves to fail.
- Renamed the `get_equipment` function (catalog route) to `get_equipment_catalog` to avoid a name collision with the admin route.

## 7. Clients — bug fix

- Fixed a bug in `POST /api/clients` — the OIB duplicate check referenced an undefined variable `id` (actually Python's built-in function), which caused a `500` error on every client creation. Removed the unnecessary `id` exclusion (it doesn't make sense when adding a brand-new client anyway).

## Summary of new/changed files

**Backend (`main.py`):**
- `POST /api/reservations` (restored)
- `POST /api/blocked-dates` (added conflict check)
- `PUT /api/blocked-dates/{id}` (new)
- `GET /api/equipment/catalog` (added `real_available`)
- `GET /api/public/blocked-dates`, `GET /api/public/blocked-equipment`, `POST /api/public/reservations` (new)
- `POST/PUT /api/equipment` (added quantity validation, fixed SQL)
- `POST /api/clients` (bug fix)
- `GET /api/reservations/{id}/contract` (new)

**Frontend:**
- `AddReservation.jsx`, `EditReservation.jsx` — equipment multi-select, availability and block checks
- `BlockDate.jsx`, `BlockDateAdd.jsx`, `EditBlockDate.jsx` — editing blocked dates
- `EquipmentCard.jsx`, `ManageBlockedEquipment.jsx` — editing equipment blocks
- `EditEquipment.jsx` — quantity validation
- `RentRequest.jsx` — fully functional public request form
- `admin.jsx`, `ReservationAdmin.jsx` — dashboard and contract generation
- `contract.py` — contract generation
