"use client";

import { RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  parseSearchParams,
  stringifySearchParams,
  type SearchParams,
} from "@/lib/url-state";

const CURRENT_YEAR = new Date().getFullYear();

const LISTS = [
  {
    name: "Popular",
    isbns:
      "0671027034,0735211299,0061122416,1250123828,020161622X,0062316095,081298840X,1491904240,0441172717,0451191145",
  },
  {
    name: "Classics",
    isbns:
      "0140449264,0451524934,0679783261,0141182806,0142437239,0743273567,0141439602,0679785892,0141442468,0553212419",
  },
  {
    name: "Sci-fi & fantasy",
    isbns:
      "0441172717,0345339703,0553293354,0345453743,055357342X,0060850523,0812504824,0345349571,055357339X,0345337662",
  },
] as const;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "ita", label: "Italian" },
  { value: "ara", label: "Arabic" },
  { value: "fre", label: "French" },
  { value: "ger", label: "German" },
  { value: "ind", label: "Indonesian" },
  { value: "por", label: "Portuguese" },
] as const;

function FilterBase({ initial }: { initial: SearchParams }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setOptimisticFilters] = useOptimistic(initial);

  const commit = (next: SearchParams) => {
    const nextWithoutPage = { ...next, page: undefined };
    const query = stringifySearchParams(nextWithoutPage);

    startTransition(() => {
      setOptimisticFilters(nextWithoutPage);
      router.push(query ? `/?${query}` : "/", { scroll: false });
    });
  };

  const update = (key: keyof SearchParams, value?: string) => {
    commit({ ...filters, [key]: value });
  };

  const activeFilters = ["yr", "rtg", "lng", "pgs", "isbn"].filter(
    (key) => filters[key as keyof SearchParams],
  ).length;

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="space-y-6 transition-opacity data-pending:opacity-65"
    >
      <FilterSection label="Published before" value={filters.yr ?? `Any year`}>
        <Slider
          aria-label="Latest publication year"
          min={1450}
          max={CURRENT_YEAR}
          step={10}
          value={[Number(filters.yr) || CURRENT_YEAR]}
          onValueCommit={([value]) =>
            update("yr", value === CURRENT_YEAR ? undefined : String(value))
          }
        />
        <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
          <span>1450</span>
          <span>{CURRENT_YEAR}</span>
        </div>
      </FilterSection>

      <FilterSection
        label="Minimum rating"
        value={filters.rtg ? `${filters.rtg}+` : "Any rating"}
      >
        <Slider
          aria-label="Minimum rating"
          min={0}
          max={5}
          step={0.5}
          value={[Number(filters.rtg) || 0]}
          onValueCommit={([value]) =>
            update("rtg", value === 0 ? undefined : String(value))
          }
        />
        <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
          <span>Any</span>
          <span>5 stars</span>
        </div>
      </FilterSection>

      <div className="space-y-2">
        <Label htmlFor="language" className="text-xs font-semibold">
          Language
        </Label>
        <Select
          value={filters.lng ?? "all"}
          onValueChange={(value) =>
            update("lng", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger id="language" className="bg-card h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {LANGUAGES.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterSection
        label="Maximum length"
        value={filters.pgs ? `${filters.pgs} pages` : "Any length"}
      >
        <Slider
          aria-label="Maximum page count"
          min={100}
          max={1_000}
          step={100}
          value={[Number(filters.pgs) || 1_000]}
          onValueCommit={([value]) =>
            update("pgs", value === 1_000 ? undefined : String(value))
          }
        />
        <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
          <span>100</span>
          <span>1,000+</span>
        </div>
      </FilterSection>

      <div className="space-y-3">
        <Label className="text-xs font-semibold">Curated lists</Label>
        {LISTS.map((list) => {
          const checked = filters.isbn?.startsWith(list.isbns.split(",")[0]);

          return (
            <label
              key={list.name}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() =>
                  update("isbn", checked ? undefined : list.isbns)
                }
              />
              {list.name}
            </label>
          );
        })}
      </div>

      {activeFilters ? (
        <button
          type="button"
          onClick={() => commit({ search: filters.search })}
          className="text-primary hover:bg-primary/8 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 px-3 py-2.5 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="size-3.5" />
          Clear {activeFilters} {activeFilters === 1 ? "filter" : "filters"}
        </button>
      ) : null}
    </div>
  );
}

function FilterSection({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <Label className="text-xs font-semibold">{label}</Label>
        <span className="text-muted-foreground text-[11px]">{value}</span>
      </div>
      {children}
    </div>
  );
}

export function FilterFallback() {
  return <FilterBase initial={{}} />;
}

export function Filter() {
  const searchParams = useSearchParams();
  return (
    <FilterBase initial={parseSearchParams(Object.fromEntries(searchParams))} />
  );
}
