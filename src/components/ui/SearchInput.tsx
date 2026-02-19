interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  return (
    <input
      className="adm-search"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}