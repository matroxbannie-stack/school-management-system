const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, name: true } });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
})();