FROM node:21-alpine3.18@sha256:98438af6b238f220520dd7078d4e7e04fc234c06dfa19b275df95229175465e5

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
