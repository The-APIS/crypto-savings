import React, {useState, useEffect, useContext} from 'react';

import SDK from '@dapis/sdk/src/compoundSDK';

import log from 'loglevel';
import {NavContext} from './context/navContext';
import {SDKContext, SupportedTokensContext} from './context/SDKContext.js';

const InvestLayout = ()=>{

  const sdk = useContext(SDKContext);
  const tokens = useContext(SupportedTokensContext);
  const [tokenName, settokenName] = useState("ETH");
  const [tokenAmount, settokenAmount] = useState(0);

  async function handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if(name === "tokenName"){
      settokenName(value);
    }
    else{
      settokenAmount(value);
    }
  }

  async function handleSubmit(){
    await sdk.invest(tokenName,(tokenAmount*1e18).toString());
  }
  return(
      <div>
      <h2>Invest Crypto</h2>
      <label htmlFor="tokenName">Choose a crypto:</label>
      <select name="tokenName" id="tokenName" onChange={handleInputChange}>
        <option value="ETH" selected>ETH</option>
        {tokens.map((token) => (
          <option value={token.name} key={token.name}>{token.name}</option>
        ))}
      </select><br></br>
      <label>Amount</label><input type="text" name="tokenInvestAmount" onChange={handleInputChange}></input>
      <br></br>
      <button type="button" onClick={handleSubmit}>Invest</button>
      </div>
  );
}

const WithdrawLayout = ()=> {

  const sdk = useContext(SDKContext);
  const tokens = useContext(SupportedTokensContext);
  const [tokenName, settokenName] = useState("ETH");
  const [tokenAmount, settokenAmount] = useState(0);
  
  async function handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if(name === "tokenName"){
      settokenName(value);
    }
    else{
      settokenAmount(value);
    }
  }

  async function handleSubmit(){
    await sdk.withdraw(tokenName,(tokenAmount*1e18).toString());
  }

  async function handleSubmitMax(){
    const maxBalance = await sdk.getBalance(tokenName);
    settokenAmount(maxBalance/1e18);

  }

  return(
    <div>
      <h2>Withdraw Invested Crypto</h2>
      <label htmlFor="tokenName">Choose a crypto:</label>
      <select name="tokenName" id="tokenName" onChange={handleInputChange}>
        <option value="ETH" selected >ETH</option>
        {tokens.map((token) => (
          <option value={token.name} key={token.name}>{token.name}</option>
        ))}
      </select><br></br>
      <label>Amount</label><input type="text" name="tokenWithdrawAmount" value={tokenAmount} onChange={handleInputChange} ></input>
      <button type="button" onClick={handleSubmitMax}>Max</button>
      <br></br>
      <button type="button" onClick={handleSubmit}>Withdraw</button>
    </div>
  )
}

const BalanceLayout = ()=> {

  const sdk = useContext(SDKContext);
  const tokens = useContext(SupportedTokensContext);
  const [tokenName, settokenName] = useState("ETH");
  const [tokenAmount, settokenAmount] = useState();

  async function handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    await settokenName(value);
  }
  async function setBal(){
    const maxBalance = await sdk.getBalance(tokenName);
    settokenAmount(maxBalance/1e18);
  }

  useEffect(() => {
    if(!(tokenAmount===undefined))
    alert('Balance of ' +tokenName+' is ' +tokenAmount);
    return () => {
      
    }
  }, [tokenAmount,tokenName])

  return(
    <div>
      <h2>Balance</h2>
      <label htmlFor="tokenName">Choose a crypto:</label>
      <select name="tokenName" id="tokenName" onChange={handleInputChange}>
        <option value="ETH">ETH</option>
        {tokens.map((token) => (
          <option value={token.name} key={token.name}>{token.name}</option>
        ))}
      </select><br></br>
      <button type="button" onClick={setBal}>Get Balance</button><br></br>
    </div>
  )
}

function CryptoSavings() {
  const [loaded, setloaded] = useState(false);
  const [supportedTokens, setsupportedTokens] = useState([])
  const [navValue, setNavValue] = useState('invest'); 
  var [sdk, setsdk] = useState(new SDK());
  async function fetchSDK() {
    try {
      var market = await sdk.init();
      market = sdk.getSupportedTokens();
      setsupportedTokens(market);
      setloaded(true);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      log.error(error);
    }
  }

  useEffect(() => {
    fetchSDK();
    
    return () => {
      
    }
  }, [fetchSDK]);

  if (!loaded) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div>
      <SDKContext.Provider value={sdk}>
      <SupportedTokensContext.Provider value={supportedTokens}>
      <NavContext.Provider value={navValue}>
      <div>
        <button onClick={ ()=>setNavValue('invest')}>Invest</button>
        <button onClick={ ()=>setNavValue('withdraw')}>Withdraw</button>
        <button onClick={ ()=>setNavValue('balance')}>Balance</button>
      </div>
      <h1>Titans Finance</h1>
      <NavContext.Consumer>
      {value => {if(value==='invest') 
                return <InvestLayout /> 
                else if(value==='withdraw') 
                return <WithdrawLayout/>
                else
                return <BalanceLayout/>}}
      </NavContext.Consumer>
      </NavContext.Provider>
      </SupportedTokensContext.Provider>
      </SDKContext.Provider>
    </div>
  );
}

export default CryptoSavings;


