import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'


class TCRUtil extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleInputChange = this.handleInputChange.bind(this);
      this.updateStatus = this.updateStatus.bind(this);
      this.updateInitExit = this.updateInitExit.bind(this);
      this.finalizeExit = this.finalizeExit.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
    }

    async updateStatus () {

        console.log('updateStatus');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let itemHash = that.state['itemHash'];
        that.BBUnOrderedTCRInstance.methods.updateStatus(10, that.Utils.sha3(itemHash)).send();
        that.setState({
            'submiting': false
        });
    }

    async updateInitExit() {
        console.log('updateInitExit');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let itemHash = that.state['itemHash'];
        that.BBUnOrderedTCRInstance.methods.initExit(10, that.Utils.sha3(itemHash)).send();
        that.setState({
            'submiting': false
        });
    }


    async finalizeExit() {
        console.log('finalizeExit');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let itemHash = that.state['itemHash'];
        that.BBUnOrderedTCRInstance.methods.finalizeExit(10, that.Utils.sha3(itemHash)).send();
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
            <h3 className = "newstype">TCR Update Status</h3>
            <p>
            <input className="input-bbo" key="itemHash" type="text" name="itemHash" placeholder = "Item Hash" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateStatus}>Update Status</button>
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateInitExit}>Init Exit</button>
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.finalizeExit}>Finalize Exit</button>
            </p>
           
            
            <br/><br/>
          </div>
        );
    }
    
}

TCRUtil.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(TCRUtil, mapStateToProps)