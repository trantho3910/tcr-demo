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

class Apply extends Component {
    constructor(props, context) {
      super(props, context)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleApply = this.handleApply.bind(this);
      this.getParams = this.getParams.bind(this);
      this.handleChange = this.handleChange.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
    }

    async getParams () {
    }

  
    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
      };
    async handleApply() {

        console.log('handleApply');
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

        let bboAmount = that.state['bboAmount'];
        bboAmount = this.Utils.toWei(bboAmount, 'ether');
        console.log('bboAmount',bboAmount);

        let itemHash = this.props.componentPros.itemHash
        let dataHash = this.props.componentPros.extraData

        console.log('itemHash', itemHash);
        console.log('dataHash', dataHash);   

        if(allowance > paramTCR.minStake && bboAmount >= paramTCR.minStake) {
            that.BBUnOrderedTCRInstance.methods.apply(this.props.componentPros.listID, bboAmount,itemHash, that.Utils.toHex(dataHash)).send();
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
                                            
                that.BBUnOrderedTCRInstance.methods.apply(this.props.componentPros.listID, bboAmount,itemHash, that.Utils.toHex(dataHash)).send();
                that.setState({
                    'submiting': false
                });

            }, 10000);
        }, 5000);


    }

    render() {
        const { classes } = this.props;
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        if(!this.props.componentPros)
            return ''
        return (
            <div>
            <h3 className = "newstype">You are about apply to ITEM</h3>
            <p>Name: {this.props.componentPros.name}</p>
            <p>Email: {this.props.componentPros.email}</p>
            <p>Address: {this.props.componentPros.address}</p>
            <p>Phone: {this.props.componentPros.phone}</p>
            <TextField
              label="Stake BBO Amount"
              value={this.state.bboAmount}
              onChange={this.handleChange('bboAmount')}
              type="number"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              variant="outlined"
            />
            
            <p>
            <Button variant="contained" size="small" color="primary" onClick={this.handleApply}>Apply</Button>
            </p>
            <br/><br/>
          </div>
        );
    }
    
}

Apply.contextTypes = {
    drizzle: PropTypes.object
}
Apply.propTypes = {
  classes: PropTypes.object.isRequired,
};
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default withStyles(styles)(drizzleConnect(Apply, mapStateToProps))