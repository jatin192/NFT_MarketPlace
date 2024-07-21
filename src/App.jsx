import './App.css';
import { ethers } from "ethers";
import ABI from './ABI.json';
import MetamaskInstallModal from "./components/MetamaskInstallModal";
import { useEffect, useState } from "react";
import Create_NFT from './components/Create_NFT';
import MarketPlace from './components/MarketPlace';
import Profile from './components/Profile';
import NFTPage from './components/NFTPage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";




function App() 
{

  let [account_i, set_account_func] = useState('');
  let [contract_i, set_contract_func] = useState(null);
  let [showMetamaskModal, setShowMetamaskModal] = useState(true);

  useEffect(() => {
    let wallet = async () => 
      {
        if (window.ethereum) {
          let provider_ = new ethers.providers.Web3Provider(window.ethereum);
          let chainId = await provider_.getNetwork().then(net => net.chainId);
          let Sepolia_Chain_ID = 11155111;                                         //  Sepolia network ID

          if (chainId !== Sepolia_Chain_ID)                                    
          {
            try 
            {
              await window.ethereum.request(
              {
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: ethers.utils.hexValue(Sepolia_Chain_ID) }],
              });
            } 
            catch (i) 
            {
                console.error("Error in switching to Sepolia network :", i);
            }
          }

          window.ethereum.on("chainChanged", () => window.location.reload());
          window.ethereum.on("accountsChanged", () => window.location.reload());

          await provider_.send("eth_requestAccounts", []);
          let signer_ = provider_.getSigner();
          let address_ = await signer_.getAddress();
          set_account_func(address_);

          let contract_instance = new ethers.Contract("0x179834b8fF7601391Ccc93857086fedaFDF42e82", ABI, signer_);
          set_contract_func(contract_instance);
        } 
        else 
        {
          setShowMetamaskModal(true);
        }
    }
    wallet();
  }, []);





  return (
    <Router>
      <>
        {showMetamaskModal && (<MetamaskInstallModal closeModal={() => setShowMetamaskModal(false)} />)}
        <Routes>
          <Route path="/" element={<MarketPlace contract={contract_i} />} />
          <Route path="/Profile" element={<Profile contract={contract_i} account={account_i} />} />
          <Route path="/nftPage/:tokenId" element={<NFTPage contract={contract_i} account={account_i} />} />
          <Route path="/Create_NFT" element={<Create_NFT contract={contract_i} />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
