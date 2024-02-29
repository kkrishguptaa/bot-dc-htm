FROM node:21-alpine3.18@sha256:911976032e5e174fdd8f5fb63d7089b09d59d21dba3df2728c716cbb88c7b821

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
