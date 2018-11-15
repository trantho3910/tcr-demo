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
      this.handleVotingRight = this.handleVotingRight.bind(this);
      this.handleGetStage = this.handleGetStage.bind(this);
      this.handleGetPullID = this.handleGetPullID.bind(this);
      this.handleCommitVote = this.handleCommitVote.bind(this);
      this.handleGetPollStage = this.handleGetPollStage.bind(this);
      this.revealVote = this.revealVote.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
      this.VotingInstance = this.contracts.BBVoting;
      this.VotingHeplperInstance = this.contracts.BBVotingHelper;

  
    }

    async handleGetPullID() {
        console.log('handleGetPullID');
    }

    async handleGetPollStage() {
        if (this.state['submiting'])
            return;
        this.setState({
            'submiting': true
        });
        let pollID = this.state['pollID'];

        let result =  await this.VotingHeplperInstance.methods.getPollStage(pollID).call();
        this.setState({
            'submiting': false
        });
        console.log(result);

    }

    async revealVote() {
        if (this.state['submiting'])
            return;
        this.setState({
            'submiting': true
        });
        let pollID = this.state['pollID'];
        let choice = this.state['choice'];
        let salt   = this.state['salt'];

        await this.VotingInstance.methods.revealVote(pollID, choice, salt).send();
        this.setState({
            'submiting': false
        });

    }

    async handleCommitVote() {
        if (this.state['submiting'])
            return;
        this.setState({
            'submiting': true
        });
        let bboAmount = this.state['bboAmountVote'];
        let pollID = this.state['pollID'];
        let choice = this.state['choice'];
        let salt   = this.state['salt'];

        console.log('choice',choice);
        console.log('salt',salt);


        let secretHash = this.Utils.soliditySha3(choice, salt);
        bboAmount = this.Utils.toWei(bboAmount, 'ether');

        await this.VotingInstance.methods.commitVote(pollID, secretHash, bboAmount).send();
        this.setState({
            'submiting': false
        });
    }


    async handleVotingRight() {
        if (this.state['submiting'])
        return;
        var that = this;
        this.setState({
            'submiting': true
        });
        var allowance = await this.BBOInstance.methods.allowance(this.props.accounts[0], this.VotingInstance.address).call();
        let bboAmount = that.state['bboAmount'];
        bboAmount = this.Utils.toWei(bboAmount, 'ether');

        if(bboAmount <= allowance) {
            that.VotingInstance.methods.requestVotingRights(bboAmount).send();
            that.setState({
                'submiting': false
            });
            return;
        }

        this.BBOInstance.methods.approve(this.VotingInstance.address, 0).send();
        setTimeout(function () {
            that.BBOInstance.methods.approve(that.VotingInstance.address, that.Utils.toWei('1000000', 'ether')).send();
            setTimeout(function () {      
                that.VotingInstance.methods.requestVotingRights(bboAmount).send();
                that.setState({
                    'submiting': false
                });

            }, 5000);
        }, 5000);

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
            <input className="input-bbo" key="bboAmount" type="number" name="bboAmount" placeholder = "Amount BBO" onChange={this.handleInputChange} />
            </p>
            <p><button key="submit" className="item-button-submit" type="button" onClick={this.handleVotingRight}>Request VotingRight</button>
            </p>
            <p>
            <input className="input-bbo" key="pollID" type="number" name="pollID" placeholder = "Poll ID" onChange={this.handleInputChange} />
            </p>
             <p>
            <input className="input-bbo" key="choice" type="number" name="choice" placeholder = "Choice" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="salt" type="text" name="salt" placeholder = "Salt" onChange={this.handleInputChange} />
            </p>
            <p>
            <input className="input-bbo" key="bboAmountVote" type="number" name="bboAmountVote" placeholder = "Amount BBO" onChange={this.handleInputChange} />
            </p>
            <p>
                <button key="submit" className="item-button-submit" type="button" onClick={this.handleGetStage}>Download Commit</button>
            </p>
            <p>
                <button key="submit" className="sub-item-button-submit" type="button" onClick={this.handleCommitVote}>Submit Vote</button>
            </p>
            <p>
                <button key="submit" className="sub-item-button-submit" type="button" onClick={this.handleGetPollStage}>Get Poll Stage</button>
            </p>

             <h3 className = "newstype">Stage : Reveal Vote</h3>
             <p>
                <button key="submit" className="sub-item-button-submit" type="button" onClick={this.revealVote}>Reveal Vote</button>
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