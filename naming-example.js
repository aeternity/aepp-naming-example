const {Universal} = require('@aeternity/aepp-sdk');

const main = async (name) => {

  const publicKey = 'ak_sToLENWScQXMjVwCBfQebwzp8RqDi8DHrvfEQqhEgUr552X4V';

  const client = await Universal({
    url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    keypair: {
        publicKey: publicKey,
        secretKey: '0e0b5cc0106b840eaafee695bd23261eea0bd6df483086bdd5bcf909ac00925e72948b903ffd72776f365ecff7e166fb71f3958487ffbb4ff8a6699a0122e063'
    },
    networkId: 'ae_uat', //replace with ae_mainnet for mainnet
    nativeMode: true
  });

  const query = await client.aensQuery(name);
  console.log(query);

  const preclaim = await client.aensPreclaim(name);
  console.log(preclaim);

  const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
  console.log(claim);

  const update = await client.aensUpdate(claim.id, publicKey);
  console.log(update);
};

main('wesdsfs.test');
