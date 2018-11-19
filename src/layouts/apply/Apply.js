import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'


class Apply extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleApply = this.handleApply.bind(this);
      this.getParams = this.getParams.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
    }

    async getParams () {
    }

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    async handleApply() {

        console.log('handleApply');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });

        let paramTCR = await this.contracts.BBTCRHelper.methods.getListParamsUnOrdered(10).call();
        console.log('minStake',paramTCR.minStake);
        
        var allowance = await this.BBOInstance.methods.allowance(this.props.accounts[0], this.BBUnOrderedTCRInstance.address).call();
        console.log('allowance',allowance);

        let bboAmount = that.state['bboAmount'];
        bboAmount = this.Utils.toWei(bboAmount, 'ether');
        console.log('bboAmount',bboAmount);

        let itemHash = that.state['itemHash'];
        let dataHash = that.state['dataHash'];

        console.log('itemHash', itemHash);
        console.log('dataHash', dataHash);   

        if(allowance > paramTCR.minStake && bboAmount >= paramTCR.minStake) {
            that.BBUnOrderedTCRInstance.methods.apply(10, bboAmount,that.Utils.sha3(itemHash), that.Utils.sha3(dataHash)).send();
            that.setState({
                'submiting': false
            });
            return;
        }

        if(bboAmount < paramTCR.minStake) {
            alert('BBO Amount must be greater 100');
            that.setState({
                'submiting': false
            });
            return;
        }
        
         
        this.BBOInstance.methods.approve(this.BBUnOrderedTCRInstance.address, 0).send();
        setTimeout(function () {
            
            that.BBOInstance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei('1000000', 'ether')).send();
            setTimeout(function () {
                                            
                that.BBUnOrderedTCRInstance.methods.apply(10, bboAmount,that.Utils.sha3(itemHash), that.Utils.sha3(dataHash)).send();
                that.setState({
                    'submiting': false
                });

            }, 5000);
        }, 5000);


    }

    render() {
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        return (
            <div className="container-fix-600">
            <h3 className = "newstype">You are about apply to ITEM</h3>
            <p>
            <input className="input-bbo" key="bboAmount" type="number" name="bboAmount" placeholder = "Amount BBO" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="itemHash" type="text" name="itemHash" placeholder = "Item Hash" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="dataHash" type="text" name="dataHash" placeholder = "Data Hash" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button" type="button" onClick={this.handleApply}>Apply</button>
            </p>
            
            <br/><br/>
          </div>
        );
    }
    
}

Apply.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(Apply, mapStateToProps)