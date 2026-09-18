const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
(async () => {
  const hashed = await bcrypt.hash("hassan2007", 10);
  const updated = await prisma.user.update({
    where: { id: 1 },
    data: { username: "hassan1234", password: hashed },
  });
  console.log("Updated:", updated.username, updated.role);
  await prisma.$disconnect();
})();