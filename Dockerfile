FROM node:21-alpine3.18@sha256:2d77508808463f835e81f103aa6693ce929cce73d234e9fd4dae9e062af08748

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
