import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'


class OwnerTool extends Component {
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
        let commitDuration = that.state['commitDuration'];
        let revealDuration = that.state['revealDuration'];
        let minStake = this.Utils.toWei(that.state['tokenStake'], 'ether');
        let initQuorum = 10;
        let exitDuration = 2 * 60 * 60;
        if(applicationDuration == null || commitDuration == null || revealDuration == null || minStake == null) {
            that.setState({
                'submiting': false
            });
            return;
        }

        that.BBTCRHelper.methods.setParams(this.props.componentPros.listID, applicationDuration, commitDuration ,revealDuration, minStake, initQuorum, exitDuration).send();
        that.setState({
            'submiting': false
        });
    }

    componentDidMount(){
        let that = this;
         this.contracts.BBTCRHelper.methods.getListParams(this.props.componentPros.listID).call().then(function(rs){
            //console.log(rs)
            that.setState({listParams: rs});
    
          });
      }

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    displayParams =() => {


        if(this.state.listParams){
           
            return (
              <div>
              <p>Current Application Duration: {this.state.listParams.applicationDuration} (s)</p>
              <p>Current Application Min Stake: {this.Utils.fromWei(this.state.listParams.minStake,'ether' )} BBO</p>
              <p>Current Commit Voting Duration: {this.state.listParams.commitDuration} (s)</p>
              <p>Current Reveal Voting Duration: {this.state.listParams.revealDuration} (s)</p>
              </div>
              )
        }
        else
          return 'Loading...'
      }
    

    render() {
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        return (
            <div className="container-fix-600">
            <p>Name: {this.props.componentPros.name}</p>
            <p>ListID: {this.props.componentPros.listID}</p>
            {this.displayParams()}    
            <p>
            <input className="input-bbo" key="applicationDuration" type="text" name="applicationDuration" placeholder = "Application Duration" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="tokenStake" type="text" name="tokenStake" placeholder = "Token Min Stake" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="commitDuration" type="text" name="commitDuration" placeholder = "Commit Duration" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="revealDuration" type="text" name="revealDuration" placeholder = "Reveal Duration" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateParams}>Update Params</button>
            </p>
           
            
            <br/><br/>
          </div>
        );
    }
    
}

OwnerTool.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(OwnerTool, mapStateToProps)