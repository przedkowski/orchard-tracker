import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  "data-testid"?: string;
}

const MAX_SHOWN = 8;

export function Combobox({
  value,
  onChange,
  suggestions,
  label,
  name,
  placeholder,
  required,
  "data-testid": testid,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const inputId = name ?? uid;
  const listId = `${uid}-list`;

  const filtered = suggestions
    .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    .slice(0, MAX_SHOWN);

  const showDropdown = open && filtered.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown") {
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        data-testid={testid}
        className={
          "block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 h-10 text-sm text-slate-100 " +
          "placeholder:text-slate-500 transition-colors duration-150 " +
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500"
        }
      />
      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          data-testid={testid ? `${testid}-dropdown` : undefined}
          className={
            "absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto " +
            "rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl shadow-slate-950/60"
          }
        >
          {filtered.map((item, i) => (
            <li
              key={item}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              data-testid={testid ? `${testid}-option-${i}` : undefined}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleSelect(item);
              }}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activeIndex
                  ? "bg-emerald-700/40 text-emerald-300"
                  : "text-slate-200 hover:bg-slate-700"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
