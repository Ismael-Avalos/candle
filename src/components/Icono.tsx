interface Props {
  className?: string
}

/** La llama de la vela: la marca de Candle y la señal de «hoy». */
export function Llama({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2c.6 3.2 5.5 6.300 5.500 11.500A5.500 5.500 0 0 1 12 19a5.500 5.500 0 0 1-5.500-5.500c0-2.300 1.200-4 2.400-5.300.3 1.600 1 2.600 1.900 3.100C10.500 8 11.200 4.600 12 2Z" />
      <rect x="11" y="19.500" width="2" height="2.500" rx="1" />
    </svg>
  )
}

export function Candado({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

export function Mas({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.500" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
