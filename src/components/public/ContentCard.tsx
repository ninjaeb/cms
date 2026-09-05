import Link from "next/link";

export type ContentCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
};

export default function ContentCard({ item }: { item: ContentCardData }) {
  return (
    <article className="border-b border-neutral-200 py-6 last:border-none">
      <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
        {item.category && (
          <Link href={`/category/${item.category.slug}`} className="font-medium hover:underline">
            {item.category.name}
          </Link>
        )}
        {item.publishedAt && (
          <time dateTime={item.publishedAt.toISOString()}>
            {item.category && "· "}
            {item.publishedAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>
      <h2 className="text-xl font-semibold text-neutral-900">
        <Link href={`/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h2>
      {item.excerpt && <p className="mt-2 text-neutral-600">{item.excerpt}</p>}
    </article>
  );
}
