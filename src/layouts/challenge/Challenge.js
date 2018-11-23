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

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }


    async handleChallenge() {
        console.log('handleChallenge');
        if (this.state['submiting'])
            return;
        var that = this;
        this.setState({
            'submiting': true
        });
        let paramTCR = await this.contracts.BBTCRHelper.methods.getListParamsUnOrdered(this.props.componentPros.listID).call();
        console.log('minStake',paramTCR.minStake);

        var allowance = await this.BBOInstance.methods.allowance(this.props.accounts[0], this.BBUnOrderedTCRInstance.address).call();
        console.log('allowance',allowance);

        
        let itemHash = this.props.componentPros.itemHash
        let dataHash = this.props.componentPros.extraData

        console.log('itemHash', itemHash);
        console.log('dataHash', dataHash);   

        if(allowance >= paramTCR.minStake) {
            that.BBUnOrderedTCRInstance.methods.challenge(this.props.componentPros.listID, itemHash, that.Utils.toHex(dataHash)).send();
            that.setState({
                'submiting': false
            });

            this.BBUnOrderedTCRInstance.events
                .Challenge({
                    filter : {itemHash : itemHash}

                }, (error, event) => {})
                .on('data', (event) => {
                    console.log(event.returnValues);
                })
                .on('changed', (event) => console.log(event))
                .on('error', (error) => console.log(error));

                  return;
                }

        this.BBOInstance.methods.approve(this.BBUnOrderedTCRInstance.address, 0).send();
        setTimeout(function () {
            that.BBOInstance.methods.approve(that.BBUnOrderedTCRInstance.address, that.Utils.toWei('1000000', 'ether')).send();
            setTimeout(function () {      
                that.BBUnOrderedTCRInstance.methods.challenge(this.props.componentPros.listID, itemHash, that.Utils.toHex(dataHash)).send();
                that.setState({
                    'submiting': false
                });

            }, 10000);
        }, 5000);




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
            <p>ItemHash: {this.props.componentPros.itemHash}</p>
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