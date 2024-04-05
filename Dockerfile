FROM node:21-alpine3.18@sha256:47917261cdd3eca473b0c2f39a6c162f754522d251e24df08fd497d7889ff8ee

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
