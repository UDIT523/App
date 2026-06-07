import {
  useEffect,
  useId,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../../utils/cn";

const Combobox = forwardRef(function Combobox(
  {
    label,
    value,
    onChange,
    options = [],
    placeholder = "Search…",
    disabled = false,
    required = false,
    error,
    hint,
    emptyText = "No matches found",
    onSelect,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  useImperativeHandle(ref, () => ({
    openDropdown() {
      if (!disabled) {
        setOpen(true);
        inputRef.current?.focus();
      }
    },
    focusInput() {
      inputRef.current?.focus();
    },
    closeDropdown() {
      setOpen(false);
    },
  }));

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((value || "").toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (val) => {
    onChange(val);
    onSelect?.(val);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0 && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1.5" ref={wrapRef}>
      {label && (
        <label className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onMouseDown={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "h-11 w-full rounded-xl border bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400",
            "transition-all duration-150 focus:outline-none focus:ring-2",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10"
          )}
        />

        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-transform",
            open && "rotate-180"
          )}
        />

        {open && !disabled && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-ink-100 bg-white p-1 shadow-[var(--shadow-lift)] animate-fade-in"
          >
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(opt);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-700 transition-colors",
                    i === active ? "bg-ink-100 text-ink-900" : "hover:bg-ink-50"
                  )}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-3 py-2.5 text-sm text-ink-400">{emptyText}</li>
            )}
          </ul>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Combobox;