import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';
import { usersSeeds } from './seeds-files/users.seed';
import { sportsSeeds } from './seeds-files/sports.seed';
import { regionsSeeds } from './seeds-files/regions.seed';
import { monthsSeeds } from './seeds-files/months.seed';

const prisma = new PrismaClient();

async function seed() {
  for (const userData of usersSeeds) {
    userData.password = await hashPassword(userData.password);
    await prisma.user.create({ data: userData });
  }
  console.log(' -- users inserted');

  for (const sportData of sportsSeeds) {
    await prisma.sport.create({ data: sportData });
  }
  console.log(' -- sports inserted');

  for (const regionData of regionsSeeds) {
    await prisma.region.create({ data: regionData });
  }
  console.log(' -- regions inserted');

  for (const monthData of monthsSeeds) {
    await prisma.month.create({ data: monthData });
  }
  console.log(' -- months inserted');

  await prisma.$disconnect();
}

seed();

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}
