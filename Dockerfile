FROM --platform=linux/amd64 node:21

WORKDIR /usr/src/app

RUN corepack enable

COPY . .

RUN pnpm install

RUN pnpm build

CMD [ "pnpm", "start" ]
