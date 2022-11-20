import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal, { providers } from 'web3modal'
import { BigNumber, Contract, utils } from 'ethers'

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected,setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokenMinted, setTokenMinted] = useState(zero);
  const [balanceOfL3padTokens,setBalanceOfL3padTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero)

  const connectWallet = async() =>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true)
    } catch (error) {
      console.log(error)
    }
  }

  const getProviderOrSigner = async(needSigner = false)=>{
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

  const mintL3padToken = async(amount)=>{
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        
      )
    } catch (error) {
      console.log(error)
    }
  }
  const renderButton = () => {
    return(
      <div style={{display: "flex-col"}}>
        <div>
          <input type="number" placeholder='Amount of Tokens' onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))}/>
          <button className={styles.button} disabled={!(tokenAmount>0)} onClick={()=> mintL3padToken(tokenAmount)}>
            Mint Tokens
          </button>
        </div>
      </div>
    )
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current =  new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
    }
  },[])

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
      </div>
    </div>
  )
}
