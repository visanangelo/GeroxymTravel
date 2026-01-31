'use client'

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
  // Create a map of seat_no to seat data
  const seatMap = new Map<number, Seat>()
  seats.forEach((seat) => {
    seatMap.set(seat.seat_no, seat)
  })

  // Calculate rows (2+2 layout: 2 left, aisle, 2 right = 4 seats per row)
  const seatsPerRow = 4
  const rows = Math.ceil(totalCapacity / seatsPerRow)

  const getSeatData = (seatNo: number): Seat | null => {
    return seatMap.get(seatNo) || null
  }

  const getSeatPosition = (seatNo: number): {
    row: number
    position: 'left1' | 'left2' | 'right1' | 'right2'
  } => {
    const zeroIndexed = seatNo - 1
    const row = Math.floor(zeroIndexed / seatsPerRow)
    const positionInRow = zeroIndexed % seatsPerRow

    const positions: Array<'left1' | 'left2' | 'right1' | 'right2'> = [
      'left1',
      'left2',
      'right1',
      'right2',
    ]

    return {
      row,
      position: positions[positionInRow],
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-100 dark:bg-green-900" />
          <span className="text-sm">Available (Online)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-orange-500 bg-orange-100 dark:bg-orange-900" />
          <span className="text-sm">Offline Reserve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-300 dark:bg-gray-700" />
          <span className="text-sm">Occupied</span>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        {/* Bus front indicator */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">🚌 Front</span>
          </div>
        </div>

        {/* Seat rows */}
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const left1SeatNo = rowIndex * seatsPerRow + 1
            const left2SeatNo = rowIndex * seatsPerRow + 2
            const right1SeatNo = rowIndex * seatsPerRow + 3
            const right2SeatNo = rowIndex * seatsPerRow + 4

            const left1 = getSeatData(left1SeatNo)
            const left2 = getSeatData(left2SeatNo)
            const right1 = getSeatData(right1SeatNo)
            const right2 = getSeatData(right2SeatNo)

            return (
              <div
                key={rowIndex}
                className="flex items-center justify-center gap-2"
              >
                {/* Left side seats */}
                <div className="flex gap-1">
                  {left1SeatNo <= totalCapacity && (
                    <SeatButton seatNo={left1SeatNo} seat={left1} />
                  )}
                  {left2SeatNo <= totalCapacity && (
                    <SeatButton seatNo={left2SeatNo} seat={left2} />
                  )}
                </div>

                {/* Aisle */}
                <div className="w-8 border-l-2 border-dashed border-muted-foreground/30 mx-2" />

                {/* Right side seats */}
                <div className="flex gap-1">
                  {right1SeatNo <= totalCapacity && (
                    <SeatButton seatNo={right1SeatNo} seat={right1} />
                  )}
                  {right2SeatNo <= totalCapacity && (
                    <SeatButton seatNo={right2SeatNo} seat={right2} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bus back indicator */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">Back 🚌</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SeatButton({ seatNo, seat }: { seatNo: number; seat: Seat | null }) {
  if (!seat) {
    // Seat doesn't exist in database (shouldn't happen, but handle gracefully)
    return (
      <div className="w-10 h-10 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
        {seatNo}
      </div>
    )
  }

  const isOffline = seat.pool === 'offline'
  const isOccupied = seat.assigned

  let className = 'w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium transition-all'

  if (isOccupied) {
    className += ' border-gray-500 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
  } else if (isOffline) {
    className += ' border-orange-500 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
  } else {
    className += ' border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  }

  return (
    <div className={className} title={isOccupied ? 'Occupied' : isOffline ? 'Offline Reserve' : 'Available (Online)'}>
      {seatNo}
    </div>
  )
}

