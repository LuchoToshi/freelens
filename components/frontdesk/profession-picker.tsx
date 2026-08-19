"use client";

import { Combobox } from "@base-ui/react/combobox";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * WP9 section 7's forward spec: searchable combobox + listbox
 * (WAI-ARIA APG "Combobox" list-autocomplete pattern), multi-select,
 * selections rendered as removable chips outside the input. Built on
 * @base-ui/react's Combobox primitive rather than hand-rolled ARIA — it
 * already implements the roles/attributes/focus behavior the spec calls
 * for (role=combobox on the input, role=listbox on the popup,
 * aria-multiselectable, Escape closes without trapping focus).
 *
 * Only five flat values exist today, so no category grouping is rendered
 * (Combobox.Group/GroupLabel) — that requirement matters once a real
 * category structure exists, not for a five-item flat list.
 */
export const PROFESSION_VALUES = [
  "photographer",
  "videographer",
  "designer",
  "illustrator",
  "other",
] as const;
export type Profession = (typeof PROFESSION_VALUES)[number];

const chipsClass =
  "flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--fd-line-control)] bg-white p-2 focus-within:border-[var(--fd-focus-ring)] focus-within:ring-2 focus-within:ring-[var(--fd-focus-ring)]/25";
const chipClass =
  "inline-flex items-center gap-1 rounded-full bg-[var(--fd-line-control)]/40 py-1 pl-2.5 pr-1 text-sm text-[var(--fd-ink)]";
const chipRemoveClass =
  "rounded-full p-0.5 leading-none text-[var(--fd-ink)]/70 hover:bg-[var(--fd-line-control)] hover:text-[var(--fd-ink)]";
const inputClass = "min-w-24 flex-1 border-none bg-transparent p-1 text-sm outline-none";
const popupClass =
  "max-h-64 overflow-auto rounded-lg border border-[var(--fd-line-control)] bg-white py-1 shadow-lg";
const itemClass =
  "cursor-pointer px-3 py-2 text-sm data-[highlighted]:bg-[var(--fd-line-control)]/30 data-[selected]:font-medium";
const labelClass = "text-sm font-medium text-[var(--fd-ink)]";

export function ProfessionPicker({
  locale,
  value,
  onChange,
}: {
  locale: FrontdeskLocale;
  value: Profession[];
  onChange: (next: Profession[]) => void;
}) {
  const dict = fdDict(locale);
  const t = dict.setup.profile;
  const craftLabels = dict.public.craft;

  return (
    <div className="flex flex-col gap-1.5">
      <Combobox.Root
        items={PROFESSION_VALUES}
        multiple
        value={value}
        onValueChange={(next) => onChange(next as Profession[])}
        itemToStringLabel={(profession) => craftLabels[profession]}
      >
        <Combobox.Label className={labelClass}>{t.professionsLabel}</Combobox.Label>
        <p id="profession-picker-hint" className="text-xs text-[var(--fd-ink)]/60">
          {t.professionsHint}
        </p>
        <Combobox.Chips className={chipsClass}>
          {value.map((profession) => (
            <Combobox.Chip key={profession} className={chipClass}>
              {craftLabels[profession]}
              <Combobox.ChipRemove
                aria-label={t.removeProfession.replace("{profession}", craftLabels[profession])}
                className={chipRemoveClass}
              >
                ×
              </Combobox.ChipRemove>
            </Combobox.Chip>
          ))}
          <Combobox.Input aria-describedby="profession-picker-hint" className={inputClass} />
        </Combobox.Chips>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup className={popupClass}>
              <Combobox.Empty className="px-3 py-2 text-sm text-[var(--fd-ink)]/60">
                {t.professionsNoResults}
              </Combobox.Empty>
              <Combobox.List>
                {(profession: Profession) => (
                  <Combobox.Item key={profession} value={profession} className={itemClass}>
                    {craftLabels[profession]}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
