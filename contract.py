"""
Generiranje ugovora o najmu iz Word predloška (ugovor_template.docx).

Ova funkcija se poziva ISKLJUČIVO iz reservations rute u main.py.
Ne sadrži nikakvu logiku baze podataka - samo puni predložak podacima
koje joj proslijedi poziva.

Za PDF konverziju je potreban LibreOffice (naredba `soffice` mora biti
dostupna u terminalu). Na Macu: brew install --cask libreoffice.
Na Linux VPS-u (kasnije, produkcija): apt install libreoffice.
"""

import os
import subprocess
import tempfile
from datetime import date
from io import BytesIO
from typing import Optional
from docxtpl import DocxTemplate

TEMPLATE_PATH = "ugovor_template.docx"  # mora biti u istom folderu kao main.py


def _build_docx(reservation: dict, client: Optional[dict]) -> DocxTemplate:
    """
    reservation: {"client_name", "oib", "equipment", "event_date", "location", "amount"}
    client: {"address", "phone"} ili None ako klijent nije pronađen u bazi
    """
    doc = DocxTemplate(TEMPLATE_PATH)

    context = {
        "client_name": reservation["client_name"],
        "client_oib": reservation["oib"],
        "client_address": client["address"] if client else "",
        "client_phone": client["phone"] if client else "",
        "contract_date": date.today().strftime("%d.%m.%Y."),
        "equipment": reservation["equipment"],
        "rental_start_date": reservation["event_date"].strftime("%d.%m.%Y."),
        "location": reservation["location"],
        "price": f"{reservation['amount']:.2f} EUR",
    }

    doc.render(context)
    return doc


def generate_contract(reservation: dict, client: Optional[dict]) -> BytesIO:
    """Vraća BytesIO s popunjenim .docx ugovorom."""
    doc = _build_docx(reservation, client)

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def generate_contract_pdf(reservation: dict, client: Optional[dict]) -> BytesIO:
    """Vraća BytesIO s popunjenim ugovorom konvertiranim u PDF."""
    doc = _build_docx(reservation, client)

    with tempfile.TemporaryDirectory() as tmpdir:
        docx_path = os.path.join(tmpdir, "ugovor.docx")
        doc.save(docx_path)

        result = subprocess.run(
            ["soffice", "--headless", "--convert-to", "pdf", "--outdir", tmpdir, docx_path],
            capture_output=True,
            timeout=30,
        )
        if result.returncode != 0:
            raise RuntimeError(f"Konverzija u PDF nije uspjela: {result.stderr.decode(errors='ignore')}")

        pdf_path = os.path.join(tmpdir, "ugovor.pdf")
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

    buffer = BytesIO(pdf_bytes)
    buffer.seek(0)
    return buffer
