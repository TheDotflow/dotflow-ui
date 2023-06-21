<h1 align="center">dotflow-ui</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Project details can be found [here](https://github.com/TheDotflow/dotflow-ink#readme)

### Run with docker

1. Make sure to have [Docker](https://docs.docker.com/get-docker/) installed
2. To build an image run: `docker build -t dotflow-ui .`
3. To run the app: `docker run -dp 3000:3000 dotflow-ui`
4. Go to `http://localhost:3000/` to interact with the webapp

### Set up development environment

Before running the webapp locally it is required to first deploy the contract and set the required `CONTRACT_IDENTITY` environment variable to the address of the deployed identity contract.

You can use the same address for the environment variable that is used in the `Dockerfile`.

For details regarding the contract deployment go to this [page](https://github.com/TheDotflow/dotflow-ink#deployment)

1.  Install [NodeJs](https://nodejs.org/en/download)
2.  `yarn install`
3.  `yarn dev`
4.  Go to `http://localhost:3000` to interact with the webapp
5.  To run the unit tests: `yarn test`
