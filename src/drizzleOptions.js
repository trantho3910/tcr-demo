import BBOHoldingContract from './../build/contracts/BBOHoldingContract.json'
import TutorialToken from './../build/contracts/BBOTest.json'
import BBTCRHelper from './../build/contracts/BBTCRHelper.json'
import BBUnOrderedTCR from './../build/contracts/BBUnOrderedTCR.json'


const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    BBOHoldingContract,
    TutorialToken,
    BBTCRHelper,
    BBUnOrderedTCR
  ],
  events: {
  },
  polls: {
    accounts: 1500
  },
  

}
console.log(drizzleOptions.contracts);


export default drizzleOptions