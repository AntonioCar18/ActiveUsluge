# Active usluge

Web aplikacija za iznajmljivanje opreme za partye. Javna stranica omogućuje pregled kataloga opreme (zvučnici, mikrofoni, šatori, rasvjeta, namještaj, dekoracija...) s detaljima i cijenom po danu, dok je administracijsko sučelje predviđeno za upravljanje ponudom i rezervacijama.

## Tech stack

- React + Vite
- Tailwind CSS
- [lucide-react](https://lucide.dev/) — ikone

## Status

Trenutno bez backenda i baze podataka — oprema se ručno unosi kao statični podatak u kodu. Baza i admin panel dolaze kad ponuda naraste.

## Struktura komponenti

- `Header` — navigacija i logo
- `Hero` — naslovna sekcija s CTA gumbima
- `Catalog` — filtriranje po kategorijama i prikaz opreme
- `ProductInfo` — modal s detaljima i cijenom pojedinog artikla

## Pokretanje lokalno
