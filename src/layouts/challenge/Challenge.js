import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },

});

class Challenge extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleChallenge = this.handleChallenge.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
    
    }
    async getERC20Instance(token) {
      return await new this.context.drizzle.web3.eth.Contract(this.BBOInstance.abi, token, {
          from: this.props.accounts[0], // default from address
          gasPrice: '20000000000' // default gas price in wei ~20gwei
        });
    }
    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }


    async handleChallenge() {
        //console.log('handleChallenge');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let paramTCR = await this.contracts.BBTCRHelper.methods.getListParams(this.props.componentPros.listID).call();
        //console.log('minStake',paramTCR.minStake);
        let token = await this.contracts.BBTCRHelper.methods.getToken(this.props.componentPros.listID).call();
    
        let ERCIntance = await this.getERC20Instance(token);

        var allowance = await ERCIntance.methods.allowance(this.props.accounts[0], this.BBUnOrderedTCRInstance.address).call();
        //console.log('allowance',allowance);

        
        let itemHash = this.props.componentPros.itemHash
        let dataHash = this.props.componentPros.ipfsHash

        //console.log('itemHash', itemHash);
        //console.log('dataHash', dataHash);   

        if(allowance >= paramTCR.minStake) {
            that.BBUnOrderedTCRInstance.methods.challenge(this.props.componentPros.listID, itemHash, that.Utils.toHex(dataHash)).send({from:that.props.accounts[0]});
            that.setState({
                'submiting': false
            });

            this.BBUnOrderedTCRInstance.events
                .Challenge({
                    filter : {itemHash : itemHash}

                }, (error, event) => {})
                .on('data', (event) => {
                    //console.log(event.returnValues);
                })
                .on('changed', (event) => console.log(event))
                .on('error', (error) => console.log(error));

                  return;
                }
         if(allowance > 0) {
             ERCIntance.methods.approve(this.BBUnOrderedTCRInstance.address, 0).send();
            setTimeout(function () {
                ERCIntance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei(new that.Utils.BN(Math.pow(2,52)), 'ether')).send();
                setTimeout(function () {      
                    that.BBUnOrderedTCRInstance.methods.challenge(that.props.componentPros.listID, itemHash, that.Utils.toHex(dataHash)).send();
                    that.setState({
                        'submiting': false
                    });

                }, 10000);
            }, 5000);
        }else{
            ERCIntance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei(new that.Utils.BN(Math.pow(2,52)), 'ether')).send();
            setTimeout(function () {      
                that.BBUnOrderedTCRInstance.methods.challenge(that.props.componentPros.listID, itemHash, that.Utils.toHex(dataHash)).send();
                that.setState({
                    'submiting': false
                });

            }, 5000);
        }
       




    }

    render() {
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        if(!this.props.componentPros)
            return ''
        return (
            <div className="container-fix-600">
            <h3 className = "newstype">You are about challenge to ITEM</h3>
            <p>Name: {this.props.componentPros.name}</p>
            <p>Email: {this.props.componentPros.email}</p>
            <p>Address: {this.props.componentPros.address}</p>
            <p>Phone: {this.props.componentPros.phone}</p>
            <div>
            <Button variant="contained" size="small" color="primary" onClick={this.handleChallenge}>Challenge</Button>
            </div>
          </div>
        );
    }
    
}

Challenge.contextTypes = {
    drizzle: PropTypes.object
}
Challenge.propTypes = {
  classes: PropTypes.object.isRequired,
};
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default withStyles(styles)(drizzleConnect(Challenge, mapStateToProps))