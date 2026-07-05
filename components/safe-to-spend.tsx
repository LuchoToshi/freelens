"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateSafeToSpend, formatEuro } from "@/lib/calc";

const STORAGE_KEY = "freelens.safe-to-spend.v1";

interface StoredInputs {
  balance: string;
  monthlyEssentialCosts: string;
  taxReservePercent: string;
  bufferMonths: string;
}

const DEFAULT_INPUTS: StoredInputs = {
  balance: "",
  monthlyEssentialCosts: "",
  taxReservePercent: "30",
  bufferMonths: "2",
};

function toNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SafeToSpend() {
  const [inputs, setInputs] = useState<StoredInputs>(DEFAULT_INPUTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Deliberate one-time sync from localStorage post-mount: rendering
      // DEFAULT_INPUTS first keeps server/client markup identical and avoids
      // a hydration mismatch, so this can't be a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs({ ...DEFAULT_INPUTS, ...JSON.parse(stored) });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs, hydrated]);

  const balance = toNumber(inputs.balance);
  const monthlyEssentialCosts = toNumber(inputs.monthlyEssentialCosts);
  const taxReservePercent = toNumber(inputs.taxReservePercent);
  const bufferMonths = toNumber(inputs.bufferMonths);

  const { taxReserve, buffer, safeToSpend } = calculateSafeToSpend({
    balance,
    monthlyEssentialCosts,
    taxReservePercent,
    bufferMonths,
  });

  function updateField(field: keyof StoredInputs) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Freelens</h1>
        <p className="text-sm text-muted-foreground">
          Wat kun je deze maand veilig uitgeven?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jouw cijfers</CardTitle>
          <CardDescription>
            Alles blijft op je eigen apparaat opgeslagen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="balance">Banksaldo</Label>
            <Input
              id="balance"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={inputs.balance}
              onChange={updateField("balance")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monthly-costs">
              Gemiddelde vaste maandlasten
            </Label>
            <Input
              id="monthly-costs"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={inputs.monthlyEssentialCosts}
              onChange={updateField("monthlyEssentialCosts")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tax-reserve">Belastingreserve (%)</Label>
            <Input
              id="tax-reserve"
              type="number"
              inputMode="decimal"
              value={inputs.taxReservePercent}
              onChange={updateField("taxReservePercent")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="buffer-months">Buffer (aantal maanden)</Label>
            <Input
              id="buffer-months"
              type="number"
              inputMode="decimal"
              value={inputs.bufferMonths}
              onChange={updateField("bufferMonths")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 text-center">
          <span className="text-sm text-muted-foreground">
            Veilig te besteden deze maand
          </span>
          <span
            className={`text-4xl font-semibold tracking-tight ${
              safeToSpend < 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {formatEuro(safeToSpend)}
          </span>
          <p className="text-sm text-muted-foreground">
            {formatEuro(taxReserve)} is al voor de belasting,{" "}
            {formatEuro(buffer)} is je buffer. De rest is echt van jou.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-xs text-muted-foreground">
        <p>
          Btw die je hebt ontvangen reserveer je apart — die zit niet in dit
          bedrag.
        </p>
        <p>Indicatie, geen belastingadvies.</p>
      </div>
    </div>
  );
}
