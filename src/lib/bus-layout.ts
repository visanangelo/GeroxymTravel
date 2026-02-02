/**
 * Layout autocar: 12 rânduri (2 banchete stânga + 2 dreapta), rând 6 fără dreapta (gol/ieșire),
 * rând 13 (bancheta spate) = 5 locuri.
 * Primul rând (4 locuri) = rezervat offline.
 */

export const BUS_TOTAL_SEATS = 51
export const BUS_OFFLINE_RESERVE = 4 // primul rând = 4 locuri offline

/** Structură per rând pentru randare */
export type BusRowKind =
  | 'full'      // 2 stânga + 2 dreapta (4 locuri)
  | 'left_only' // doar 2 stânga (dreapta = gol/ieșire)
  | 'back'      // rând 13: 5 locuri

export type BusRowDef = {
  rowIndex: number // 1..13
  kind: BusRowKind
  /** seat_no-uri în ordine: [stânga1, stânga2, dreapta1?, dreapta2?] sau [1..5] pentru back */
  seatNos: number[]
}

/** Definiția completă a layout-ului (seat_no 1..51) */
const LAYOUT: BusRowDef[] = [
  { rowIndex: 1, kind: 'full', seatNos: [1, 2, 3, 4] },
  { rowIndex: 2, kind: 'full', seatNos: [5, 6, 7, 8] },
  { rowIndex: 3, kind: 'full', seatNos: [9, 10, 11, 12] },
  { rowIndex: 4, kind: 'full', seatNos: [13, 14, 15, 16] },
  { rowIndex: 5, kind: 'full', seatNos: [17, 18, 19, 20] },
  { rowIndex: 6, kind: 'left_only', seatNos: [21, 22] },
  { rowIndex: 7, kind: 'full', seatNos: [23, 24, 25, 26] },
  { rowIndex: 8, kind: 'full', seatNos: [27, 28, 29, 30] },
  { rowIndex: 9, kind: 'full', seatNos: [31, 32, 33, 34] },
  { rowIndex: 10, kind: 'full', seatNos: [35, 36, 37, 38] },
  { rowIndex: 11, kind: 'full', seatNos: [39, 40, 41, 42] },
  { rowIndex: 12, kind: 'full', seatNos: [43, 44, 45, 46] },
  { rowIndex: 13, kind: 'back', seatNos: [47, 48, 49, 50, 51] },
]

/** Mapare seat_no (1..49) -> etichetă afișabilă */
const SEAT_LABELS: Record<number, string> = (() => {
  const map: Record<number, string> = {}
  for (const row of LAYOUT) {
    if (row.kind === 'full') {
      map[row.seatNos[0]] = `B${row.rowIndex}S1`
      map[row.seatNos[1]] = `B${row.rowIndex}S2`
      map[row.seatNos[2]] = `B${row.rowIndex}D1`
      map[row.seatNos[3]] = `B${row.rowIndex}D2`
    } else if (row.kind === 'left_only') {
      map[row.seatNos[0]] = `B${row.rowIndex}S1`
      map[row.seatNos[1]] = `B${row.rowIndex}S2`
    } else {
      row.seatNos.forEach((no, i) => {
        map[no] = `B13-${i + 1}`
      })
    }
  }
  return map
})()

/** Etichetă pentru loc (ex: B2S1, B13-1). Pentru alte capacități returnează "Loc {seat_no}". */
export function getSeatLabel(seatNo: number, totalCapacity: number = BUS_TOTAL_SEATS): string {
  if (totalCapacity === BUS_TOTAL_SEATS && seatNo >= 1 && seatNo <= BUS_TOTAL_SEATS) {
    return SEAT_LABELS[seatNo] ?? `Loc ${seatNo}`
  }
  return `Loc ${seatNo}`
}

/** Layout pentru randare (doar dacă capacitatea e cea a autocarului standard) */
export function getBusLayout(totalCapacity: number = BUS_TOTAL_SEATS): BusRowDef[] | null {
  if (totalCapacity !== BUS_TOTAL_SEATS) return null
  return LAYOUT
}
