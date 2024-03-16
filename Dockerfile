FROM node:21-alpine3.18@sha256:30109a150f24a18cbcfb17533f8feac2e79508f92424eaae9feece9872613aeb

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
