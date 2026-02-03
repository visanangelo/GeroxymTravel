# Optimistic UI – cum funcționează și cum e implementat

## Ideea

**Optimistic UI** = actualizezi interfața **înainte** de răspunsul de la server, ca și cum acțiunea ar fi reușit. Utilizatorul vede schimbarea imediat (fără așteptare). În background trimiți request-ul; dacă **reușește**, lași UI-ul așa; dacă **eșuează**, faci **revert** (revenire la starea anterioară) și afișezi eroare.

## Fluxul (pași)

1. **Salvezi starea anterioară** (sau ai o cale clară de revert).
2. **Aplici imediat în UI** schimbarea optimistă (ex: ștergi rândul, pui status „cancelled”).
3. **Trimiți request-ul la server** (async).
4. **La succes**: poți să lași UI-ul așa sau să refetch-uiești pentru sincronizare.
5. **La eroare** (în `catch` sau la `result.success === false`): **revert** – readuci datele la starea salvată și afișezi toast/eroare.

## Try/catch și erori

- **Da, folosim try/catch** (sau verificare `result.success`) ca să tratăm:
  - erori de rețea (throw în await),
  - erori de business (ex: serverul returnează `{ success: false, error: '...' }`).
- În **catch** și în ramura de **success === false** apelăm același **revert**: readucem în listă/state obiectul în starea anterioară.

Deci: **da** – acțiunea rulează în background, iar dacă ceva nu merge bine **revertim doar la UI** (la datele pe care le afișăm), plus mesaj de eroare.

## Unde e folosit în proiect

| Locus | Acțiune | Optimistic | Revert la eroare |
|-------|---------|------------|-------------------|
| Admin: poziție homepage | Setezi ruta pe poziția 1–6 | **Nu**: aștepți răspunsul serverului, apoi actualizezi listă + `router.refresh()` | La eroare: toast; nu se schimbă UI (nu am aplicat încă) |
| Admin: anulare rută | Cancel route | Da: marchezi ruta ca `cancelled` în listă | Da: refetch la eroare |
| Admin: ștergere rută | Delete route | Da: scoți rândul din listă imediat | Da: refetch la eroare |

**De ce poziția homepage nu e optimistă:** Dacă utilizatorul dă refresh imediat după click, pagina se reîncarcă cu datele de pe server; dacă request-ul nu s-a terminat încă, vede în continuare poziția veche. Pentru a evita această nepotrivire, pentru poziție așteptăm succesul de la server, apoi actualizăm UI-ul și apelăm `router.refresh()` – astfel la orice refresh ulterior se vede poziția corectă.

## Exemplu de cod (pattern)

```ts
// 1) Stare anterioară (sau o obții din state în momentul revert-ului)
const previousRoute = route

// 2) Optimistic update
onOptimisticUpdate(route)  // ex: setRoutes(prev => prev.map(r => r.id === route.id ? { ...r, status: 'cancelled' } : r))

// 3) Server
try {
  const result = await cancelRoute(route.id)
  if (!result.success) {
    onRevert(previousRoute)
    toast.error(result.error)
  }
} catch (err) {
  onRevert(previousRoute)
  toast.error(err.message)
}
```

Revert-ul = pui înapoi în state obiectul `previousRoute` (același rând, cu datele de dinainte).

## Rezumat

- **Background**: request-ul se face după ce UI-ul e deja actualizat.
- **Dacă nu merge**: nu „dai revert la server” – serverul nici nu a schimbat sau a refuzat. **Reversul se face doar în UI**: readuci în listă/state datele la starea anterioară și afișezi eroare.
- **Metoda recomandată**: try/catch + ramură pentru `result.success === false`, ambele duc la același **revert** + toast de eroare.

## Implementare în cod (Admin: anulare / ștergere)

- **Anulare (cancel)**  
  - Optimistic: pui în listă `status: 'cancelled'` pentru ruta respectivă.  
  - Revert: la eroare apelăm `onRevertCancel()` care face **refetch** listă – UI revine la starea de pe server.  
  - try/catch + `result.success === false` → ambele apelează `onRevertCancel()` + toast.

- **Ștergere (delete)**  
  - Optimistic: scoți rândul din listă și scazi `count` cu 1.  
  - Revert: la eroare apelăm `onRevertDelete()` = **refetch** listă – ruta reapare.  
  - try/catch + `result.success === false` → ambele apelează `onRevertDelete()` + toast.

Revert-ul e implementat prin refetch (nu prin snapshot local): mai simplu și garantează că UI = server după eroare.

---

## Dacă utilizatorul părăsește UI-ul înainte să se termine request-ul

**Situația:** Utilizatorul dă Cancel/Delete (optimistic update se aplică), apoi navighează altundeva sau închide tab-ul înainte ca request-ul să se termine.

**Ce se întâmplă:**

1. **Pe server** – Request-ul continuă să ruleze. Dacă reușește, baza de date e deja actualizată. Dacă eșuează, DB rămâne neschimbat. **Datele sunt consistente** indiferent de ce face clientul.

2. **Pe client** – Când promise-ul se rezolvă (success sau error), componenta/listă s-ar putea să fie deja **unmounted** (utilizatorul a plecat de pe pagină). Apelurile `onRevertCancel()`, `onActionSuccess()`, `setLoading(false)` etc. rulează pe un arbore care poate fi deja dezmontat → React poate afișa avertisment „Can't perform a React state update on an unmounted component”. Toast-ul de eroare ar apărea pe o pagină unde user-ul poate să nu mai fie.

**Ce facem în cod:** Folosim un ref **isMounted**: în `finally` / la succes / la eroare verificăm `if (isMounted.current)` înainte de a apela callback-uri sau `setState`. Astfel evităm actualizări de state după unmount și avertismentele React. Request-ul tot se finalizează pe server; doar nu mai „atingem” UI-ul dacă utilizatorul a plecat.
