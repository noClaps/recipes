FROM oven/bun

COPY package.json bun.lockb ./
RUN --mount=type=cache,id=s/e47e0c85-96cd-4c55-ab56-79e946229e7c-/root/bun,target=/root/.bun bun install

COPY . ./

CMD [ "bun", "start" ]
