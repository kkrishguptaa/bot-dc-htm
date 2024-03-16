FROM node:21-alpine3.18@sha256:6a985d397090664a70e203f26dcc8079bebbba9de346d2072d477493eaefba95

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
