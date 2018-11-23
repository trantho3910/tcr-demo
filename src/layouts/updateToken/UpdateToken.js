import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'


class UpdateToken extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.updateParams = this.updateParams.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBTCRHelper = this.contracts.BBTCRHelper;  

    }

    async updateParams () {
        console.log('updateParams');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let applicationDuration = that.state['applicationDuration'];
       
        if(applicationDuration == null) {
            that.setState({
                'submiting': false
            });
            return;
        }

        that.BBTCRHelper.methods.updateToken(this.props.componentPros.listID, applicationDuration).send();
        that.setState({
            'submiting': false
        });
    }


    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    

    render() {
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        return (
            <div className="container-fix-600">
            <p>Name: {this.props.componentPros.name}</p>
            <p>ListID: {this.props.componentPros.listID}</p>
            <p>Current Token Address: {this.props.componentPros.token}</p>
            <p>Current Token Name: {this.props.componentPros.tokenName}</p>
            <p>
            <input className="input-bbo" key="applicationDuration" type="text" name="applicationDuration" placeholder = "Token Address" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateParams}>Update</button>
            </p>
           
            
            <br/><br/>
          </div>
        );
    }
    
}

UpdateToken.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(UpdateToken, mapStateToProps)