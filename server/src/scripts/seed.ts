import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

type TopicSeed = {
  name: string;
  grade?: number;
  level?: string;
};

type SubjectSeed = {
  code: string;
  name: string;
  academicYear: string;
  topics?: TopicSeed[];
};

const prisma = new PrismaClient();
const subjects: SubjectSeed[] = JSON.parse(
  readFileSync(resolve(__dirname, '../../prisma/seed/subjects.json'), 'utf-8'),
);

async function seedSubjects() {
  for (const subject of subjects as SubjectSeed[]) {
    const createdSubject = await prisma.subject.upsert({
      where: { code: subject.code },
      update: {
        name: subject.name,
        academicYear: subject.academicYear,
        updatedAt: new Date(),
      },
      create: {
        code: subject.code,
        name: subject.name,
        academicYear: subject.academicYear,
      },
    });

    if (subject.topics?.length) {
      for (const topic of subject.topics) {
        await prisma.topic.upsert({
          where: {
            subjectId_name: {
              subjectId: createdSubject.id,
              name: topic.name,
            },
          },
          update: {
            curriculumYear: subject.academicYear,
          },
          create: {
            subjectId: createdSubject.id,
            name: topic.name,
            ...(topic.grade !== undefined ? { grade: topic.grade } : {}),
            ...(topic.level !== undefined ? { level: topic.level } : {}),
            curriculumYear: subject.academicYear,
          },
        });
      }
    }
  }
}

async function main() {
  await seedSubjects();
  // eslint-disable-next-line no-console
  console.log('Seed completed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
