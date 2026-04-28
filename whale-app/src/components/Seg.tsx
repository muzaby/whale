import { Icon } from './Icon'

interface SegOption<T extends string> {
  v: T
  label: string
  icon?: string
}

interface SegProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: SegOption<T>[]
}

export function Seg<T extends string>({ value, onChange, options }: SegProps<T>) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.v}
          className={value === o.v ? 'active' : ''}
          onClick={() => onChange(o.v)}
        >
          {o.icon && <Icon name={o.icon as Parameters<typeof Icon>[0]['name']} size={11} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
