# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /dotflow-ui
COPY . .
ENV CONTRACT_IDENTITY="Yib3XD3rkKWstaCB6P3FYCuWu2gZ4nwLoi6x9w8e9UoLNjh"
RUN yarn install --production
RUN yarn build
CMD ["yarn", "start"]
EXPOSE 3000
