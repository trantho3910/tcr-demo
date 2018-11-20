import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


class RegisterItem extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.updateParams = this.updateParams.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBExpertHash = this.contracts.BBExpertHash;  

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
        let email = that.state['email'];
        let phone = that.state['phone'];
        
        let data = {fullName, address, email, phone};

        console.log(data);

        ipfs.addJSON({fullName : fullName, address : address, email : email, phone : phone}, (err, result) => {
            if(err) {
                console.log(err);
                that.setState({
                    'submiting': false
                });
            } else {
                console.log('https://gateway.ipfs.io/ipfs/' + result)
                that.BBExpertHash.methods.pushData(that.Utils.toHex(result)).send();
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
            <h3 className = "newstype">RegisterItem Form</h3>
            <p>
            <input className="input-bbo" key="fullName" type="text" name="fullName" placeholder = "Full Name" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="address" type="text" name="address" placeholder = "Address" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="email" type="text" name="email" placeholder = "Email" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="phone" type="text" name="phone" placeholder = "Phone Number" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="sub-item-button-submit" type="button" onClick={this.updateParams}>Register</button>
            </p>
           
            
            <br/><br/>
          </div>
        );
    }
    
}

RegisterItem.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default drizzleConnect(RegisterItem, mapStateToProps)