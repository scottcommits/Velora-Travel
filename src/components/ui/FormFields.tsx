"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { Calendar, ChevronDown, ArrowUpRight, Search, Check } from "lucide-react";
import { cn, formatUsd } from "@/lib/utils";

/* ==========================================================================
   Form Inputs (Contact form, Modal form) - Cohesive Velora inset control cells
   ========================================================================== */

const fieldCellBase =
  "group relative flex flex-col justify-center rounded-[16px] border border-line bg-bg/60 px-4 py-2.5 transition-colors hover:border-ink/30 focus-within:border-ink focus-within:bg-surface";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function InputField({
  label,
  id,
  error,
  hint,
  type,
  className,
  ...props
}: InputFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const isDate = type === "date";

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          fieldCellBase,
          "min-h-[58px]",
          error && "border-error focus-within:border-error"
        )}
      >
        <label
          htmlFor={id}
          className="text-[11px] font-medium text-ink-muted leading-tight select-none cursor-pointer"
        >
          {label}
        </label>
        <div className="relative flex items-center mt-0.5">
          <input
            id={id}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-muted/50 leading-snug focus:outline-none",
              isDate && "velora-date pr-6 cursor-pointer",
              className
            )}
            {...props}
          />
          {isDate ? (
            <Calendar
              aria-hidden="true"
              strokeWidth={1.6}
              className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-muted"
            />
          ) : null}
        </div>
      </div>
      {hint && !error ? (
        <p id={hintId} className="px-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="px-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  id,
  error,
  options,
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(() =>
    String(value ?? defaultValue ?? options[0]?.value ?? "")
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? String(value) : internalValue;
  const selectedOption =
    options.find((o) => o.value === currentValue) ??
    options[0] ?? { value: "", label: "" };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelectValue = (nextVal: string) => {
    setInternalValue(nextVal);
    if (onChange) {
      const syntheticEvent = {
        target: { value: nextVal, id: id ?? "", name: props.name ?? "" },
        currentTarget: { value: nextVal, id: id ?? "", name: props.name ?? "" },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setOpen(false);
  };

  const labelId = id ? `${id}-label` : undefined;
  const listboxId = id ? `${id}-listbox` : undefined;

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <div
        className={cn(
          fieldCellBase,
          "min-h-[58px]",
          open && "border-ink bg-surface",
          error && "border-error focus-within:border-error"
        )}
      >
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          value={currentValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onChange?.(e);
          }}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          id={labelId}
          onClick={() => setOpen((prev) => !prev)}
          className="text-[11px] font-medium text-ink-muted leading-tight select-none cursor-pointer"
        >
          {label}
        </span>

        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={labelId}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "mt-0.5 flex w-full items-center justify-between gap-2 bg-transparent text-left text-[15px] font-medium text-ink leading-snug focus:outline-none cursor-pointer",
            className
          )}
        >
          <span className="truncate">{selectedOption.label}</span>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-all duration-200 group-hover:border-ink/35 group-hover:text-ink",
              open && "rotate-180 border-ink bg-ink text-bg"
            )}
          >
            <ChevronDown className="h-3 w-3" strokeWidth={1.8} />
          </span>
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            data-lenis-prevent
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="no-scrollbar absolute left-0 right-0 top-full mt-2 z-50 max-h-[260px] overflow-y-auto rounded-[18px] border border-line bg-surface p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]"
          >
            {options.map((opt) => {
              const isSelected = opt.value === currentValue;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectValue(opt.value)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-[13.5px] font-medium transition-colors cursor-pointer select-none",
                    isSelected ? "bg-ink text-bg" : "text-ink hover:bg-bg-alt"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="px-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextareaField({
  label,
  id,
  error,
  className,
  ...props
}: TextareaFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          fieldCellBase,
          "py-3",
          error && "border-error focus-within:border-error"
        )}
      >
        <label
          htmlFor={id}
          className="text-[11px] font-medium text-ink-muted leading-tight select-none cursor-pointer"
        >
          {label}
        </label>
        <textarea
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "mt-1 w-full min-h-[88px] bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-muted/50 leading-relaxed resize-y focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="px-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   Unified Search Bar & Filter Controls (Hero SearchTabs + 4 Service Pages)
   ========================================================================== */

export function SearchBarShell({
  floating = false,
  className,
  children,
}: {
  floating?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative z-20 rounded-[24px] border border-line bg-surface p-2 md:p-2.5",
        floating && "shadow-[0_14px_40px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BarSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  wrapperClassName?: string;
  menuDirection?: "up" | "down";
}

interface ParsedOption {
  value: string;
  label: string;
}

function extractOptions(children: ReactNode): ParsedOption[] {
  const result: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (
      isValidElement<{ value?: string | number; children?: ReactNode }>(child) &&
      child.type === "option"
    ) {
      const val = String(child.props.value ?? "");
      const text =
        typeof child.props.children === "string" ||
        typeof child.props.children === "number"
          ? String(child.props.children)
          : Array.isArray(child.props.children)
            ? child.props.children.join("")
            : val;
      result.push({ value: val, label: text.trim() });
    }
  });
  return result;
}

export function BarSelect({
  label,
  id,
  wrapperClassName,
  className,
  children,
  value,
  onChange,
  menuDirection = "down",
  ...props
}: BarSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(menuDirection === "up");
  const containerRef = useRef<HTMLDivElement>(null);

  const options = extractOptions(children);
  const currentValue = value !== undefined ? String(value) : (options[0]?.value ?? "");
  const selectedOption =
    options.find((o) => o.value === currentValue) ?? options[0] ?? { value: "", label: "" };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(menuDirection === "up" || spaceBelow < 240);
    }
    setOpen((prev) => !prev);
  };

  const handleSelectOption = (nextVal: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: nextVal, id: id ?? "" },
        currentTarget: { value: nextVal, id: id ?? "" },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setOpen(false);
  };

  const labelId = id ? `${id}-label` : undefined;
  const listboxId = id ? `${id}-listbox` : undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col justify-center px-3.5 py-1.5 min-h-[54px]",
        open && "z-[70]",
        wrapperClassName
      )}
    >
      {/* Hidden native select kept under the hood for form/accessibility compatibility */}
      <select
        id={id}
        value={currentValue}
        onChange={onChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none"
        {...props}
      >
        {children}
      </select>

      <span
        id={labelId}
        onClick={handleToggle}
        className="text-[11px] font-medium text-ink-muted leading-tight select-none cursor-pointer"
      >
        {label}
      </span>

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={labelId}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) {
              handleToggle();
              return;
            }
            const idx = options.findIndex((o) => o.value === currentValue);
            const delta = e.key === "ArrowDown" ? 1 : -1;
            const nextIdx = (idx + delta + options.length) % options.length;
            const nextOpt = options[nextIdx];
            if (nextOpt) handleSelectOption(nextOpt.value);
          }
        }}
        className={cn(
          "group relative mt-0.5 flex w-full items-center justify-between gap-2 appearance-none bg-transparent text-left text-[15px] font-medium text-ink leading-snug focus:outline-none cursor-pointer",
          className
        )}
      >
        <span className="truncate">{selectedOption.label}</span>
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-bg-alt/70 text-ink-muted transition-all duration-200 group-hover:border-ink/35 group-hover:text-ink",
            open && "rotate-180 border-ink bg-ink text-bg"
          )}
        >
          <ChevronDown className="h-3 w-3" strokeWidth={1.8} />
        </span>
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          data-lenis-prevent
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className={cn(
            "no-scrollbar absolute left-0 right-0 z-[80] min-w-[210px] max-h-[290px] overflow-y-auto rounded-[18px] border border-line bg-surface p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]",
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-[13.5px] font-medium transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-ink text-bg"
                    : "text-ink hover:bg-bg-alt"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected ? (
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export interface BarDateProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
}

export function BarDate({
  label,
  id,
  wrapperClassName,
  className,
  ...props
}: BarDateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-center px-3.5 py-1.5 min-h-[54px]",
        wrapperClassName
      )}
    >
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-ink-muted leading-tight select-none"
      >
        {label}
      </label>
      <div className="relative flex items-center mt-0.5">
        <input
          id={id}
          type="date"
          className={cn(
            "velora-date w-full bg-transparent pr-5 text-[15px] font-medium text-ink leading-snug focus:outline-none cursor-pointer",
            className
          )}
          {...props}
        />
        <Calendar
          aria-hidden="true"
          strokeWidth={1.6}
          className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-muted"
        />
      </div>
    </div>
  );
}

export interface BarInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withSearchIcon?: boolean;
  wrapperClassName?: string;
}

export function BarInput({
  label,
  id,
  withSearchIcon = false,
  wrapperClassName,
  className,
  ...props
}: BarInputProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-center px-3.5 py-1.5 min-h-[54px]",
        wrapperClassName
      )}
    >
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-ink-muted leading-tight select-none"
      >
        {label}
      </label>
      <div className="relative flex items-center mt-0.5">
        {withSearchIcon ? (
          <Search
            aria-hidden="true"
            strokeWidth={1.6}
            className="mr-1.5 h-3.5 w-3.5 text-ink-muted shrink-0"
          />
        ) : null}
        <input
          id={id}
          className={cn(
            "w-full bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-muted/60 leading-snug focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

export function BarSubmitButton({
  children = "Search",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex min-h-[50px] w-full md:w-auto items-center justify-center gap-2.5 rounded-full bg-ink pl-5 pr-2 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-88 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink shrink-0"
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}

export interface PriceRangeSliderProps {
  id: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

export function PriceRangeSlider({
  id,
  min,
  max,
  step = 20,
  value,
  onChange,
  label = "Price",
  className,
}: PriceRangeSliderProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("flex flex-col justify-center gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <label htmlFor={id} className="font-medium text-ink-muted">
          {label}
        </label>
        <span className="font-mono font-medium text-ink">
          Up to {formatUsd(value)}
        </span>
      </div>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={`Up to ${value} dollars`}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--ink) 0%, var(--ink) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`,
          }}
          className="velora-range w-full"
        />
      </div>
    </div>
  );
}

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

export function FilterChip({
  active,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 text-[13px] font-medium transition-colors cursor-pointer select-none",
        active
          ? "bg-ink text-bg border-ink"
          : "bg-surface text-ink-muted border-line hover:text-ink hover:border-ink/40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
