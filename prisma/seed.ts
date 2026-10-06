import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

async function ensureUser(email: string, password: string, name: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({ data: { email, password: await hashPassword(password), name, role } });
}

async function ensureProduct(data: { name: string; brand: string; priceCents: number; stock: number; description: string; imageUrl: string }) {
  const existing = await prisma.product.findFirst({ where: { name: data.name, brand: data.brand } });
  if (existing) return existing;
  return prisma.product.create({ data });
}

async function main() {
  const admin = await ensureUser("admin@aromatica.gt", "admin123", "Administrador", Role.ADMIN);
  await ensureUser("cliente@aromatica.gt", "123456", "Cliente Demo", Role.CUSTOMER);

  const products = [
    { name: "Nuit d'Or", brand: "Maison Lumière", priceCents: 89900, stock: 8, description: "Oriental cálido: ámbar, vainilla de Madagascar y azahar.", imageUrl: img("photo-1592945403244-b3fbafd7f539") },
    { name: "Brisa de Sal", brand: "Costa Norte", priceCents: 64900, stock: 15, description: "Acuático fresco: bergamota, salvia y madera flotada.", imageUrl: img("photo-1541643600914-78b084683601") },
    { name: "Rosa Negra", brand: "Atelier Sombra", priceCents: 119900, stock: 5, description: "Rosa de Damasco, pimienta negra y pachulí. Intenso y elegante.", imageUrl: img("photo-1588405748880-12d1d2a59f75") },
    { name: "Cedro Blanco", brand: "Norte Studio", priceCents: 74900, stock: 12, description: "Amaderado seco: cedro, vetiver e iris. Minimalista.", imageUrl: img("photo-1594035910387-fea47794261f") },
    { name: "Jardín de Higo", brand: "Maison Lumière", priceCents: 69900, stock: 10, description: "Verde y lechoso: hoja de higo, coco y almizcle suave.", imageUrl: img("photo-1615634260167-c8cdede054de") },
    { name: "Oud Real", brand: "Atelier Sombra", priceCents: 189900, stock: 3, description: "Oud genuino, azafrán y cuero. Edición limitada.", imageUrl: img("photo-1523293182086-7651a899d37f") },
  ];
  const created = [];
  for (const product of products) created.push(await ensureProduct(product));
  const first = created[0];
  const review = await prisma.review.findFirst({ where: { productId: first.id, userId: admin.id } });
  if (!review) {
    await prisma.review.create({ data: { productId: first.id, userId: admin.id, author: admin.name, bodyHtml: "Me encantó, dura todo el día.", rating: 5 } });
  }
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
