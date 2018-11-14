import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'


class Voting extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleChallenge = this.handleChallenge.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleGetStage = this.handleGetStage.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
    
    }

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    async handleGetStage() {
        let itemHash = this.state['itemHash'];
        console.log('itemHash ',itemHash);
        let stage = await this.contracts.BBTCRHelper.methods.getItemStage(10, this.Utils.sha3(itemHash)).call();
        console.log('stage ', stage);

        let paramTCR = await this.contracts.BBTCRHelper.methods.getListParamsUnOrdered(10).call();
        console.log('minStake',paramTCR);

    }

    async handleChallenge() {
        console.log('handleChallenge');
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
            that.BBOInstance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei('1000', 'ether')).send();
            setTimeout(function () {
                let itemHash = that.state['itemHash'];
                let dataHash = that.state['dataHash'];
                console.log('itemHash', itemHash);
                console.log('dataHash', dataHash);         
                that.BBUnOrderedTCRInstance.methods.challenge(10, that.Utils.sha3(itemHash), that.Utils.sha3(dataHash)).send();
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
            <h3 className = "newstype">Stage : Voting</h3>
             <p>
            <input className="input-bbo" key="itemHash" type="number" name="itemHash" placeholder = "Choice" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="dataHash" type="text" name="dataHash" placeholder = "Salt" onChange={this.handleInputChange} />
            </p>
            <p>
                <button key="submit" className="item-button-submit" type="button" onClick={this.handleGetStage}>Download Commit</button>
            </p>
            <p>
                <button key="submit" className="sub-item-button-submit" type="button" onClick={this.handleGetStage}>Submit Vote</button>
            </p>
        
          </div>
        );
    }
    
}

Voting.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(Voting, mapStateToProps)