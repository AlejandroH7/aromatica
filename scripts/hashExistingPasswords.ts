import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

const SALT_ROUNDS = 10;

async function hashExistingPasswords() {
  console.log("🔐 Iniciando migración de contraseñas...");

  try {
    const users = await prisma.user.findMany();
    console.log(`📊 Se encontraron ${users.length} usuarios`);

    let hashCount = 0;
    let skipCount = 0;

    for (const user of users) {
      if (!user.password) {
        console.log(`⏭️  Usuario ${user.email} sin contraseña, omitiendo...`);
        skipCount++;
        continue;
      }

      const isHashed = user.password.startsWith("$2a$") ||
                      user.password.startsWith("$2b$") ||
                      user.password.startsWith("$2x$") ||
                      user.password.startsWith("$2y$");

      if (isHashed) {
        console.log(`✅ Usuario ${user.email} ya tiene contraseña hasheada`);
        skipCount++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`🔒 Contraseña de ${user.email} hasheada`);
      hashCount++;
    }

    console.log("\n✨ Migración completada:");
    console.log(`   • ${hashCount} contraseñas hasheadas`);
    console.log(`   • ${skipCount} contraseñas omitidas/existentes`);
    console.log(`   • Total: ${hashCount + skipCount} usuarios`);

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

hashExistingPasswords();
