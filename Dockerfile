# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /dotflow-ui
COPY . .

# Set the necessary environment variables
ENV CONTRACT_IDENTITY="Yib3XD3rkKWstaCB6P3FYCuWu2gZ4nwLoi6x9w8e9UoLNjh"

RUN apk add --no-cache libc6-compat

# Install dependencies based on the preferred package manager
RUN npm i;

RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
