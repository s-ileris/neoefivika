export default function Logo({
  color,
  size,
  className,
}: {
  color?: string
  size: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 241 452"
      width={size * 0.5331858407}
      height={size}
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M241 0H78.587L0 246.45H87.4935L7.33478 452L234.713 164.65H146.021L241 0Z"
        fill={color || 'white'}
      />
    </svg>
  )
}
