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
        let paramTCR = await this.contracts.BBTCRHelper.methods.getListParamsUnOrdered(10).call();
        console.log('minStake',paramTCR.minStake);
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
        var allowance = await this.BBOInstance.methods.allowance(this.props.accounts[0], this.BBUnOrderedTCRInstance.address).call();
        console.log('allowance',allowance);

        this.BBOInstance.methods.approve(this.BBUnOrderedTCRInstance.address, 0).send();
        setTimeout(function () {
            let bboAmount = that.state['bboAmount'];
            that.BBOInstance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei(bboAmount, 'ether')).send();
            setTimeout(function () {
                let itemHash = that.state['itemHash'];
                let dataHash = that.state['dataHash'];
                console.log('itemHash', itemHash);
                console.log('dataHash', dataHash);                                
                that.BBUnOrderedTCRInstance.methods.apply(10, that.Utils.toWei(bboAmount, 'ether'),that.Utils.toHex(itemHash),that.Utils.toHex(dataHash)).send();
                that.setState({
                    'submiting': false
                });

            }, 5000);
        }, 5000);


    }

    render() {
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