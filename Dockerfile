FROM node:20

RUN npm i -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

RUN pnpm build

COPY . .

EXPOSE 3000

CMD [ "pnpm", "start:prod" ]