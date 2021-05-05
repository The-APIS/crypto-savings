import React, { Component } from "react";
import SDK from "./SDK/compoundSDK.js";

import "./App.css";

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
