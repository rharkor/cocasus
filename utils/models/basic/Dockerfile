FROM node

WORKDIR /app/web

COPY package*.json ./
RUN npm i
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
