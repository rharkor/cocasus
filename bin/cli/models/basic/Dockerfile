FROM node

WORKDIR /app/web

COPY package*.json ./
RUN npm i
COPY . .

CMD [ "npm", "start" ]
