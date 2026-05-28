import { MapPin, Clock, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProviderWithServices } from '../../lib/api'
import { StarRating } from './StarRating'
import { Badge } from './Badge'

interface ProviderCardProps {
  provider: ProviderWithServices
  index?: number
}

export function ProviderCard({ provider, index = 0 }: ProviderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={`/service/${provider.id}`}
        className="group block bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative h-52 overflow-hidden">
          <img
            src={provider.images[0]}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {provider.verified && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <BadgeCheck className="w-4 h-4 text-brand-600" />
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <Badge variant="brand" size="sm">
              {provider.services.length} usług
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-brand-600 transition-colors">
              {provider.name}
            </h3>
            <StarRating rating={provider.rating} count={provider.review_count} />
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{provider.address}, {provider.city}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Dostępny dziś</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              od <span className="text-brand-600">{provider.priceFrom} zł</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
