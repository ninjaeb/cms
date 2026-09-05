import { prisma } from "@/lib/prisma";
import TagManager from "@/components/admin/TagManager";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Tags</h1>
      <TagManager initial={tags} />
    </div>
  );
}
