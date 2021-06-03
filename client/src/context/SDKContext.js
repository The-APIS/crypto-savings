import React from 'react';

const SDKContext = React.createContext();

const SupportedTokensContext = React.createContext({
  supportedTokens: [],
  setsupportedTokens: () => {}
});

export {SDKContext, SupportedTokensContext}