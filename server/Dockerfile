FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

EXPOSE 3000

CMD ["npm", "start"]
