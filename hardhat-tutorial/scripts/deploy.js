const {ethers} = require("hardhat");

const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS} = require("../constants")

async function main(){

  const l3padTokenContract = await ethers.getContractFactory("L3padToken");

  const deployL3padTokenContract = await l3padTokenContract.deploy(CRYPTO_DEVS_NFT_CONTRACT_ADDRESS);

  console.log(
    "L3pad Token Contract Address:",
    deployL3padTokenContract.address
  )
}

main().then(()=>process.exit(0)).catch((error)=>{
   console.log(error);
   process.exit(1);
})