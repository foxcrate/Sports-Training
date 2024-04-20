FROM node:20

RUN npm i -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]