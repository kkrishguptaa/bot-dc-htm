FROM node:21-alpine3.18@sha256:b8427757fbe18489e8e15317064a5ff7f346a11beec7f6a91ef30a2f625c5fe0

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
