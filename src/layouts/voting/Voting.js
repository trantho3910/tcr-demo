import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../../App.css'
import { drizzleConnect } from 'drizzle-react'
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';


const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },

});

class Voting extends Component {
    constructor(props, context) {
      super(props)
      this.contracts = context.drizzle.contracts
      this.Utils = context.drizzle.web3.utils;  
      this.handleGetPullID = this.handleGetPullID.bind(this);
      this.handleCommitVote = this.handleCommitVote.bind(this);
      this.handleGetPollStage = this.handleGetPollStage.bind(this);
      this.claimReward = this.claimReward.bind(this);
      this.handeRevealVote = this.handeRevealVote.bind(this);
      var initialState = {bboAmount:0, submiting:false};
      this.state = initialState;
      this.BBUnOrderedTCRInstance = this.contracts.BBUnOrderedTCR;
      this.BBOInstance = this.contracts.BBOTest;
      this.VotingInstance = this.contracts.BBVoting;
      this.VotingHeplperInstance = this.contracts.BBVotingHelper; 
      this.web3 = context.drizzle.web3;
    }
    getPollID(){
      const BBUnOrderedTCRInstanceWeb3 = new this.web3.eth.Contract(this.BBUnOrderedTCRInstance.abi, this.BBUnOrderedTCRInstance.address);
      let that = this;
      return BBUnOrderedTCRInstanceWeb3.getPastEvents('Challenge', 
                {filter:{listID:10, itemHash: that.props.componentPros.itemHash},
                 fromBlock:4464719,
                 toBlock: 'latest' }, function(events, err){}
                 ).then(function(events){
                    console.log(events)
                    if(events.length>0)
                    that.setState({pollID: events[0].returnValues.pollID});
                 });
    }
    async getReward(){
      let reward = this.BBUnOrderedTCRInstance.methods.voterReward(this.props.accounts[0], this.state.pollID).send();
      if(reward!= this.state.voterReward)
        this.setState({voterReward:reward});
    }
    async handleGetPullID() {
        console.log('handleGetPullID');
    }

    async claimReward() {
        if (this.state['submiting'])
            return;
        this.setState({
            'submiting': true
        });
        let pollID = this.state['pollID'];

        this.BBUnOrderedTCRInstance.methods.claimReward(pollID).send();
        this.setState({
            'submiting': false
        });
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
            'submiting': false,
            'pollStatus':result[0],
            'commitEndate': result[3],
            'revealEndate': result[4],
        });
    }

    async handeRevealVote() {
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


    
    handleChange = key => (event, value) => {
        this.setState({
          [key]: value,
        });
      };

    handleDownload() {
        alert('TODO here! Not implement yet!!! Please come back later');
    }


    displayTime(time){
        if(time>0){
         return new Date(time*1000).toISOString()
        }else{
            return new Date().toISOString()
        }
    }
    displayForm(){
        let now = new Date();
        if(this.state.commitEndate && this.state.revealEndate){
            if(now < this.state.commitEndate){
                if(this.state.votingState != 'Commit Vote')
                    this.setState({votingState: 'Commit Vote'})
                return this.displayCommit()
            }
            if(this.state.commitEndate < now < this.state.revealEndate){
                if(this.state.votingState != 'Reveal Vote')
                    this.setState({votingState: 'Reveal Vote'})
                return this.displayReveal()
            }
            else{
                if(this.state.votingState != 'Finished Vote')
                    this.setState({votingState: 'Finished Vote'})
                return this.displayReward()
            }
        }else{
            return 'Loading...'
        }
    }
    displayReward(){
         const { classes } = this.props;
         this.getReward();
        return(
            <div>
            <h3>Your Reward: {this.state.voterReward}</h3>
            
            <Button variant="contained" size="small" 
             color="primary"
              onClick={this.claimReward}>Claim Reward</Button>
            </div>
        )
    }
    displayReveal(){
        const { classes } = this.props;
        return(
            <div>
            <h3>Select your choice to reveal this vote</h3>
            <FormControl component="fieldset">
              <FormLabel>Support or Not</FormLabel>
              <RadioGroup
                row
                name="icon"
                aria-label="icon"
                value={this.state.choice}
                onChange={this.handleChange('choice')}
              >
                <FormControlLabel value="1" control={<Radio />} label="Support" />
                <FormControlLabel value="0" control={<Radio />} label="Not" />
                <TextField
              label="Encrypt Password"
              value={this.state.salt}
              onChange={this.handleChange('salt')}
              type="number"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              variant="outlined"
            />
              </RadioGroup>
            </FormControl>
            <br/>
             <Button variant="contained" size="small" 
             color=""
              onClick={this.handleDownload}>Upload Encrypt File</Button>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <Button variant="contained" size="small" 
             color="primary"
              onClick={this.handeRevealVote}>Reveal Vote</Button>
            </div>
        )
    }
    displayCommit(){
        const { classes } = this.props;
        return(
            <div>
            <FormControl component="fieldset">
              <FormLabel>Support or Not</FormLabel>
              <RadioGroup
                row
                name="icon"
                aria-label="icon"
                value={this.state.choice}
                onChange={this.handleChange('choice')}
              >
                <FormControlLabel value="1" control={<Radio />} label="Support" />
                <FormControlLabel value="0" control={<Radio />} label="Not" />
                <TextField
              label="Encrypt Password"
              value={this.state.salt}
              onChange={this.handleChange('salt')}
              type="number"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              variant="outlined"
            />
              </RadioGroup>
            </FormControl>
            <br/>
            <TextField
              label="Vote Amount"
              value={this.state.bboAmountVote}
              onChange={this.handleChange('bboAmountVote')}
              type="number"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <br/>
             <Button variant="contained" size="small" 
             color=""
              onClick={this.handleDownload}>Download</Button>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <Button variant="contained" size="small" 
             color="primary"
              onClick={this.handleCommitVote}>Commit Vote</Button>
            </div>
        )
    }
    render() {
        if(this.account != this.props.accounts[0]) {
            this.account = this.props.accounts[0]
        }
        if(this.props.componentPros && !this.state.pollID){
            this.getPollID();
        }
        if(!this.state.pollStatus && this.state.pollID){
            this.handleGetPollStage();
        }
        return (
            <div>
            <h3 className = "newstype">Stage : {this.state.votingState}</h3>
            <p>Item Hash: {this.props.componentPros.itemHash} </p>
            <p>Poll ID: {this.state.pollID} </p>
            <p>Now: {this.displayTime(0)} </p>
            <p>Commit Enddate: {this.displayTime(this.state.commitEndate)} </p>
            <p>Reveal Enddate: {this.displayTime(this.state.revealEndate)} </p>

            {this.displayForm()}

          </div>
        );
    }
    
}

Voting.contextTypes = {
    drizzle: PropTypes.object
}
Voting.propTypes = {
  classes: PropTypes.object.isRequired,
};
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default withStyles(styles)(drizzleConnect(Voting, mapStateToProps))