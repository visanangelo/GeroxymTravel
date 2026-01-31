# Propunere: Acțiuni Admin pentru Management Ticket-uri

## 📋 Acțiuni Esențiale (Recomandate)

### 1. **Cancel Ticket** ✅ PRIORITATE ÎNALTĂ
- **Funcționalitate**: Anulare bilet (status: 'paid' → 'cancelled')
- **Când se folosește**:
  - Cerere client pentru anulare
  - Eroare în procesarea comenzii
  - Refund necesar
  - Probleme tehnice
- **Impact**: Locul devine disponibil din nou pentru rezervare
- **Implementare**: Server action care updatează status + opțional update order status

### 2. **Change Seat** ✅ PRIORITATE ÎNALTĂ
- **Funcționalitate**: Schimbare loc (modifică seat_no)
- **Când se folosește**:
  - Cerere client pentru alt loc
  - Eroare în alocare automată
  - Preferințe clienți (fereastră vs coridor)
  - Reorganizare grupuri
- **Impact**: Flexibilitate și satisfacerea clienților
- **Implementare**: Dialog cu dropdown pentru locuri disponibile + validare + update

### 3. **View Ticket Details** ✅ PRIORITATE MEDIE
- **Funcționalitate**: Pagină de detalii complete pentru un ticket
- **Când se folosește**:
  - Verificare informații complete
  - Audit/debugging
  - Support client
- **Impact**: Transparență și informații complete
- **Implementare**: Pagină nouă `/[locale]/admin/tickets/[id]/page.tsx`

---

## 🔧 Acțiuni Opționale (Mai Avansate)

### 4. **Reactivate Ticket** (Opțional)
- **Funcționalitate**: Reactivare bilet anulat (status: 'cancelled' → 'paid')
- **Când se folosește**: Anulare accidentală, reactivare cerere client
- **Impact**: Corectare erori

### 5. **Bulk Actions** (Opțional, Avansat)
- **Funcționalitate**: Acțiuni în masă (cancel multiple, export CSV)
- **Când se folosește**: Gestionare multe ticket-uri simultan
- **Impact**: Eficiență pentru admin

### 6. **Transfer Ticket** (Opțional, Avansat)
- **Funcționalitate**: Transfer bilet către alt order/customer
- **Când se folosește**: Transfer între persoane, reorganizare
- **Impact**: Flexibilitate maximă

### 7. **Print/Export Ticket** (Opțional)
- **Funcționalitate**: Export PDF/Print pentru verificare
- **Când se folosește**: Verificare la plecare, documentare
- **Impact**: Utilitate pentru staff

---

## 🎯 Recomandare Implementare

**Faza 1 (Esențial - Implementează acum)**:
1. ✅ Cancel Ticket
2. ✅ Change Seat
3. ✅ View Ticket Details

**Faza 2 (Opțional - Mai târziu)**:
4. Reactivate Ticket
5. Print/Export

**Faza 3 (Avansat - Future)**:
6. Bulk Actions
7. Transfer Ticket

---

## 📝 Structură Implementare Propusă

### Fișiere de creat/modificat:

1. **`src/app/[locale]/admin/tickets/actions.ts`** (NOU)
   - `cancelTicket(ticketId)`
   - `changeSeat(ticketId, newSeatNo)`
   - `reactivateTicket(ticketId)` (opțional)

2. **`src/app/[locale]/admin/tickets/[id]/page.tsx`** (NOU)
   - Pagină detalii ticket complet

3. **`src/app/[locale]/admin/tickets/page.tsx`** (MODIFICAT)
   - Adăugare dropdown acțiuni pentru fiecare ticket
   - Integrare server actions

4. **`src/components/admin/ChangeSeatDialog.tsx`** (NOU)
   - Dialog pentru schimbare loc
   - Dropdown cu locuri disponibile
   - Validare și confirmare

---

## 🔒 Securitate & Validări

### Cancel Ticket:
- ✅ Verificare că ticket există și este 'paid'
- ✅ Verificare că admin este autentificat
- ✅ Opțional: confirmare dialog (destructiv)
- ✅ Update automat order status dacă toate ticket-urile sunt cancelled

### Change Seat:
- ✅ Verificare că noul loc este disponibil (nu există ticket 'paid' pentru acel loc)
- ✅ Verificare că locul este în același route
- ✅ Validare că locul face parte din pool-ul corect (online/offline)
- ✅ Confirmare dialog

### Reactivate Ticket:
- ✅ Verificare că locul este încă disponibil
- ✅ Verificare că order este valid
- ✅ Validare status order

---

## 💡 UI/UX Recomandări

1. **Dropdown Actions** în tabel (similar cu routes page)
   - Icon-uri clare (X pentru cancel, Swap pentru change seat, Eye pentru view)
   - Confirmation dialogs pentru acțiuni destructice
   - Toast notifications pentru feedback

2. **Change Seat Dialog**:
   - Listă locuri disponibile (filtrare după route)
   - Vizualizare seat map (opțional, dar util)
   - Preview: "Locul X → Locul Y"

3. **Ticket Details Page**:
   - Card cu toate informațiile
   - Istoric acțiuni (dacă adăugăm audit log)
   - Quick actions (cancel, change seat)

---

## 🚀 Next Steps

1. Confirmă acțiunile pe care vrei să le implementăm
2. Implementăm Faza 1 (Cancel, Change Seat, View Details)
3. Testăm și iterăm
4. Opțional: Adăugăm Faza 2 și 3

