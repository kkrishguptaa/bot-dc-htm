FROM node:21-alpine3.18@sha256:5ac8c772d3b76f254b1a51b23f29808f9c45e944d26c5cc940a1fd646d108588

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
