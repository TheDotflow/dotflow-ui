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
4. `yarn compile` NOTE: This requires the [dotflow-ink](https://github.com/TheDotflow/dotflow-ink) repository to be cloned next to the `dotflow-ui` repo.
5.  Go to `http://localhost:3000` to interact with the webapp

### Running tests

Some tests require a zombienet network to be run in the background. The steps to take before running the tests are the following:

1. Run a local [swanky](https://github.com/AstarNetwork/swanky-node) test node. This is where the contracts will be deployed to locally. The command to run: `./swanky-node --dev --tmp`
2. Follow the instructions on [trappist](https://github.com/paritytech/trappist) and run the [full_network.toml](https://github.com/paritytech/trappist/blob/main/zombienet/full_network.toml) network.

After the swanky node and the zombienet network is running you can run all the tests:

```
yarn test
```

The tests can take quite some time to run so, in case you want to run a specific test file, run the following command instead:

```
yarn test -- ./__tests__/test_file.test.ts
```
