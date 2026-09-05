import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  return prisma.setting.create({ data: { id: 1 } });
}
