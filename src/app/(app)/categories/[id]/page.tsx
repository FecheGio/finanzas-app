"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { CategoryForm } from "@/components/categories/CategoryForm";
import type { Category } from "@/types";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        const found = cats.find((c) => c.id === id);
        if (found) setCategory(found);
        else setNotFound(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">Categoría no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl bg-card-raised flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest">Editar categoría</h1>
      </div>
      <div className="px-5 pb-10">
        {category && <CategoryForm existing={category} />}
      </div>
    </div>
  );
}
