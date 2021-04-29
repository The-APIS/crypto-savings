import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import comptrollerAbi from "./comptrollerAbi.json";
import cETHAbi from "./cETHAbi.json";
import cTokenAbi from "./cTokenAbi.json"

import "./App.css";

class App extends Component {
  state = { loaded:false , marketAccounts:[], tokenName:"", tokenInvestAmount:0,tokenWithdrawAmount:0};

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
      this.cBATInstance = new this.web3.eth.Contract(cTokenAbi,"0xebf1a11532b93a529b5bc942b4baa98647913002");
      this.cREPInstance = new this.web3.eth.Contract(cTokenAbi,"0xebe09eb3411d18f4ff8d859e096c533cac5c6b60");
      this.cUSDCInstance = new this.web3.eth.Contract(cTokenAbi,"0x5b281a6dda0b271e91ae35de655ad301c976edb1");
      this.cUSDTInstance = new this.web3.eth.Contract(cTokenAbi,"0x2fb298bdbef468638ad6653ff8376575ea41e768");
      this.cWBTCInstance = new this.web3.eth.Contract(cTokenAbi,"0x0014f450b8ae7708593f4a46f8fa6e5d50620f96");
      this.cZRXInstance = new this.web3.eth.Contract(cTokenAbi,"0x52201ff1720134bbbbb2f6bc97bf3715490ec19b");
      this.cETHInstance = new this.web3.eth.Contract(cETHAbi,"0xd6801a1dffcd0a410336ef88def4320d6df1883e");
      this.cTokenAddresses = [this.cDAIInstance.options.address,this.cBATInstance.options.address,this.cREPInstance.options.address,this.cUSDCInstance.options.address,this.cUSDTInstance.options.address,this.cWBTCInstance.options.address,this.cZRXInstance.options.address,this.cETHInstance.options.address];
      //this.enterMarket();
      //this.mintCEth();
      //this.mintCToken(this.cDAIInstance, 4*1e16);
      //this.redeemCEth(4*1e15);
      //this.balanceOfCEth();
      //console.log(this.cBATInstance.symbol);
      const markets = await this.comptrollerInstance.methods.getAssetsIn(this.accounts[0]).call();
      console.log(markets.length);
      if(markets.length<8){
        this.enterMarket()
        console.log("market not fully loaded");
      }
      this.setState({marketAccounts:markets});
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
    if(this.state.tokenName==="ETH"){
      await this.enterMarket();
      const amount = (this.state.tokenInvestAmount*1e18).toString();
      await this.balanceOfCEth();
      console.log("Amount for minting is "+amount);
      await this.mintCEth(amount);
      await this.balanceOfCEth();
    }
    alert("Investment Successfull");
  }

  handleSubmitWithdraw = async() => {
    if(this.state.tokenName==="ETH"){
      //await this.enterMarket();
      const amount = (this.state.tokenWithdrawAmount*1e18).toString();
      await this.balanceOfCEth();
      console.log("Amount for redeeming is "+amount);
      await this.redeemCEth(amount);
      await this.balanceOfCEth();
    }
    alert("Withdraw Successfull");
  }

  handleSubmitMax = async() => {
    if(this.state.tokenName==="ETH"){
      //await this.enterMarket();
      const maxBalance = await this.cETHInstance.methods.balanceOfUnderlying(this.accounts[0]).call();
      this.setState({tokenWithdrawAmount:(maxBalance/1e18)});
    }
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
