import os
import datetime
from datetime import date, timedelta
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
from database import takeFromBase, executeQuery
from fastapi import FastAPI, HTTPException, Response, Cookie, Depends
from jose import JWTError, jwt
from typing import Optional
import re
from typing import List
from fastapi.responses import StreamingResponse
from contract import generate_contract
import unicodedata
from contract import generate_contract_pdf

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
IS_PROD = os.getenv("ENVIRONMENT") == "production"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def slugify_filename(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return ascii_text.replace(" ", "_")

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class ReservationModel(BaseModel):
    client_name: str
    oib: Optional[str] = None
    equipment: str
    event_date: datetime.date
    location: Optional[str] = None
    amount: Optional[float] = None
    status: str = "Na čekanju"

class EquipmentModel(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: int
    total_quantity: int
    available_quantity: int

class Client(BaseModel):
    full_name: str
    oib: str
    email: EmailStr
    phone: str
    address: str

class BlockedEquipment(BaseModel):
    equipment_id: int
    start_date: date
    end_date: date
    quantity: int
    reason: Optional[str] = None

class BlockedDates(BaseModel):
    dates: List[str]
    reason: Optional[str] = None

class PublicReservationModel(BaseModel):
    client_name: str
    oib: Optional[str] = None
    equipment: str
    equipment_ids: List[int]
    event_date: datetime.date
    location: Optional[str] = None

class BlockedDateSingle(BaseModel):
    date: str
    reason: Optional[str] = None

def format_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("385"):
        digits = digits[3:]
    elif digits.startswith("0"):
        digits = digits[1:]
    return f"+385 {digits[:2]} {digits[2:5]} {digits[5:]}"

def create_access_token(admin_id: int, email: str, name: str = None):
    expire = datetime.datetime.utcnow() + timedelta(hours=24)
    payload = {"sub": str(admin_id), "email": email, "name": name, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Niste prijavljeni")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Nevaljani token")

@app.post("/api/login")
def login(login_data:LoginModel, response: Response):
    admin = takeFromBase("SELECT * FROM admins WHERE email = %s;", (login_data.email,))

    if not admin or not pwd_context.verify(login_data.password, admin[0]["hashed_password"]):
        raise HTTPException(status_code=401, detail="Neispravan mail ili lozinka")

    token = create_access_token(admin_id=admin[0]["id"], email=admin[0]["email"], name=admin[0]["name"])

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=60 * 60 * 24
    )

    return {"message":"Uspješa prijava"}

@app.get("/api/me")
def get_me(current_admin: dict = Depends(get_current_admin)):
    return {"email": current_admin.get("email"), "name": current_admin.get("name")}

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Odjava uspješna"}

# Rezervacije

@app.get("/api/reservations")
def get_reservations(current_admin: dict = Depends(get_current_admin)):
    reservations = takeFromBase("SELECT * FROM reservations ORDER BY event_date ASC;")
    pending = takeFromBase("SELECT COUNT(*) FROM reservations WHERE status = 'Na čekanju';")
    confirmed = takeFromBase("SELECT COUNT(*) FROM reservations WHERE status = 'Potvrđeno';")
    cancelled = takeFromBase("SELECT COUNT(*) FROM reservations WHERE status = 'Otkazano' AND created_at >= NOW() - INTERVAL '30 days';")
    monthly_revenue = takeFromBase("SELECT SUM(amount) AS revenue FROM reservations  WHERE status = 'Potvrđeno' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);")
    return {
        "data": reservations,
        "pending": pending[0]["count"],
        "confirmed": confirmed[0]["count"],
        "cancelled": cancelled[0]["count"],
        "revenue": monthly_revenue[0]["revenue"]
    }

@app.post("/api/reservations")
def add_reservation(reservation: ReservationModel, current_admin: dict = Depends(get_current_admin)):
    if reservation.oib:
        existing_client = takeFromBase("SELECT id FROM clients WHERE oib = %s;", (reservation.oib,))
        if not existing_client:
            executeQuery(
                "INSERT INTO clients (full_name, oib) VALUES (%s, %s);",
                (reservation.client_name, reservation.oib)
            )

    success = executeQuery(
        "INSERT INTO reservations (client_name, oib, equipment, event_date, location, amount, status) VALUES (%s, %s, %s, %s, %s, %s, %s);",
        (reservation.client_name, reservation.oib, reservation.equipment, reservation.event_date, reservation.location, reservation.amount, reservation.status)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Dodavanje rezervacije nije uspjelo")
    return {"message": "Rezervacija dodana"}

@app.put("/api/reservations/{id}")
def update_reservation(id: int, reservation: ReservationModel, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery(
        "UPDATE reservations SET client_name = %s, oib = %s, equipment = %s, event_date = %s, location = %s, amount = %s, status = %s WHERE id = %s;",
        (reservation.client_name, reservation.oib, reservation.equipment, reservation.event_date, reservation.location, reservation.amount, reservation.status, id)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Ažuriranje rezervacije nije uspjelo")
    return {"message": "Rezervacija ažurirana"}


@app.delete("/api/reservations/{id}")
def delete_reservation(id: int, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery("DELETE FROM reservations WHERE id = %s;", (id,))
    if not success:
        raise HTTPException(status_code=500, detail="Brisanje rezervacije nije uspjelo")
    return {"message": "Rezervacija obrisana"}

# Oprema

@app.post("/api/equipment")
def add_equipment(equipment: EquipmentModel, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery(
        "INSERT INTO equipment (name, category, price, total_quantity, available_quantity, description) VALUES (%s, %s, %s, %s, %s, %s);",
        (equipment.name, equipment.category, equipment.price, equipment.total_quantity, equipment.available_quantity, equipment.description)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Dodavanje opreme nije uspjelo")
    return {"message": "Oprema dodana"}

@app.put("/api/equipment/{id}")
def edit_equipment(id: int, equipment: EquipmentModel, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery(
        "UPDATE equipment SET name = %s, category = %s, price = %s, total_quantity = %s, available_quantity = %s, description = %sWHERE id = %s;",
        (equipment.name, equipment.category, equipment.price, equipment.total_quantity, equipment.available_quantity, equipment.description, id)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Uređivanje podataka o opremi nije uspjelo.")
    return {"message": "Oprema uspješno uređena."}

@app.get("/api/equipment")
def get_equipment(current_admin: dict = Depends(get_current_admin)):
    equipment = takeFromBase(
        """
        SELECT e.*,
            CASE
                WHEN EXISTS (SELECT 1 FROM blocked_dates WHERE date = CURRENT_DATE) THEN 0
                ELSE GREATEST(e.available_quantity - COALESCE(SUM(CASE WHEN b.start_date <= CURRENT_DATE AND b.end_date >= CURRENT_DATE THEN b.quantity ELSE 0 END), 0), 0)
            END AS real_available,
            COUNT(CASE WHEN b.end_date >= CURRENT_DATE THEN b.id END) AS active_blocks_count,
            (SELECT string_agg(to_char(nb.start_date, 'DD.MM.') || '–' || to_char(nb.end_date, 'DD.MM.'), ', ' ORDER BY nb.start_date ASC)
                FROM equipment_blocks nb
                WHERE nb.equipment_id = e.id
                AND nb.end_date >= CURRENT_DATE
                AND nb.start_date <= CURRENT_DATE + INTERVAL '30 days'
            ) AS blocked_ranges
        FROM equipment e
        LEFT JOIN equipment_blocks b ON b.equipment_id = e.id
        GROUP BY e.id
        ORDER BY e.id ASC;
        """
    )
    equipment_quantity = takeFromBase("SELECT COUNT(*) FROM equipment;")
    categories = takeFromBase("SELECT DISTINCT category FROM equipment;")
    return {
        "equipment": equipment,
        "quantity": equipment_quantity[0]["count"],
        "categories": [c["category"] for c in categories]
    }

@app.get("/api/equipment/catalog")
def get_equipment_catalog():
    equipment = takeFromBase(
        """
        SELECT e.*,
            CASE
                WHEN EXISTS (SELECT 1 FROM blocked_dates WHERE date = CURRENT_DATE) THEN 0
                ELSE GREATEST(e.available_quantity - COALESCE(SUM(CASE WHEN b.start_date <= CURRENT_DATE AND b.end_date >= CURRENT_DATE THEN b.quantity ELSE 0 END), 0), 0)
            END AS real_available
        FROM equipment e
        LEFT JOIN equipment_blocks b ON b.equipment_id = e.id
        GROUP BY e.id
        ORDER BY e.id ASC;
        """
    )
    return {
        "equipment": equipment,
    }

# Javni zahtjevi (bez prijave admina - koristi ih javni obrazac za rezervaciju)

@app.get("/api/public/blocked-dates")
def get_public_blocked_dates():
    data = takeFromBase("SELECT date FROM blocked_dates WHERE date >= CURRENT_DATE ORDER BY date ASC;")
    return {"data": data}


@app.get("/api/public/blocked-equipment")
def get_public_blocked_equipment(equipment_id: int):
    data = takeFromBase(
        "SELECT start_date, end_date FROM equipment_blocks WHERE equipment_id = %s AND end_date >= CURRENT_DATE ORDER BY start_date ASC;",
        (equipment_id,)
    )
    return {"data": data}

@app.post("/api/public/reservations")
def add_public_reservation(reservation: PublicReservationModel):
    if reservation.oib:
        existing_client = takeFromBase("SELECT id FROM clients WHERE oib = %s;", (reservation.oib,))
        if not existing_client:
            executeQuery(
                "INSERT INTO clients (full_name, oib) VALUES (%s, %s);",
                (reservation.client_name, reservation.oib)
            )

    price_rows = takeFromBase(
        "SELECT COALESCE(SUM(price), 0) AS total FROM equipment WHERE id = ANY(%s);",
        (reservation.equipment_ids,)
    )
    amount = price_rows[0]["total"]

    success = executeQuery(
        "INSERT INTO reservations (client_name, oib, equipment, event_date, location, amount, status) VALUES (%s, %s, %s, %s, %s, %s, %s);",
        (reservation.client_name, reservation.oib, reservation.equipment, reservation.event_date, reservation.location, amount, "Na čekanju")
    )
    if not success:
        raise HTTPException(status_code=500, detail="Slanje zahtjeva nije uspjelo")
    return {"message": "Zahtjev poslan"}

@app.delete("/api/equipment/{id}")
def delete_equipment(id: int, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery("DELETE FROM equipment WHERE id = %s;",(id,))
    if not success:
        raise HTTPException(status_code=500, detail="Brisanje proizvoda iz baze nije uspjelo")
    return {"message": "Oprema obrisana."}

# Klijenti

@app.post("/api/clients")
def add_client(client: Client, current_admin: dict = Depends(get_current_admin)):
    existing = takeFromBase("SELECT id FROM clients WHERE oib = %s;", (client.oib,))
    if existing:
        raise HTTPException(status_code=400, detail="Klijent s tim OIB-om već postoji.")
    formatted_phone = format_phone(client.phone)
    success = executeQuery(
        "INSERT INTO clients (full_name, oib, email, phone, address) VALUES (%s, %s, %s, %s, %s);",
        (client.full_name, client.oib, client.email, formatted_phone, client.address)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Dodavanje klijenta nije uspjelo")
    return {"message": "Klijent dodan"}

@app.get("/api/clients")
def get_clients(current_admin: dict = Depends(get_current_admin)):
    clients = takeFromBase("SELECT * FROM clients ORDER BY id ASC;")
    clients_quantity = takeFromBase("SELECT COUNT(*) FROM clients;")
    new_last_30_days = takeFromBase("SELECT COUNT(*) FROM clients WHERE created_at >= NOW() - INTERVAL '30 days';")
    return {
        "data": clients,
        "quantity": clients_quantity[0]["count"],
        "new_this_month": new_last_30_days[0]["count"]
    }

@app.delete("/api/clients/{id}")
def delete_client(id: int, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery("DELETE FROM clients WHERE id = %s;", (id,))
    if not success:
        raise HTTPException(status_code=500, detail="Brisanje klijenta iz baze nije uspjelo")
    return {"message": "Klijent obrisan."}

@app.put("/api/clients/{id}")
def update_client(id: int, client: Client, current_admin: dict = Depends(get_current_admin)):
    existing = takeFromBase("SELECT id FROM clients WHERE oib = %s AND id != %s;", (client.oib, id))
    if existing:
        raise HTTPException(status_code=400, detail="Klijent s tim OIB-om već postoji.")

    formatted_phone = format_phone(client.phone)
    success = executeQuery(
        "UPDATE clients SET full_name = %s, oib = %s, email = %s, phone = %s, address = %s WHERE id = %s;",
        (client.full_name, client.oib, client.email, formatted_phone, client.address, id)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Ažuriranje klijenta nije uspjelo")
    return {"message": "Klijent ažuriran"}

# Blocked Equipment

@app.put("/api/blocked-equipment/{id}")
def put_blocked_equipment(id: int, blockedEquipmentData: BlockedEquipment, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery (
        "UPDATE equipment_blocks SET equipment_id = %s, start_date = %s, end_date = %s, quantity = %s, reason = %s WHERE id = %s;",
        (blockedEquipmentData.equipment_id, blockedEquipmentData.start_date, blockedEquipmentData.end_date, blockedEquipmentData.quantity, blockedEquipmentData.reason, id)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Uređivanje blokiranih datuma nije uspjelo")
    return {"message": "Uspješno ste uredili blokirani datum."}

@app.delete("/api/blocked-equipment/{id}")
def delete_blocked_equipment(id: int, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery("DELETE FROM equipment_blocks WHERE id = %s;", (id,))
    if not success:
        raise HTTPException(status_code=500, detail="Neuspješno brisanje blokiranih datuma")
    return {"message": "Uspješno ste obrisali podatke o blokiranim datumima"}

@app.get("/api/blocked-equipment")
def get_blocked_equipment(equipment_id: int, current_admin: dict = Depends(get_current_admin)):
    data = takeFromBase(
        "SELECT * FROM equipment_blocks WHERE equipment_id = %s AND end_date >= CURRENT_DATE ORDER BY start_date ASC;",
        (equipment_id,)
    )
    return {"data": data}

@app.post("/api/blocked-equipment")
def post_blocked_equipment(blockedEquipmentData: BlockedEquipment, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery (
        "INSERT INTO equipment_blocks (equipment_id, start_date, end_date, quantity, reason) VALUES (%s, %s, %s, %s, %s);",
        (blockedEquipmentData.equipment_id, blockedEquipmentData.start_date, blockedEquipmentData.end_date, blockedEquipmentData.quantity, blockedEquipmentData.reason)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Dodavanje blokade na određeni datum nije uspjelo")
    return {"message": "Uspješno dodana blokada datuma."}

# Blokirani datumi

@app.post("/api/blocked-dates")
def post_blocked_dates(blockedDatesData: BlockedDates, current_admin: dict = Depends(get_current_admin)):
    for d in blockedDatesData.dates:
        existing_reservation = takeFromBase(
            "SELECT id FROM reservations WHERE event_date = %s AND status != 'Otkazano';",
            (d,)
        )
        if existing_reservation:
            formatted_date = datetime.datetime.strptime(d, "%Y-%m-%d").strftime("%d.%m.%Y.")
            raise HTTPException(
                status_code=400,
                detail=f"Ne možeš blokirati {formatted_date} jer za taj dan već postoji rezervacija."
            )

    for d in blockedDatesData.dates:
        executeQuery(
            "INSERT INTO blocked_dates (date, reason) VALUES (%s, %s) ON CONFLICT (date) DO NOTHING;",
            (d, blockedDatesData.reason)
        )
    return {"message": f"{len(blockedDatesData.dates)} dana blokirano."}


@app.get("/api/blocked-dates")
def get_blocked_dates(current_admin: dict = Depends(get_current_admin)):
    data = takeFromBase("SELECT * FROM blocked_dates WHERE date >= CURRENT_DATE ORDER BY date ASC;")
    return {"data": data}


@app.delete("/api/blocked-dates/{id}")
def delete_blocked_date(id: int, current_admin: dict = Depends(get_current_admin)):
    success = executeQuery("DELETE FROM blocked_dates WHERE id = %s;", (id,))
    if not success:
        raise HTTPException(status_code=500, detail="Brisanje blokiranog dana nije uspjelo")
    return {"message": "Uspješno obrisan blokirani dan."}

# Dokumenti

@app.get("/api/reservations/{reservation_id}/contract")
def get_contract(reservation_id: int, admin: str = Depends(get_current_admin)):
    rows = takeFromBase(
        "SELECT client_name, oib, equipment, event_date, location, amount FROM reservations WHERE id = %s",
        (reservation_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Rezervacija nije pronađena")
    reservation = rows[0]

    client_rows = takeFromBase("SELECT address, phone FROM clients WHERE oib = %s", (reservation["oib"],))
    client = client_rows[0] if client_rows else None

    buffer = generate_contract_pdf(reservation, client)
    filename = f"Ugovor_{slugify_filename(reservation['client_name'])}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.put("/api/blocked-dates/{id}")
def put_blocked_date(id: int, blockedDateData: BlockedDateSingle, current_admin: dict = Depends(get_current_admin)):
    existing_reservation = takeFromBase(
        "SELECT id FROM reservations WHERE event_date = %s AND status != 'Otkazano';",
        (blockedDateData.date,)
    )
    if existing_reservation:
        formatted_date = datetime.datetime.strptime(blockedDateData.date, "%Y-%m-%d").strftime("%d.%m.%Y.")
        raise HTTPException(
            status_code=400,
            detail=f"Ne možeš postaviti blokadu na {formatted_date} jer za taj dan već postoji rezervacija."
        )

    success = executeQuery(
        "UPDATE blocked_dates SET date = %s, reason = %s WHERE id = %s;",
        (blockedDateData.date, blockedDateData.reason, id)
    )
    if not success:
        raise HTTPException(status_code=500, detail="Ažuriranje blokiranog dana nije uspjelo")
    return {"message": "Blokirani dan ažuriran."}