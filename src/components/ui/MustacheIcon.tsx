import type { SVGProps } from 'react'

export function MustacheIcon({ strokeWidth: _sw, ...props }: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M2.5 11.2c.4-1.5 2-2.3 3.8-2 1.5.2 2.9.9 4.1 1.8.5.4 1 .6 1.6.6s1.1-.2 1.6-.6c1.2-.9 2.6-1.6 4.1-1.8 1.8-.3 3.4.5 3.8 2 .3 1.2-.2 2.4-1.3 3-1.4.8-3.2.6-4.8-.1-1.1-.5-2.1-1.2-3-2-.2-.2-.5-.2-.8 0-.9.8-1.9 1.5-3 2-1.6.7-3.4.9-4.8.1-1.1-.6-1.6-1.8-1.3-3z" />
    </svg>
  )
}
