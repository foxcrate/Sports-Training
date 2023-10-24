import { PrismaClient } from '@prisma/client';
import { usersSeeds } from './users.seed';
import { sportsSeeds } from './sports.seed';
import { regionsSeeds } from './regions.seed';

const prisma = new PrismaClient();

async function seed() {
  for (const userData of usersSeeds) {
    await prisma.user.create({ data: userData });
  }
  console.log(' -- users create');

  for (const sportData of sportsSeeds) {
    await prisma.sport.create({ data: sportData });
  }
  console.log(' -- sports create');

  for (const regionData of regionsSeeds) {
    await prisma.region.create({ data: regionData });
  }
  console.log(' -- regions create');

  await prisma.$disconnect();
}

seed();
