"use client";

import { useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import {
  normalizeTypedProfession,
  PROFESSION_CATALOGUE,
  professionLabel,
} from "@/lib/frontdesk/professions";

/**
 * Searchable, multi-select, and open: the catalogue covers the trades people
 * actually book by inquiry, and anything missing can be typed and is kept in
 * the freelancer's own words (`professions.ts`). The combobox primitive from
 * @base-ui carries the WAI-ARIA list-autocomplete behaviour; what is added
 * here is the "add what you typed" path, because a fixed list would otherwise
 * make a whole trade unrepresentable.
 */
export type Profession = string;

const chipsClass =
  "flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--fd-line-control)] bg-white p-2 focus-within:border-[var(--fd-focus-ring)] focus-within:ring-2 focus-within:ring-[var(--fd-focus-ring)]/25";
const chipClass =
  "inline-flex items-center gap-1 rounded-full bg-[var(--fd-line-control)]/40 py-1 pl-2.5 pr-1 text-sm text-[var(--fd-ink)]";
const chipRemoveClass =
  "rounded-full p-0.5 leading-none text-[var(--fd-ink)]/70 hover:bg-[var(--fd-line-control)] hover:text-[var(--fd-ink)]";
const inputClass = "min-w-24 flex-1 border-none bg-transparent p-1 text-base outline-none sm:text-sm";
const popupClass =
  "max-h-64 w-[min(28rem,90vw)] overflow-auto rounded-lg border border-[var(--fd-line-control)] bg-white py-1 shadow-lg";
const itemClass =
  "cursor-pointer px-3 py-2 text-sm data-[highlighted]:bg-[var(--fd-line-control)]/30 data-[selected]:font-medium";
const labelClass = "text-sm font-medium text-[var(--fd-ink)]";
const srOnlyClass = "sr-only";

const INPUT_ID = "profession-picker-input";

export function ProfessionPicker({
  locale,
  value,
  onChange,
}: {
  locale: FrontdeskLocale;
  value: Profession[];
  onChange: (next: Profession[]) => void;
}) {
  const t = fdDict(locale).setup.profile;
  const [announcement, setAnnouncement] = useState("");
  const [query, setQuery] = useState("");

  const label = (profession: string) => professionLabel(profession, locale);

  // Selected-but-typed professions still need to be items, or the combobox
  // cannot render their chips.
  const items = [
    ...new Set([...PROFESSION_CATALOGUE.map((p) => p.value), ...value]),
  ];

  const typed = normalizeTypedProfession(query, locale);
  const canAddTyped = typed !== null && !items.includes(typed);

  function handleValueChange(next: Profession[]) {
    const added = next.find((profession) => !value.includes(profession));
    const removed = value.find((profession) => !next.includes(profession));
    if (added) {
      setAnnouncement(
        t.professionAdded.replace("{profession}", label(added)).replace("{n}", String(next.length)),
      );
    } else if (removed) {
      setAnnouncement(
        t.professionRemoved
          .replace("{profession}", label(removed))
          .replace("{n}", String(next.length)),
      );
    }
    onChange(next);
  }

  function addTyped() {
    if (!typed || value.includes(typed)) return;
    handleValueChange([...value, typed]);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={INPUT_ID} className={labelClass}>
        {t.professionsLabel}
      </label>
      <p id="profession-picker-hint" className="text-xs text-[var(--fd-ink)]/60">
        {t.professionsHint}
      </p>
      <div role="status" aria-live="polite" className={srOnlyClass}>
        {announcement}
      </div>
      <Combobox.Root
        items={items}
        multiple
        value={value}
        inputValue={query}
        onInputValueChange={setQuery}
        onValueChange={(next) => handleValueChange(next as Profession[])}
        onOpenChange={(nextOpen, eventDetails) => {
          if (!nextOpen && eventDetails.reason === "item-press") {
            eventDetails.cancel();
          }
        }}
        itemToStringLabel={(profession: string) => label(profession)}
      >
        <Combobox.Chips className={chipsClass}>
          {value.map((profession) => (
            <Combobox.Chip key={profession} className={chipClass}>
              {label(profession)}
              <Combobox.ChipRemove
                aria-label={t.removeProfession.replace("{profession}", label(profession))}
                className={chipRemoveClass}
              >
                ×
              </Combobox.ChipRemove>
            </Combobox.Chip>
          ))}
          <Combobox.Input
            id={INPUT_ID}
            aria-describedby="profession-picker-hint"
            placeholder={value.length === 0 ? t.professionsPlaceholder : undefined}
            onKeyDown={(e) => {
              // Enter on text that matches nothing adds it, rather than
              // silently doing nothing and looking broken.
              if (e.key === "Enter" && canAddTyped) {
                e.preventDefault();
                addTyped();
              }
            }}
            className={inputClass}
          />
        </Combobox.Chips>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup className={popupClass}>
              <Combobox.Empty className="px-3 py-2 text-sm text-[var(--fd-ink)]/60">
                {t.professionsNoResults}
              </Combobox.Empty>
              <Combobox.List>
                {(profession: string) => (
                  <Combobox.Item key={profession} value={profession} className={itemClass}>
                    {label(profession)}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {canAddTyped && (
        <button
          type="button"
          onClick={addTyped}
          className="w-fit text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4"
        >
          {t.professionAdd.replace("{profession}", typed)}
        </button>
      )}
    </div>
  );
}
