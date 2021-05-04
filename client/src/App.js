import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import comptrollerAbi from "./comptrollerAbi.json";
import cETHAbi from "./cETHAbi.json";
import cTokenAbi from "./cTokenAbi.json";
import SDK from "./SDK/compoundSDK.js";

import "./App.css";
class SDK2{
  init = async()=>{
    // Get network provider and web3 instance.
    this.web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    this.accounts = await this.web3.eth.getAccounts();

    // Get the contract instance.
    this.networkId = await this.web3.eth.net.getId();

    this.cERC20 = [
      {name:"DAI", address: "0x6d7f0754ffeb405d23c51ce938289d4835be3b14"},
      {name:"BAT", address: "0xebf1a11532b93a529b5bc942b4baa98647913002"},
      {name:"REP", address:"0xebe09eb3411d18f4ff8d859e096c533cac5c6b60"},
      {name:"USDC", address:"0x5b281a6dda0b271e91ae35de655ad301c976edb1"},
      {name:"USDT", address:"0x2fb298bdbef468638ad6653ff8376575ea41e768"},
      {name:"WBTC", address:"0x0014f450b8ae7708593f4a46f8fa6e5d50620f96"},
      {name:"ZRX", address:"0x52201ff1720134bbbbb2f6bc97bf3715490ec19b"}
    ];
    
    this.cERC20.map(object=>{
      object.instance = new this.web3.eth.Contract(cTokenAbi,object.address);
    });
    console.log(this.cERC20);
   
  }
}
class App extends Component {
  state = { loaded:false , marketAccounts:[], tokenName:"", tokenInvestAmount:0,tokenWithdrawAmount:0};

  componentDidMount = async () => {
    try {
      this.sdk= new SDK();
      await this.sdk.init();
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

  mintCEth = async (amount) => {
    const errorCode = await this.cETHInstance.methods.mint().send({from: this.accounts[0], value: amount});
    console.log("Minted result: ");
    console.log(errorCode);
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
    const balance = await this.cETHInstance.methods.balanceOfUnderlying(this.accounts[0]).call();
    console.log("balance of cEth");
    console.log(balance/1e18);
  }

  balanceOfCToken = async (cToken) => {
    const balance = await cToken.methods.balanceOfUnderlying(this.accounts[0]).call();
    console.log("balance of token");
    console.log(balance/1e18);
  }

  handleInputChange= (event)=>{
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]:value
    });
 }

  handleSubmit = async() => {
    await this.sdk.Invest(this.state.tokenName,(this.state.tokenInvestAmount*1e18).toString());
    // if(this.state.tokenName==="ETH"){
    //   await this.enterMarket();
    //   const amount = (this.state.tokenInvestAmount*1e18).toString();
    //   await this.balanceOfCEth();
    //   console.log("Amount for minting is "+amount);
    //   await this.mintCEth(amount);
    //   await this.balanceOfCEth();
    // }
    // alert("Investment Successfull");
  }

  handleSubmitWithdraw = async() => {
    await this.sdk.Withdraw(this.state.tokenName,(this.state.tokenWithdrawAmount*1e18).toString());
    // if(this.state.tokenName==="ETH"){
    //   //await this.enterMarket();
    //   const amount = (this.state.tokenWithdrawAmount*1e18).toString();
    //   await this.balanceOfCEth();
    //   console.log("Amount for redeeming is "+amount);
    //   await this.redeemCEth(amount);
    //   await this.balanceOfCEth();
    // }
    // alert("Withdraw Successfull");
  }

  handleSubmitMax = async() => {
    const maxBalance = await this.sdk.getMaxWithdraw(this.state.tokenName);
    this.setState({tokenWithdrawAmount:(maxBalance/1e18)});
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Titans Finance</h1>
        <label>Total Markets entered :</label>
        <div>
        <ul>
                {this.state.marketAccounts.map(function(marketAddress, index){
                    return <li key={ index }>{marketAddress}</li>;
                  })}
        </ul>
        </div>
        <div>
          <h2>Invest Crypto</h2>
          <label htmlFor="tokenName">Choose a crypto:</label>
          <select name="tokenName" id="tokenName" onChange={this.handleInputChange}>
            <option value="ETH" selected></option>
            <option value="ETH">ETH</option>
            <option value="ETH">ETH</option>
          </select><br></br>
          <label>Amount</label><input type="text" name="tokenInvestAmount" onChange={this.handleInputChange}></input>
          <br></br>
          <button type="button" onClick={this.handleSubmit}>Invest</button>
          
        </div>
        <div>
          <h2>Withdraw Invested Crypto</h2>
          <label htmlFor="tokenName">Choose a crypto:</label>
          <select name="tokenName" id="tokenName" onChange={this.handleInputChange}>
            <option value="ETH" selected></option>
            <option value="ETH">ETH</option>
            <option value="ETH">ETH</option>
          </select><br></br>
          <label>Amount</label><input type="text" name="tokenWithdrawAmount" onChange={this.handleInputChange} value={this.state.tokenWithdrawAmount}></input>
          <button type="button" onClick={this.handleSubmitMax}>Max</button>
          <br></br>
          <button type="button" onClick={this.handleSubmitWithdraw}>Withdraw</button>
          
        </div>
      </div>
    );
  }
}

export default App;
