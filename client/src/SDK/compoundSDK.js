import comptrollerAbi from "./abis/comptrollerAbi.json";
import cETHAbi from "./abis/cETHAbi.json";
import cTokenAbi from "./abis/cTokenAbi.json";
import getWeb3 from "./web3/getWeb3";
import Data from "./data.json";
import log from 'loglevel';

export default class SDK {

  init = async () => {
    // Get network provider and web3 instance.
    this.web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    this.accounts = await this.web3.eth.getAccounts();

    // Get the contract instance.
    this.networkId = await this.web3.eth.net.getId();

    // Get the chain ID

    this.chainId = await this.web3.eth.getChainId();

    log.log("chain id is " + this.chainId);

    // Fetch data from json file (cERC20,cETH,comptroller) as per the newtwork id
    this.network = Data.Addresses.find((network) => {
      return (network.id === this.networkId && network.chainId === this.chainId);
    });
    log.log(this.network);
    this.cERC20 = this.network.cERC20;
    this.cERC20.forEach(object => {
      object.instance = new this.web3.eth.Contract(cTokenAbi, object.address);
    });

    this.cTokenAddresses = this.cERC20.map(object => {
      return object.address;
    });
    this.cETH = this.network.cETH;
    this.cETH.instance = new this.web3.eth.Contract(cETHAbi, this.cETH.address);
    this.comptroller = this.network.comptroller;
    this.comptroller.instance = new this.web3.eth.Contract(comptrollerAbi, this.comptroller.address);
    this.markets = await this.comptroller.instance.methods.getAssetsIn(this.accounts[0]).call();
    if (this.markets.length < 8) {
      this.enterMarket();
      log.warn("market not fully loaded");
    }
    return this.markets;
  }

  getSupportedTokens = () =>{
    return this.cERC20;
  }
  
  enterMarket = async () => {
    const errorCode = await this.comptroller.instance.methods.enterMarkets(this.cTokenAddresses).send({ from: this.accounts[0] });
    log.log("error code is: ");
    log.log(errorCode);
    const markets = await this.comptroller.instance.methods.getAssetsIn(this.accounts[0]).call();
    //this.setState({marketAccounts:markets});
    log.log("market is ");
    log.log(markets);
  };

  mintCEth = async (amount) => {

    const errorCode = await this.cETH.instance.methods.mint().send({ from: this.accounts[0], value: amount });
    log.log("Minted result: ");
    log.log(errorCode);
  };

  mintCToken = async (cToken, amount) => {
    //approve before minting
    const errorCode = await cToken.instance.methods.mint(amount).send({ from: this.accounts[0] });
    log.log("Minted result: ");
    log.log(errorCode);
  };

  redeemCEth = async (amount) => {
    const errorCode = await this.cETH.instance.methods.redeemUnderlying(amount).send({ from: this.accounts[0] });
    log.log("Redeem result: ");
    log.log(errorCode);
  };

  redeemCToken = async (cToken, amount) => {
    const errorCode = await cToken.instance.methods.redeemUnderlying(amount).send({ from: this.accounts[0] });
    log.log("Redeem result: ");
    log.log(errorCode);
  };

  balanceOfCEth = async () => {
    log.log(this.cETH.instance.methods);
    const balance = await this.cETH.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
    log.log("balance of cEth");
    log.log(balance / 1e18);
  }

  balanceOfCToken = async (cToken) => {
    const balance = await cToken.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
    log.log("balance of token");
    log.log(balance / 1e18);
  }

  supplyRateEth = async () => {
    const rate = await this.cETH.instance.methods.supplyRatePerBlock().call();
    log.log("supply rate of eth");
    log.log(rate);
  }

  supplyRateCToken = async (cToken) => {
    const rate = await cToken.instance.methods.supplyRatePerBlock().call();
    log.log("supply rate of eth");
    log.log(rate);
  }

  invest = async (tokenName, amount) => {
    if (tokenName === "ETH") {
      log.log(await this.balanceOfCEth());
      log.log("Amount for minting is " + amount);
      await this.mintCEth(amount);
      log.log(await this.balanceOfCEth());
    }
    else{
      let token = this.cERC20.find((cERC20) => {
        return (cERC20.name === tokenName);
      });
      await this.mintCToken(token);
      await this.balanceOfCToken(token);
    }
    alert("Investment Successfull");
  }

  withdraw = async (tokenName, amount) => {
    if (tokenName === "ETH") {
      log.log(await this.balanceOfCEth());
      log.log("Amount for redeeming is " + amount);
      await this.redeemCEth(amount);
      await this.balanceOfCEth();
    }
    else{
      let token = this.cERC20.find((cERC20) => {
        return (cERC20.name === tokenName);
      });
      await this.redeemCToken(token);
      await this.balanceOfCToken(token);
    }
    alert("Withdraw Successfull");
  }

  getMaxWithdraw = async (tokenName) => {
    if (tokenName === "ETH") {
      const maxBalance = await this.cETH.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
      return maxBalance;
    }
    else{
      let token = this.cERC20.find((cERC20) => {
        return (cERC20.name === tokenName);
      });
      const maxBalance = await token.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
      return maxBalance;
    }
  }
}
