import comptrollerAbi from "./abis/comptrollerAbi.json";
import cETHAbi from "./abis/cETHAbi.json";
import cTokenAbi from "./abis/cTokenAbi.json";
import getWeb3 from "./web3/getWeb3";
import Data from "./data.json";

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

    console.log("chain id is " + this.chainId);

    // Fetch data from json file (cERC20,cETH,comptroller) as per the newtwork id
    this.network = Data.Addresses.find((network) => {
      return (network.id === this.networkId && network.chainId === this.chainId);
    });
    console.log(this.network);
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

    const markets = await this.comptroller.instance.methods.getAssetsIn(this.accounts[0]).call();

    if (markets.length < 8) {
      this.enterMarket();
      console.log("market not fully loaded");
    }
  }

  enterMarket = async () => {
    const errorCode = await this.comptroller.instance.methods.enterMarkets(this.cTokenAddresses).send({ from: this.accounts[0] });
    console.log("error code is: ");
    console.log(errorCode);
    const markets = await this.comptroller.instance.methods.getAssetsIn(this.accounts[0]).call();
    //this.setState({marketAccounts:markets});
    console.log("market is ");
    console.log(markets);
  };

  mintCEth = async (amount) => {

    const errorCode = await this.cETH.instance.methods.mint().send({ from: this.accounts[0], value: amount });
    console.log("Minted result: ");
    console.log(errorCode);
  };

  mintCToken = async (cToken, amount) => {
    //approve before minting
    const errorCode = await this.cERC20.instance.methods.mint(amount).send({ from: this.accounts[0] });
    console.log("Minted result: ");
    console.log(errorCode);
  };

  redeemCEth = async (amount) => {
    const errorCode = await this.cETH.instance.methods.redeem(amount).send({ from: this.accounts[0] });
    console.log("Redeem result: ");
    console.log(errorCode);
  };

  redeemCToken = async (cToken, amount) => {
    const errorCode = await this.cERC20.instance.methods.redeemUnderlying(amount).send({ from: this.accounts[0] });
    console.log("Redeem result: ");
    console.log(errorCode);
  };

  balanceOfCEth = async () => {
    console.log(this.cETH.instance.methods);
    const balance = await this.cETH.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
    console.log("balance of cEth");
    console.log(balance / 1e18);
  }

  balanceOfCToken = async (cToken) => {
    const balance = await cToken.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
    console.log("balance of token");
    console.log(balance / 1e18);
  }

  supplyRateEth = async () => {
    const rate = await this.cETH.instance.methods.supplyRatePerBlock().call();
    console.log("supply rate of eth");
    console.log(rate);
  }

  supplyRateCToken = async (cToken) => {
    const rate = await cToken.instance.methods.supplyRatePerBlock().call();
    console.log("supply rate of eth");
    console.log(rate);
  }

  Invest = async (tokenName, amount) => {
    if (tokenName === "ETH") {
      //await this.enterMarket();
      //const amount = (this.state.tokenInvestAmount*1e18).toString();
      console.log("showing this");
      console.log(this);
      console.log(this.cTokenAddresses);
      await this.balanceOfCEth();
      console.log("Amount for minting is " + amount);
      await this.mintCEth(amount);
      await this.balanceOfCEth();
    }
    alert("Investment Successfull");
  }

  Withdraw = async (tokenName, amount) => {
    if (tokenName === "ETH") {
      //await this.enterMarket();
      //const amount = (this.state.tokenWithdrawAmount*1e18).toString();
      await this.balanceOfCEth();
      console.log("Amount for redeeming is " + amount);
      await this.redeemCEth(amount);
      await this.balanceOfCEth();
    }
    alert("Withdraw Successfull");
  }

  getMaxWithdraw = async (tokenName) => {
    if (tokenName === "ETH") {
      //await this.enterMarket();
      const maxBalance = await this.cETH.instance.methods.balanceOfUnderlying(this.accounts[0]).call();
      return maxBalance;
    }
  }
}
