import { prisma } from "@/lib/prisma";
import ContentForm from "@/components/admin/ContentForm";

export default async function NewContentPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">New content</h1>
      <ContentForm categories={categories} tags={tags} />
    </div>
  );
}
