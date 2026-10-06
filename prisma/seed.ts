import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: "admin@aromatica.gt", password: "admin123", name: "Administrador", role: Role.ADMIN },
      { email: "cliente@aromatica.gt", password: "123456", name: "Cliente Demo", role: Role.CUSTOMER },
    ],
  });

  const productos = [
    { name: "Nuit d'Or", brand: "Maison Lumière", price: 899, stock: 8, description: "Oriental cálido: ámbar, vainilla de Madagascar y azahar.", image: "photo-1592945403244-b3fbafd7f539" },
    { name: "Brisa de Sal", brand: "Costa Norte", price: 649, stock: 15, description: "Acuático fresco: bergamota, salvia y madera flotada.", image: "photo-1541643600914-78b084683601" },
    { name: "Rosa Negra", brand: "Atelier Sombra", price: 1199, stock: 5, description: "Rosa de Damasco, pimienta negra y pachulí. Intenso y elegante.", image: "photo-1588405748880-12d1d2a59f75" },
    { name: "Cedro Blanco", brand: "Norte Studio", price: 749, stock: 12, description: "Amaderado seco: cedro, vetiver e iris. Minimalista.", image: "photo-1594035910387-fea47794261f" },
    { name: "Jardín de Higo", brand: "Maison Lumière", price: 699, stock: 10, description: "Verde y lechoso: hoja de higo, coco y almizcle suave.", image: "photo-1615634260167-c8cdede054de" },
    { name: "Oud Real", brand: "Atelier Sombra", price: 1899, stock: 3, description: "Oud genuino, azafrán y cuero. Edición limitada.", image: "photo-1523293182086-7651a899d37f" },
  ];

  const creados = [];
  for (const p of productos) {
    creados.push(
      await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          description: p.description,
          priceCents: p.price * 100,
          stock: p.stock,
          imageUrl: img(p.image),
        },
      }),
    );
  }

  await prisma.review.create({
    data: {
      productId: creados[0].id,
      author: "Valeria",
      bodyHtml: "Me encantó, dura <b>todo el día</b>.",
      rating: 5,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
