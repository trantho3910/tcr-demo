import Program from './program'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    BBOHoldingContract: state.contracts.BBOHoldingContract,
    BBTCRHelper: state.contracts.BBTCRHelper,
    BBUnOrderedTCR: state.contracts.BBUnOrderedTCR,
    BBOTest: state.contracts.BBOTest,
    drizzleStatus: state.drizzleStatus
  }
}

const ProgramContainer = drizzleConnect(Program, mapStateToProps);

export default ProgramContainer