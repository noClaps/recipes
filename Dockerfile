FROM oven/bun

COPY package.json bun.lockb ./
RUN bun install

COPY . ./

CMD [ "bun", "start" ]
