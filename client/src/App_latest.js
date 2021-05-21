/* eslint-disable react/react-in-jsx-scope */
import React, {useState, useEffect} from 'react';
import './App.css';
import SDK from "./SDK/compoundSDK.js";
import log from 'loglevel';

function App() {
  let sdk;
  const [state, setstate] = useState({loaded:false , marketAccounts:[], tokenName:"", tokenInvestAmount:0,tokenWithdrawAmount:0});

  function handleInputChange(event){
    log.warn("entered method");
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    setstate({
      [name]:value
    });
  }

  async function handleSubmit(){
    await sdk.invest(state.tokenName,(state.tokenInvestAmount*1e18).toString());
  }

  async function handleSubmitWithdraw(){
    await sdk.withdraw(state.tokenName,(state.tokenWithdrawAmount*1e18).toString());
  }

  async function handleSubmitMax(){
    const maxBalance = await sdk.getMaxWithdraw(state.tokenName);
    setstate({tokenWithdrawAmount:(maxBalance/1e18)});
  }

  useEffect(() => {
    async function fetchSDK() {
      try {
        sdk= new SDK();
        
        log.log(sdk);
        await sdk.init();
        setstate({loaded:true});
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        log.error(error);
      }
    }
    fetchSDK();
    
    return () => {
      
    }
  },[]);

  

  if (!state.loaded) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
      <h1>Titans Finance</h1>
      <label>Total Markets entered :</label>
      <div>
        
      </div>
      <div>
        <h2>Invest Crypto</h2>
        <label htmlFor="tokenName">Choose a crypto:</label>
        <select name="tokenName" id="tokenName" onChange={handleInputChange}>
          <option value="ETH" selected></option>
          <option value="ETH">ETH</option>
          <option value="ETH">ETH</option>
        </select><br></br>
        <label>Amount</label><input type="text" name="tokenInvestAmount" onChange={handleInputChange}></input>
        <br></br>
        <button type="button" onClick={handleSubmit}>Invest</button>
        
      </div>
      <div>
        <h2>Withdraw Invested Crypto</h2>
        <label htmlFor="tokenName">Choose a crypto:</label>
        <select name="tokenName" id="tokenName" onChange={handleInputChange}>
          <option value="ETH" selected></option>
          <option value="ETH">ETH</option>
          <option value="ETH">ETH</option>
        </select><br></br>
        <select name="tokenName" id="tokenName" onChange={handleInputChange}>
        
        </select><br></br>
        <label>Amount</label><input type="text" name="tokenWithdrawAmount" onChange={handleInputChange} value={state.tokenWithdrawAmount}></input>
        <button type="button" onClick={handleSubmitMax}>Max</button>
        <br></br>
        <button type="button" onClick={handleSubmitWithdraw}>Withdraw</button>
        
      </div>
    </div>
  );
}

export default App;
