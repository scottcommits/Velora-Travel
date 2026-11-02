import { Calendar, ChevronDown, ArrowUpRight, Search } from "lucide-react";
import { cn, formatUsd } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/* ==========================================================================
   Form Inputs (Contact form, Modal form) - 48px height, 14px radius, error red
   ========================================================================== */

const fieldBase =
  "w-full h-12 rounded-[14px] border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-ink focus-visible:outline-2 focus-visible:outline-offset-[2px] focus-visible:outline-accent";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldBase,
            isDate && "velora-date pr-10",
            error && "border-error",
            className
          )}
          {...props}
        />
        {isDate ? (
          <Calendar
            aria-hidden="true"
            strokeWidth={1.5}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
          />
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
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
  ...props
}: SelectFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            fieldBase,
            "appearance-none pr-10 cursor-pointer",
            error && "border-error",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface text-ink">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          fieldBase,
          "min-h-24 py-3 resize-y",
          error && "border-error",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
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
        "rounded-[24px] border border-line bg-surface p-2 md:p-2.5",
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
}

export function BarSelect({
  label,
  id,
  wrapperClassName,
  className,
  children,
  ...props
}: BarSelectProps) {
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
        <select
          id={id}
          className={cn(
            "w-full appearance-none bg-transparent pr-5 text-[15px] font-medium text-ink leading-snug focus:outline-none cursor-pointer truncate",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.6}
          className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-muted"
        />
      </div>
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
        "inline-flex h-[34px] shrink-0 items-center justify-center rounded-full border px-3.5 text-[13px] font-medium transition-colors cursor-pointer select-none",
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
