const path = require("path");
const { projectId, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    rinkeby:{
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${projectId}`),
      network_id: 4,       
      gas: 5500000,        
      confirmations: 1,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true 
    }
  },
  compilers: {
    solc: {
      version: "^0.5"
    }
 }
};
