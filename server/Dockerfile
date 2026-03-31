FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN ./node_modules/.bin/prisma generate

EXPOSE 3000

CMD ./node_modules/.bin/prisma db push --accept-data-loss && npm start
