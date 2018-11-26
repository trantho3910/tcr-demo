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
        that.BBUnOrderedTCRInstance.methods.updateStatus(this.props.componentPros.listID, this.props.componentPros.itemHash).send();
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
        that.BBUnOrderedTCRInstance.methods.initExit(this.props.componentPros.listID, this.props.componentPros.itemHash).send();
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
        that.BBUnOrderedTCRInstance.methods.finalizeExit(this.props.componentPros.listID, this.props.componentPros.itemHash).send();
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
             <h3 className = "newstype">You are about manager to ITEM</h3>
            <p>Name: {this.props.componentPros.name}</p>
            <p>Email: {this.props.componentPros.email}</p>
            <p>Address: {this.props.componentPros.address}</p>
            <p>Phone: {this.props.componentPros.phone}</p>
            <p><Button variant="outlined" color="secondary"  onClick={this.updateStatus}>Update Status</Button>
            </p>
            <p><Button variant="outlined" color="secondary" onClick={this.updateInitExit}>Init Exit</Button>
            </p>
            <p><Button  variant="outlined" color="secondary" onClick={this.finalizeExit}>Finalize Exit</Button>
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
  
export default withStyles(styles)(drizzleConnect(TCRUtil, mapStateToProps))