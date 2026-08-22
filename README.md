# Active usluge

Admin platform for a party-equipment rental business. Lets the admin manage equipment inventory, reservations, clients, and date/equipment blocking, generate rental contracts, and lets prospective clients submit rental requests through a public-facing form — without needing an account.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS v4
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL, accessed via raw SQL (`psycopg2`, `RealDictCursor`) through two helpers, `takeFromBase` (SELECT, returns list of dicts) and `executeQuery` (INSERT/UPDATE/DELETE, returns True/False)
- **Auth:** JWT stored in an httponly cookie (`access_token`), admin-only routes protected via a `get_current_admin` dependency
- **Documents:** `docxtpl` (Word template filling) + LibreOffice headless (DOCX → PDF conversion)
- **Deployment target:** single VPS

## Features

### Dashboard
- Overview cards: pending / confirmed / cancelled reservations, monthly revenue
- Quick actions: add reservation, block dates

### Reservations
- Create, edit, delete reservations
- Select multiple pieces of equipment per reservation (checkbox multi-select)
- Client autocomplete by name (pre-fills OIB from existing client records)
- Equipment currently unavailable (0 in stock after accounting for active blocks) is disabled for selection
- Date picker respects a minimum 2-day advance-booking rule
- Validates the chosen date against both globally blocked dates and per-equipment blocked ranges
- Status tracking: Pending / Confirmed / Cancelled
- One-click Word/PDF rental contract generation per reservation

### Equipment
- Add, edit, delete equipment (name, category, price/day, total quantity, available quantity, description)
- Validates that available quantity can never exceed total quantity
- Real-time availability calculation that accounts for active date-range blocks
- Block a date range for a specific piece of equipment (partial-stock blocking, with quantity and reason)
- View, edit, and remove existing equipment blocks from a dedicated management modal

### Blocked dates (whole-day closures)
- Block entire days business-wide (e.g. holidays, days off), with an optional reason
- Blocking a day is rejected if an active (non-cancelled) reservation already exists on that date
- Edit or remove existing blocked days

### Clients
- Add, edit, delete client records (name, OIB, email, phone, address)
- Duplicate-OIB protection
- Phone number auto-formatting

### Public rental request form
- Client-facing, no login required
- Pulls live equipment availability and pricing from the database
- Validates against blocked dates and per-equipment blocks before submitting
- Auto-calculates a total price from selected equipment (server-side is the source of truth; admin can add delivery/shipping costs afterward)
- Submits directly into the reservations system with "Pending" status for admin follow-up

### Contracts
- Generates a filled rental contract (client details, equipment, dates, location, price) from a Word template
- Converts to PDF server-side and serves it as a download

## Project structure (relevant files)

```
back/
  main.py            FastAPI app: all routes
  database.py        takeFromBase / executeQuery helpers
  contract.py         Contract generation (docx + PDF)
  ugovor_template.docx  Word contract template

front/ (component names, not exact paths)
  admin.jsx                  Dashboard page
  reservationAdmin.jsx       Reservations page
  addReservation.jsx         Add reservation modal
  editReservation.jsx        Edit reservation modal
  equipmentCard.jsx          Equipment card (list item)
  editEquipment.jsx          Edit equipment modal
  blockEquipmentDate.jsx     Add equipment block modal
  manageBlockedEquipment.jsx View/edit/delete equipment blocks
  blockDate.jsx              Add blocked-date modal
  blockDateAdd.jsx           Blocked-date pill (list item)
  editBlockDate.jsx          Edit blocked-date modal
  rentRequest.jsx            Public rental request form
```

## API overview

**Auth**
- `POST /api/login`, `POST /api/logout`, `GET /api/me`

**Reservations** *(admin only)*
- `GET /api/reservations` — list + counts + monthly revenue
- `POST /api/reservations`, `PUT /api/reservations/{id}`, `DELETE /api/reservations/{id}`
- `GET /api/reservations/{id}/contract` — download PDF contract

**Equipment** *(admin only unless noted)*
- `GET /api/equipment` — list with computed real-time availability
- `POST /api/equipment`, `PUT /api/equipment/{id}`, `DELETE /api/equipment/{id}`
- `GET /api/equipment/catalog` — **public**, used by the rental request form

**Equipment blocks** *(admin only)*
- `GET /api/blocked-equipment`, `POST /api/blocked-equipment`, `PUT /api/blocked-equipment/{id}`, `DELETE /api/blocked-equipment/{id}`

**Blocked dates** *(admin only)*
- `GET /api/blocked-dates`, `POST /api/blocked-dates`, `PUT /api/blocked-dates/{id}`, `DELETE /api/blocked-dates/{id}`

**Clients** *(admin only)*
- `GET /api/clients`, `POST /api/clients`, `PUT /api/clients/{id}`, `DELETE /api/clients/{id}`

**Public** *(no auth required)*
- `GET /api/public/blocked-dates`
- `GET /api/public/blocked-equipment?equipment_id={id}`
- `POST /api/public/reservations` — submit a rental request

## Notes

- Public routes intentionally expose a reduced set of fields (e.g. no internal notes, no ability to set status or price directly).
- Pricing on the public form is always computed server-side from the equipment table, never trusted from the client.
- Contract generation requires LibreOffice (`soffice`) installed on the server for DOCX → PDF conversion.
