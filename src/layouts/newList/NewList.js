import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
    },
  
  });
  

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


class NewList extends Component {
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
        let fullName = that.state['fullName'];
        let address = that.state['address'];

        if(fullName == null || address == null) {
            that.setState({
                'submiting': false
            });
            return;
        }
        
        let data = {fullName, address};

        console.log(data);

        ipfs.addJSON({name : fullName, tokenAddress : address}, (err, result) => {
            if(err) {
                console.log(err);
                that.setState({
                    'submiting': false
                });
            } else {
                console.log('https://gateway.ipfs.io/ipfs/' + result)
                that.BBTCRHelper.methods.createListID(that.Utils.toHex(result), address).send();
                that.setState({
                    'submiting': false
                });
            }
             
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
            <p>
            <input className="input-bbo" key="fullName" type="text" name="fullName" placeholder = "List Name" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="address" type="text" name="address" placeholder = "Token Address" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateParams}>Create</button>
            </p>
           
            
            <br/><br/>
          </div>
        );
    }
    
}

NewList.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default withStyles(styles)(drizzleConnect(NewList, mapStateToProps))