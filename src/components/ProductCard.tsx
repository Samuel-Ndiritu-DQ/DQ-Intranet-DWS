import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import type { Product, ProductClass } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  productClass: ProductClass;
}

const CLASS_GRADIENTS: Record<string, string> = {
  indigo: "linear-gradient(135deg, #a5b4fc 0%, #8b5cf6 100%)",
  blue: "linear-gradient(135deg, #93c5fd 0%, #22d3ee 100%)",
  teal: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
  violet: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)",
};

export function ProductCard({ product, productClass }: ProductCardProps) {
  const gradient = CLASS_GRADIENTS[productClass.color] ?? CLASS_GRADIENTS.indigo;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="snap-start flex-none w-[340px] md:w-[340px] lg:w-[340px] h-auto rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h3>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {productClass.label} · {productClass.shortName}
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {productClass.shortName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>Global Execution · {productClass.name}</span>
        </div>

        <p className="text-sm text-gray-700 leading-snug">{product.what}</p>
        <p className="text-sm text-gray-500 leading-snug italic border-l-2 border-gray-200 pl-3">{product.why}</p>

        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {product.cta} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
