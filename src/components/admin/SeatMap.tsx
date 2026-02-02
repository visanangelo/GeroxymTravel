'use client'

import { getBusLayout, getSeatLabel } from '@/lib/bus-layout'

type Seat = {
  seat_no: number
  pool: 'online' | 'offline'
  assigned: boolean
}

type Props = {
  seats: Seat[]
  totalCapacity: number
}

export default function SeatMap({ seats, totalCapacity }: Props) {
  const seatMap = new Map<number, Seat>()
  seats.forEach((seat) => {
    seatMap.set(seat.seat_no, seat)
  })

  const getSeatData = (seatNo: number): Seat | null => seatMap.get(seatNo) ?? null
  const layout = getBusLayout(totalCapacity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-100 dark:bg-green-900" />
          <span className="text-sm">Disponibil (Online)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-orange-500 bg-orange-100 dark:bg-orange-900" />
          <span className="text-sm">Rezervat offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-300 dark:bg-gray-700" />
          <span className="text-sm">Ocupat</span>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">🚌 Față</span>
          </div>
        </div>

        {layout ? (
          <div className="space-y-2 flex flex-col items-center">
            {layout.map((row) => (
              <div
                key={row.rowIndex}
                className={`flex items-center justify-center gap-2 min-h-[2.5rem] w-full ${row.kind === 'back' ? 'max-w-[18rem]' : 'max-w-[15rem]'}`}
              >
                {row.kind === 'full' ? (
                  <>
                    <div className="flex gap-1 min-w-[5.75rem] w-[5.75rem]">
                      {row.seatNos.slice(0, 2).map((seatNo) => (
                        <SeatButton
                          key={seatNo}
                          seatNo={seatNo}
                          seat={getSeatData(seatNo)}
                          label={getSeatLabel(seatNo, totalCapacity)}
                        />
                      ))}
                    </div>
                    <div className="w-8 shrink-0 border-l-2 border-dashed border-muted-foreground/30 min-h-[2.5rem]" />
                    <div className="flex gap-1 min-w-[5.75rem] w-[5.75rem] justify-end">
                      {row.seatNos.slice(2, 4).map((seatNo) => (
                        <SeatButton
                          key={seatNo}
                          seatNo={seatNo}
                          seat={getSeatData(seatNo)}
                          label={getSeatLabel(seatNo, totalCapacity)}
                        />
                      ))}
                    </div>
                  </>
                ) : row.kind === 'left_only' ? (
                  <>
                    <div className="flex gap-1 min-w-[5.75rem] w-[5.75rem]">
                      {row.seatNos.map((seatNo) => (
                        <SeatButton
                          key={seatNo}
                          seatNo={seatNo}
                          seat={getSeatData(seatNo)}
                          label={getSeatLabel(seatNo, totalCapacity)}
                        />
                      ))}
                    </div>
                    <div className="w-[8.25rem] h-10 flex items-center justify-center rounded border border-dashed border-muted-foreground/40 bg-muted/20 shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">Ieșire</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-center">
                    <div className="flex gap-1 shrink-0">
                      {row.seatNos.map((seatNo) => (
                        <SeatButton
                          key={seatNo}
                          seatNo={seatNo}
                          seat={getSeatData(seatNo)}
                          label={getSeatLabel(seatNo, totalCapacity)}
                        />
                      ))}
                    </div>

                  </div>
                  
                )}
              </div>
            ))}
          </div>
        ) : (
          <GenericLayout
            seats={seats}
            totalCapacity={totalCapacity}
            getSeatData={getSeatData}
          />
        )}

        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">Spate 🚌</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Layout generic (2+2 per rând) pentru rute cu capacitate diferită de BUS_TOTAL_SEATS */
function GenericLayout({
  seats,
  totalCapacity,
  getSeatData,
}: {
  seats: Seat[]
  totalCapacity: number
  getSeatData: (n: number) => Seat | null
}) {
  const seatsPerRow = 4
  const rows = Math.ceil(totalCapacity / seatsPerRow)
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const left1 = rowIndex * seatsPerRow + 1
        const left2 = rowIndex * seatsPerRow + 2
        const right1 = rowIndex * seatsPerRow + 3
        const right2 = rowIndex * seatsPerRow + 4
        return (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-2"
          >
            <div className="flex gap-1">
              {left1 <= totalCapacity && (
                <SeatButton
                  seatNo={left1}
                  seat={getSeatData(left1)}
                  label={String(left1)}
                />
              )}
              {left2 <= totalCapacity && (
                <SeatButton
                  seatNo={left2}
                  seat={getSeatData(left2)}
                  label={String(left2)}
                />
              )}
            </div>
            <div className="w-8 border-l-2 border-dashed border-muted-foreground/30 mx-2" />
            <div className="flex gap-1">
              {right1 <= totalCapacity && (
                <SeatButton
                  seatNo={right1}
                  seat={getSeatData(right1)}
                  label={String(right1)}
                />
              )}
              {right2 <= totalCapacity && (
                <SeatButton
                  seatNo={right2}
                  seat={getSeatData(right2)}
                  label={String(right2)}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SeatButton({
  seatNo,
  seat,
  label,
}: {
  seatNo: number
  seat: Seat | null
  label: string
}) {
  if (!seat) {
    return (
      <div className="w-11 h-10 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
        {label}
      </div>
    )
  }

  const isOffline = seat.pool === 'offline'
  const isOccupied = seat.assigned

  let className =
    'w-11 min-w-[2.75rem] h-10 rounded border-2 flex items-center justify-center text-xs font-medium transition-all'

  if (isOccupied) {
    className +=
      ' border-gray-500 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
  } else if (isOffline) {
    className +=
      ' border-orange-500 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
  } else {
    className +=
      ' border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  }

  return (
    <div
      className={className}
      title={
        isOccupied ? 'Ocupat' : isOffline ? 'Rezervat offline' : 'Disponibil (Online)'
      }
    >
      {label}
    </div>
  )
}
