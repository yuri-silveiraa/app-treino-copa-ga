import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { questionsSeed } from "../src/data/questions/index.js";

const prisma = new PrismaClient();

const initialUsers = [
  { username: "yuri", name: "Yuri" },
  { username: "paula", name: "Paula" },
  { username: "rafaela", name: "Rafaela" },
  { username: "natanael", name: "Natanael" },
  { username: "masterson", name: "Masterson" },
  { username: "andre", name: "Andre" },
];

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  for (const user of initialUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { name: user.name, passwordHash },
      create: { ...user, passwordHash },
    });
  }

  for (const question of questionsSeed) {
    if (!question.alternatives.includes(question.correct)) {
      throw new Error(`Resposta correta não encontrada nas alternativas: ${question.statement}`);
    }

    const existing = await prisma.question.findUnique({
      where: {
        statement_theme: {
          statement: question.statement,
          theme: question.theme,
        },
      },
    });

    if (existing) {
      await prisma.alternative.deleteMany({ where: { questionId: existing.id } });
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          difficulty: question.difficulty,
          explanation: question.explanation,
          source: question.source,
          alternatives: {
            create: question.alternatives.map((alternative) => ({
              text: alternative,
              isCorrect: alternative === question.correct,
            })),
          },
        },
      });
      continue;
    }

    await prisma.question.create({
      data: {
        statement: question.statement,
        theme: question.theme,
        difficulty: question.difficulty,
        explanation: question.explanation,
        source: question.source,
        alternatives: {
          create: question.alternatives.map((alternative) => ({
            text: alternative,
            isCorrect: alternative === question.correct,
          })),
        },
      },
    });
  }

  console.log(
    `Seed concluído: ${initialUsers.length} usuários e ${questionsSeed.length} questões processadas.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
