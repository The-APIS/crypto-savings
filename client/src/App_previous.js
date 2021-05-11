import React, { Component } from "react";
import SDK from "./SDK/compoundSDK.js";
import log from 'loglevel';
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
        `Failed to load web3, accounts, or contract. Check log for details.`,
      );
      log.error(error);
    }
  };

  handleInputChange= (event)=>{
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]:value
    });
 }

  handleSubmit = async() => {
    await this.sdk.invest(this.state.tokenName,(this.state.tokenInvestAmount*1e18).toString());
  }

  handleSubmitWithdraw = async() => {
    await this.sdk.withdraw(this.state.tokenName,(this.state.tokenWithdrawAmount*1e18).toString());
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
