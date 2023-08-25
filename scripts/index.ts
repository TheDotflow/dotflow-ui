const axios = require("axios");

const API_KEY = "b6c669d34069413ab246c1a03b2f1c12";
const apiUrl = 'https://polkadot.api.subscan.io/api/scan/extrinsics';

const endpoints = [
  'polkadot.api.subscan.io',
  'kusama.api.subscan.io',
  'darwinia.api.subscan.io',
  'assethub-polkadot.api.subscan.io',
  'assethub-kusama.api.subscan.io',
  'assethub-rococo.api.subscan.io',
  'acala.api.subscan.io',
  'acala-testnet.api.subscan.io',
  'alephzero.api.subscan.io',
  'altair.api.subscan.io',
  'astar.api.subscan.io',
  'bajun.api.subscan.io',
  'basilisk.api.subscan.io',
  'bifrost.api.subscan.io',
  'bifrost-kusama.api.subscan.io',
  'bifrost-testnet.api.subscan.io',
  'calamari.api.subscan.io',
  'centrifuge.api.subscan.io',
  'centrifuge-standalone-history.api.subscan.io',
  'chainx.api.subscan.io',
  'clover.api.subscan.io',
  'clv.api.subscan.io',
  'clover-testnet.api.subscan.io',
  'composable.api.subscan.io',
  'crab.api.subscan.io',
  'crust.api.subscan.io',
  'maxwell.api.subscan.io',
  'shadow.api.subscan.io',
  'dbc.api.subscan.io',
  'dock.api.subscan.io',
  'dolphin.api.subscan.io',
  'edgeware.api.subscan.io',
  'efinity.api.subscan.io',
  'encointer.api.subscan.io',
  'equilibrium.api.subscan.io',
  'genshiro.api.subscan.io',
  'humanode.api.subscan.io',
  'hydradx.api.subscan.io',
  'integritee.api.subscan.io',
  'interlay.api.subscan.io',
  'karura.api.subscan.io',
  'kintsugi.api.subscan.io',
  'khala.api.subscan.io',
  'krest.api.subscan.io',
  'kilt-testnet.api.subscan.io',
  'spiritnet.api.subscan.io',
  'litmus.api.subscan.io',
  'mangatax.api.subscan.io',
  'moonbase.api.subscan.io',
  'moonbeam.api.subscan.io',
  'moonriver.api.subscan.io',
  'nodle.api.subscan.io',
  'origintrail.api.subscan.io',
  'origintrail-testnet.api.subscan.io',
  'pangolin.api.subscan.io',
  'pangolin-parachain.api.subscan.io',
  'pangoro.api.subscan.io',
  'parallel.api.subscan.io',
  'parallel-heiko.api.subscan.io',
  'peaq-testnet.api.subscan.io',
  'phala.api.subscan.io',
  'picasso.api.subscan.io',
  'picasso-rococo.api.subscan.io',
  'pioneer.api.subscan.io',
  'polkadex.api.subscan.io',
  'polymesh.api.subscan.io',
  'polymesh-testnet.api.subscan.io',
  'plasm.api.subscan.io',
  'quartz.api.subscan.io',
  'reef.api.subscan.io',
  'robonomics.api.subscan.io',
  'rococo.api.subscan.io',
  'sakura.api.subscan.io',
  'shibuya.api.subscan.io',
  'shiden.api.subscan.io',
  'sora.api.subscan.io',
  'subspace.api.subscan.io',
  'stafi.api.subscan.io',
  'datahighway.api.subscan.io',
  'turing.api.subscan.io',
  'unique.api.subscan.io',
  'vara.api.subscan.io',
  'westend.api.subscan.io',
  'zeitgeist.api.subscan.io'
]

const requestData = {
  row: 50,
  page: 0,
  module: 'polkadotXcm',
  call: 'execute',
  // success: true
};

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
};

endpoints.forEach((endpoint) => {
  const url = `https://${endpoint}/api/scan/extrinsics`;

  console.log(url);
  axios.post(url, requestData, { headers })
    .then((response: any) => {
      console.log('Response:', response.data);
      if (response.data.data.count > 0) {
        console.log(endpoint);
        console.log(response.data.data.extrinsics);
      }
    })
    .catch((_error: any) => {
      //console.error('Error:', _error);
    });
});
