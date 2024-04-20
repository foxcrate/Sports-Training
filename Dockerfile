FROM node:20

RUN npm i -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

RUN npx prisma generate

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start:prod" ]
