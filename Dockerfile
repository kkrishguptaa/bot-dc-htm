FROM node:21-alpine3.18@sha256:dc576807d5d145f158f63bde339477cc9d6ecf27dea0d0b659a4011c336b98ba

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
