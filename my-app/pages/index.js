import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal  from 'web3modal'
import { BigNumber, Contract, utils,providers } from 'ethers'
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from '../constants'

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected,setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokenMinted, setTokenMinted] = useState(zero);
  const [balanceOfL3padTokens,setBalanceOfL3padTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading,setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);

  const connectWallet = async () =>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true)
    }catch(error){
      console.log(error)
    }
  }

  const getProviderOrSigner = async (needSigner = false) =>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if(chainId !== 5){
      windows.alert("Change the network to goerli");
      throw new Error("Change network to goerli");
    }

    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getTokensToBeClaimed = async () =>{
    try{
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if(balance === zero){
        setTokensToBeClaimed(zero)
      }else{
        var amount = 0;
        for(var i=0; i<balance;i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address,1);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          if(!claimed){
            amount++
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount))
      }
    }catch(error){
      console.log(error)
      setTokensToBeClaimed(zero)
    }
  }
  const getBalanceOfL3padTokens = async() =>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfL3padTokens(balance)
    }catch(error){
      console.log(error)
    }
  }

  const getTotalTokensMinted = async() =>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokensMinted = await tokenContract.totalSupply();
      setTokenMinted(_tokensMinted);
    }catch(error){
      console.log(error)
    }
  }

  const mintL3padToken = async(amount)=>{
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001*amount
      const tx = await tokenContract.mint(amount,{
        value: utils.parseEther(value.toString())
      });

      setLoading(true)
      await tx.wait();
      setLoading(false);
      window.alert("Mint Successful");

      await getBalanceOfL3padTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();

    }catch(error){
      console.log(error)
    }
  }

  const claimL3padTokens = async () => {
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('Claim Successful');

      await getBalanceOfL3padTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    }catch(error) {
      console.log(error)
    }
  }

  const renderButton = () => {
    if(loading){
      return <div>
        <button className={styles.button}>Loading...</button>
      </div>
    }
    if(tokensToBeClaimed > 0){
      return(
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed
          </div>
          <button className={styles.button} onClick={claimL3padTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }
    return(
      <div style={{display: "flex-col"}}>
        <div style={{display:"flex",flexDirection:"column",rowGap:"5px"}}>
          <input type="number" placeholder='Amount of Tokens' className={styles.input} onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))}/>
          <button className={styles.button} disabled={!(tokenAmount>0)} onClick={()=> mintL3padToken(tokenAmount)}>
            Mint Tokens
          </button>
        </div>
      </div>
    )
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
      getBalanceOfL3padTokens();
      getTotalTokensMinted();
      getTokensToBeClaimed();
    }
  },[walletConnected])

  return (
    <div>
      <Head>
        <title>L3pad ICO</title>
        <meta name='description' content='ICO-dApp'/>
        <link rel='icon' href='./favicon.ico'/>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to L3pad Inc. ICO
          </h1>
          <div className={styles.description}>
            You can claim or mint L3pad(LPD) Tokens here
          </div>
          {
            walletConnected ?
            <div>
              <div className={styles.description}>
                You've minted {utils.formatEther(balanceOfL3padTokens)} L3pad Tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokenMinted)}/10000 have been minted
              </div>
              {renderButton()}
            </div>
              :
            <button className={styles.button} onClick={connectWallet}>
              Connect Wallet
            </button>
          }
        </div>
        <div>
           <img className={styles.image} src="/ico.png"/>
        </div>
      </div>
    </div>
  )
}
