FROM node:21-alpine3.18@sha256:65998e325b06014d4f1417a8a6afb1540d1ac66521cca76f2221a6953947f9ee

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
