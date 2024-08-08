# syntax = docker/dockerfile:1

FROM oven/bun AS recipes

WORKDIR /app

COPY package.json bun.lockb recipe-parser.ts ./
RUN bun install --frozen-lockfile
RUN bun build --compile recipe-parser.ts

FROM golang AS base

COPY --from=recipes /app/recipe-parser ./
COPY . .
RUN go build -o server main.go

EXPOSE 8080
CMD [ "./server" ]
