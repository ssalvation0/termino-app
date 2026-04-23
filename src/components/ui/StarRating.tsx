import { Star } from 'lucide-react'

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-gray-400">({count})</span>
      )}
    </div>
  )
}
