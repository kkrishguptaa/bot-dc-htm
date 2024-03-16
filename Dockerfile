FROM node:21-alpine3.18@sha256:d1cc9e6040fbff4b53003ac6e33593ca85d98dfc49c91b3f2f7283f1ca3a67fa

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
