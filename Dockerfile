# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /dotflow-ui
COPY . .

# Set the necessary environment variables
ENV CONTRACT_IDENTITY="5E1rtM1uNKNttdYYEXdVnfCdVrg9DGgJG1ERiytAqPNjjGRf"
ENV CONTRACT_ADDRESS_BOOK="5ChUFfCSppd3rXqpYVJs5KAKgi9dz1zyEvWwpFvXLEvYFuVq"
RELAY_CHAIN="kusama"

RUN apk add --no-cache libc6-compat

# Install dependencies based on the preferred package manager
RUN npm i;

RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
