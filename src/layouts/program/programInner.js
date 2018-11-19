import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'
import CurrencyFormat from 'react-currency-format';
import Challenge from '../challenge/Challenge'
import Apply from '../apply/Apply'
import Voting from '../voting/Voting'
import TCRUtil from '../tcrUtil/TCRUtil'
import OwnerTool from '../ownerTool/OwnerTool'

class ProgramInner extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    var initialState = {bboAmount:0, submiting:false};
    this.account = this.props.accounts[0];
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.bboBalanceKey = this.contracts['BBOTest'].methods['balanceOf'].cacheCall(...[this.account])
    this.bboHoldKey = this.contracts.BBOHoldingContract.methods['holdBalance'].cacheCall({from:this.account})
    this.state = initialState;
    this.Utils = context.drizzle.web3.utils;
    this.context = context;

    //console.log('this.bboHoldKey', this.Utils.hexToNumberString (this.bboHoldKey));
    // this.contracts['BBTCRHelper'].address =  '0xee6004216682e3e0eb7611fc234e13a967461f2b';
    // this.contracts['BBUnOrderedTCR'].address =  '0x9ec9bb2775c37730bbd7ed203fe3e8e73d6dfc23';

    //console.log('paramTCR', this.contracts['BBTCRHelper'].methods['owner'].cacheCall());
    // console.log('this.paramTCR',this.paramTCR);
    //this.contracts['BBTCRHelper']['getListParamsUnOrdered'][this.paramTCR].value;

   
    
  }

  async getParams() {

    let paramTCR = await this.contracts.BBTCRHelper.methods.getListParamsUnOrdered(10).call();
    this.context.paramTCR = paramTCR;
  }
  
 
  async handleSubmit() {
    // check allowance

    console.log('handleSubmit ....')
    if(this.state['bboAmount']>0){
      if(this.state['submiting'])
        return;
      this.setState({'submiting':true});
      var allowance = await this.contracts['BBOTest'].methods.allowance(this.props.accounts[0], this.contracts.BBOHoldingContract.address).call();
      //var allowance = this.props.contracts['BBOTest']['allowance'][this.bboAllowanceKey].value;
      console.log(allowance);
      var that = this;
      if(allowance > 0){
        if(this.context.drizzle.web3.utils.fromWei(allowance, 'ether') == this.state['bboAmount']){
         return this.contracts.BBOHoldingContract.methods['depositBBO'].cacheSend(...[]);
        }else{
          // todo set allowance to 0
          
          let otx = this.contracts.BBOTest.methods.approve(this.contracts.BBOHoldingContract.address, 0).send();
          setTimeout(function(){
            that.contracts.BBOTest.methods.approve(that.contracts.BBOHoldingContract.address,  that.context.drizzle.web3.utils.toWei(that.state['bboAmount'], 'ether')).send();
            setTimeout(function(){
                that.setState({'submiting':false});
                 
            }, 5000);
          }, 5000);
        }
        console.log('here 1');
      }else{
        // do approve
        
          let otx2 = this.contracts.BBOTest.methods.approve(this.contracts.BBOHoldingContract.address, this.context.drizzle.web3.utils.toWei(this.state['bboAmount'], 'ether')).send()
          setTimeout(function(){
            that.setState({'submiting':false});
            }, 5000);
          
      }
    }else{
      alert('BBO Amount must be greater 0');
    }
  }


  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }



  render() {
    var bboBalance = 0;
    var bboHoldBalance = 0;
    if(this.account != this.props.accounts[0]){
      this.account = this.props.accounts[0]
      this.bboBalanceKey = this.contracts['BBOTest'].methods['balanceOf'].cacheCall(...[this.account])
      this.bboHoldKey = this.contracts.BBOHoldingContract.methods['holdBalance'].cacheCall({from:this.account})
      this.paramTCR =  this.contracts['BBTCRHelper'].methods['getListParamsUnOrdered'].cacheCall(this.Utils.toHex(10));

    }else{
      if(this.bboBalanceKey in this.props.contracts['BBOTest']['balanceOf']) {
        bboBalance = this.props.contracts['BBOTest']['balanceOf'][this.bboBalanceKey].value;
        bboBalance = this.context.drizzle.web3.utils.fromWei(bboBalance,'ether');
      }
      if(this.bboHoldKey in this.props.contracts.BBOHoldingContract['holdBalance']) {
        bboHoldBalance = this.props.contracts.BBOHoldingContract['holdBalance'][this.bboHoldKey].value;
        //console.log('this.bboHoldKey',this.bboHoldKey);

        //console.log('bboHoldBalance',this.props.contracts.BBOHoldingContract['holdBalance'][this.bboHoldKey]);

        bboHoldBalance = this.context.drizzle.web3.utils.fromWei(bboHoldBalance,'ether');
      }

     // console.log(this.props.contracts.BBTCRHelper['getListParamsUnOrdered']);

      // if(this.paramTCR in this.props.contracts.BBTCRHelper['getListParamsUnOrdered']) {
      //   //console.log('this.paramTCR ',this.paramTCR );
      //   //var nnn = this.props.contracts.BBTCRHelper['getListParamsUnOrdered'][this.paramTCR];
      //   //console.log('aaaaaaa',nnn);

      // }
    }
    
   
    return (
      <main className="container">
        <div className="">
          <div className="pure-u-1-1 header">
          <h1 className = "newstype">TCR</h1>
          
          </div>
           <Apply></Apply>
           <Challenge></Challenge>
           <Voting></Voting>
           <TCRUtil></TCRUtil>
           <OwnerTool></OwnerTool> 
        </div>
      </main>
    )
  }
}

ProgramInner.contextTypes = {
  drizzle: PropTypes.object
}
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts
  }
}

export default drizzleConnect(ProgramInner, mapStateToProps)
