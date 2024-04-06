FROM node:21-alpine3.18@sha256:d3398787ac2f4d83206293be6b41371a628383eadaf7fb108faab63d13c5469e

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
