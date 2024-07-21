import React from "react";
import './MetamaskInstallModal.css';
import metamask_icon from './metamask.svg'

function MetamaskInstallModal({ closeModal}) {
  let is_Android = /android/i.test(navigator.userAgent); //true for mobile
  return (
    <>
    {is_Android && 
    <div className="class_101">
      <div className="class_103">
        <h2>Install Metamask <img className="pc_metamask_icon_1" src = {metamask_icon} ></img></h2>
        <button className="class_100"><a href = "https://metamask.app.link/dapp/blockchain32.netlify.app" >Connect Metamask</a></button>
        <p>
          To use this NFT MarketPlace(dApp)
        </p>
        <ol>
          <li>Downlaod and Install the <a href ="https://play.google.com/store/apps/details?id=io.metamask">Metamask wallet</a> on your device</li> 
          {/* <li>Set up your Metamask wallet and connect to the <a href="https://medium.com/stakingbits/how-to-connect-polygon-mumbai-testnet-to-metamask-fc3487a3871f">Poygon Mumbai Test network.</a></li> */}
          <li>Set up your Metamask wallet and connect to the Ethereum Sepolia Test network.</li>
          <li>Reload this page after installing Metamask and then click on connect metamask</li>
        </ol>
        <button className="button_mc" onClick={closeModal}>Close</button>
         <p className="mobile_">Note: For optimal functionality and performance, we recommend accessing this DApp on a laptop or desktop computer, as certain features may not be fully compatible with mobile devices</p>
       
        
      </div>
    </div>}

      {!is_Android  &&  
      <div className="class_101">
      <div className="class_103">
        <h1>Install Metamask <img className="pc_metamask_icon" src = {metamask_icon} ></img></h1>
        <p>
          To use this NFT MarketPlace(dApp), you need to install Metamask.
          Follow these steps:
        </p>
        <ol>
          <li>Visit the Metamask website: <a href ="https://metamask.io/">https://metamask.io/</a></li>
          <li>Download and install the Metamask extension for your browser.</li>
          {/* <li>Set up your Metamask wallet and connect to the <a href="https://medium.com/stakingbits/how-to-connect-polygon-mumbai-testnet-to-metamask-fc3487a3871f">Poygon Mumbai Test network.</a></li> */}
          <li>Set up your Metamask wallet and connect to the Ethereum Sepolia Test network.</li>
          <li>Reload this page after installing Metamask.</li>
        </ol>
        <button className="button_mc" onClick={closeModal}>Close</button>
      </div>
    </div>}

    </>
  );
}

export default MetamaskInstallModal;


