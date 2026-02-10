import React from "react";
import type { ProductClass } from "@/data/products";

interface ClassFilterProps {
  classes: ProductClass[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ClassFilter({ classes, activeId, onSelect }: ClassFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2" role="tablist" aria-label="Product classes">
      <div className="inline-flex items-center gap-3 min-w-full">
        {classes.map((cls) => {
          const isActive = cls.id === activeId;
          return (
            <button
              key={cls.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(cls.id)}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm whitespace-nowrap",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {cls.label} — {cls.name} ({cls.shortName})
            </button>
          );
        })}
      </div>
    </div>
  );
}
