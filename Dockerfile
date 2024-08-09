# syntax = docker/dockerfile:1

FROM oven/bun:alpine AS bun-builder

WORKDIR /app

COPY package.json bun.lockb recipe-parser.ts ./
RUN bun install --frozen-lockfile
RUN bun build --compile recipe-parser.ts

FROM golang:alpine AS go-builder

WORKDIR /app

COPY public/ public/
COPY go.mod go.sum main.go ./
RUN go build -o server main.go

FROM alpine AS base

WORKDIR /app

COPY --from=bun-builder /app/recipe-parser ./
COPY --from=go-builder /app/server ./

EXPOSE 8080
CMD [ "./server" ]
