import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Categories</h1>
      <CategoryManager initial={categories} />
    </div>
  );
}
