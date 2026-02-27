/**
 * components/ui/Avatar.jsx
 * Composant avatar réutilisable avec support upload, tailles et états.
 */

import React, { useRef } from 'react'
import { Camera, Trash2, User } from 'lucide-react'

const SIZES = {
  xs:  { outer: 'w-7 h-7',   text: 'text-xs',  icon: 'w-3 h-3' },
  sm:  { outer: 'w-9 h-9',   text: 'text-xs',  icon: 'w-3.5 h-3.5' },
  md:  { outer: 'w-12 h-12', text: 'text-sm',  icon: 'w-4 h-4' },
  lg:  { outer: 'w-16 h-16', text: 'text-lg',  icon: 'w-5 h-5' },
  xl:  { outer: 'w-24 h-24', text: 'text-2xl', icon: 'w-6 h-6' },
  '2xl': { outer: 'w-32 h-32', text: 'text-3xl', icon: 'w-7 h-7' },
}

export default function Avatar({
  src,
  name,
  size = 'md',
  ring = false,
  editable = false,
  onUpload,
  onDelete,
  className = '',
}) {
  const fileRef = useRef(null)
  const { outer, text, icon } = SIZES[size] || SIZES.md

  // Initiales depuis le nom
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onUpload) onUpload(file)
    e.target.value = '' // reset input
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Ring gradient optionnel */}
      <div className={ring ? 'avatar-ring rounded-full p-0.5' : ''}>
        <div className={`${outer} rounded-full overflow-hidden flex-shrink-0`}>
          {src ? (
            <img
              src={src}
              alt={name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-eneo flex items-center justify-center">
              {name ? (
                <span className={`font-bold text-white font-display ${text}`}>
                  {initials}
                </span>
              ) : (
                <User className={`text-white/80 ${icon}`} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'édition */}
      {editable && (
        <div className="absolute -bottom-1 -right-1 flex gap-1">
          {/* Upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-7 h-7 rounded-full bg-eneo-purple-500 hover:bg-eneo-purple-600
                       text-white flex items-center justify-center shadow-md
                       transition-all duration-200 hover:scale-110"
            title="Changer l'avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Supprimer (seulement si une image existe) */}
          {src && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600
                         text-white flex items-center justify-center shadow-md
                         transition-all duration-200 hover:scale-110"
              title="Supprimer l'avatar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
