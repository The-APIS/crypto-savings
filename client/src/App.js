import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import comptrollerAbi from "./comptrollerAbi.json";
import cETHAbi from "./cETHAbi.json";
import cTokenAbi from "./cTokenAbi.json"

import "./App.css";

class App extends Component {
  state = { loaded:false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      //rinkeby testnet contracts
      this.comptrollerInstance = new this.web3.eth.Contract(comptrollerAbi,"0x2eaa9d77ae4d8f9cdd9faacd44016e746485bddb");
      this.cDAIInstance = new this.web3.eth.Contract(cTokenAbi,"0x6d7f0754ffeb405d23c51ce938289d4835be3b14");
      this.cETHInstance = new this.web3.eth.Contract(cETHAbi,"0xd6801a1dffcd0a410336ef88def4320d6df1883e");
      this.cTokenAddresses = ["0x6d7f0754ffeb405d23c51ce938289d4835be3b14","0xd6801a1dffcd0a410336ef88def4320d6df1883e"];
      this.enterMarket();
      this.mintCEth();
      //this.mintCToken(this.cDAIInstance, 4*1e16);
      this.redeemCEth(4*1e15);
      this.setState({loaded:true});
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  enterMarket = async () => {
    const errorCode = await this.comptrollerInstance.methods.enterMarkets(this.cTokenAddresses).send({from: this.accounts[0]});
    console.log("error code is: ");
    console.log(errorCode);
    const markets = await this.comptrollerInstance.methods.getAssetsIn(this.accounts[0]).call();
    this.setState({marketAccounts:markets});
    console.log("market is ");
    console.log(markets);
  };

  mintCEth = async () => {
    const errorCode = await this.cETHInstance.methods.mint().send({from: this.accounts[0], value: (5*1e16)});
    console.log("Minted result: ");
    console.log(errorCode);
    const balance = await this.cETHInstance.methods.balanceOfUnderlying(this.accounts[0]).call();
    console.log("new balance");
    console.log(balance/1e18);
  };

  mintCToken = async (cToken,amount) => {
    //approve before minting
    const errorCode = await cToken.methods.mint(amount).send({from: this.accounts[0]});
    console.log("Minted result: ");
    console.log(errorCode);
  };

  redeemCEth = async (amount) => {
    const errorCode = await this.cETHInstance.methods.redeemUnderlying(amount).send({from: this.accounts[0]});
    console.log("Redeem result: ");
    console.log(errorCode);
  };

  redeemCToken = async (cToken, amount) => {
    const errorCode = await cToken.methods.redeemUnderlying(amount).send({from: this.accounts[0]});
    console.log("Redeem result: ");
    console.log(errorCode);
  };

  balanceOfCEth = async () => {
    const balance = await this.cETHInstance.balanceOfUnderlying(this.accounts[0]).call();
    console.log("new balance of cEth");
    console.log(balance/1e18);
  }

  balanceOfCToken = async (cToken) => {
    const balance = await cToken.balanceOfUnderlying(this.accounts[0]).call();
    console.log("new balance of token");
    console.log(balance/1e18);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Compound Dashboard</h1>
        <label>Total Markets entered : {this.state.marketAccounts}</label>
        <div>
        var array = {this.state.marketAccounts};
        
        </div>
      </div>
    );
  }
}

export default App;
