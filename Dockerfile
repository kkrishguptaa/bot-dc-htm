FROM node:21-alpine3.18@sha256:d998f750be12c221031898fecd61d5f251ca4394ba345a81d4acd909856cdd2d

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
