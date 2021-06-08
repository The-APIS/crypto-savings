import React from 'react';

const NavContext = React.createContext({
  navValue: "withdraw",
  setNavValue: () => {}
});


export {NavContext}
