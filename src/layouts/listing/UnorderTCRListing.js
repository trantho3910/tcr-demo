import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { drizzleConnect } from 'drizzle-react'
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Apply from '../apply/Apply'
import Challenge from '../challenge/Challenge'
import Voting from '../voting/Voting'
import TCRUtil from '../tcrUtil/TCRUtil'
import { resolve } from 'path';
import { rejects } from 'assert';
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


class SimpleDialog extends React.Component {
  handleClose = () => {
    this.props.onClose(this.props.selectedValue);
  };

  handleListItemClick = value => {
    this.props.onClose(value);
  };

  render() {
    const { classes, onClose, selectedValue, componentPros, title, ...other } = this.props;
    var  ChildComponent = this.props.component
    if(!this.props.component)
      return '';
    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle id="simple-dialog-title">{title}</DialogTitle>
        <DialogContent>
        <ChildComponent componentPros={this.props.componentPros} />
        </DialogContent>
      </Dialog>
    );
  }
}

SimpleDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  selectedValue: PropTypes.string,
  title: PropTypes.string
};

const SimpleDialogWrapped = withStyles(styles)(SimpleDialog);


const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class TablePaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    );
  };

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions,
);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
   button: {
    margin: theme.spacing.unit,
  },
});

class UnorderTCRListing extends React.Component {
  constructor(props, context) {
    super(props)
    this.items = [];// [{name:'a',status: 'Apply', created: 1542605000}, {name:'b',status: 'Challenge', created: 1542605105}, {name:'c',status: 'In ...', created: 1542605005}]
    this.state = {
        rows: [],
        page: 0,
        rowsPerPage: 10,
        open:false
    };
    this.context = context;
    this.contracts = context.drizzle.contracts;
    this.Utils = context.drizzle.web3.utils; 
    this.count = 0; 


  }

    getDataIPFS = async (ipfsHash) => {
      try {
        const url = 'https://cloudflare-ipfs.com/ipfs/' + ipfsHash;
        const response = await fetch(url)        
        const data = response.json()
        return data;
      } catch (e) {
        console.log('error ', e);
        return null;
      }

    }

  componentDidMount() {
    var that = this;
    this.contracts.BBExpertHash.events.SavingItemData({
        fromBlock: 0
    }, function(error, event){})
    .on('data', async function(event){
         //console.log(event.blockNumber); 
        let ipfsHash =  this.Utils.toAscii(event.returnValues.ipfsHash);
        let data = await this.getDataIPFS(ipfsHash, event.blockNumber);
        const res = await this.context.drizzle.web3.eth.getBlock(event.blockNumber);
        if(data) {
          let obj = {name: data.fullName, status: 'Apply', created: res.timestamp, itemHash : that.Utils.sha3(ipfsHash)};
          this.items.push(obj);
          this.setState({rows: this.items.map(x=>{
            return {name:x.name, status: x.status, created: x.created, itemHash:x.itemHash}
          })}) 
        }
    }.bind(this))
    .on('changed', function(event){
        // remove event from local database
    })
    .on('error', console.error);

    console.log('todo here to get status from block change and enable button')//
  	
  }
  
  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleClickOpen = (componentPros, dialogcomponent, dialogtitle) => {
    this.setState({ dialogcomponent: dialogcomponent, dialogtitle: dialogtitle, componentPros: componentPros });
    this.setState({open:true})
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  displayUpdateButton = (item) => {
    let componentPros = {itemHash:item.itemHash, extraData: item.name, status: item.status}
    let btnColor = "primary"
  	return (<Button size="small" onClick={this.handleClickOpen.bind(this, componentPros, TCRUtil, 'Update Item')} variant="outlined" color={btnColor}>
        Update
      </Button>
      )
  }

  displayActionButton = (item) => {
    let componentPros = {itemHash:item.itemHash, extraData: item.name, status: item.status}

    var dialogcomponent = ''
    var dialogtitle = ''
    if(componentPros.status == 'Apply'){
      dialogcomponent = Apply
      dialogtitle = 'Application'
    }
    if(componentPros.status == 'Challenge'){
      dialogcomponent = Challenge
      dialogtitle = 'Challenge'
    }
    if(componentPros.status == 'Voting'){
      dialogcomponent = Voting
      dialogtitle = 'Voting'
    }

    let btnColor = "secondary"
  	return (<Button size="small" onClick={this.handleClickOpen.bind(this, componentPros, dialogcomponent, dialogtitle)} variant="outlined" color={btnColor}>
        {item.status}
      </Button>
      )
  }
  onModalClose = ()=> {
    this.setState({open:false})
  }
  render() {

    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                return (
                  <TableRow key={row.itemHash}>
                    <TableCell component="th" scope="row">
                      {row.name} -- {row.itemHash}
                    </TableCell>
                    <TableCell>{row.created}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{this.displayUpdateButton(row)}</TableCell>
                    <TableCell>{this.displayActionButton(row)}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={3}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActionsWrapped}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <SimpleDialogWrapped 
         open={this.state.open} 
         component={this.state.dialogcomponent}
         title={this.state.dialogtitle}
         onClose={this.onModalClose}
         componentPros={this.state.componentPros}
        />
      </Paper>
    );
  }
}

UnorderTCRListing.propTypes = {
  classes: PropTypes.object.isRequired,
};
UnorderTCRListing.contextTypes = {
    drizzle: PropTypes.object
}
const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      contracts: state.contracts
    }
}
  
export default withStyles(styles)(drizzleConnect(UnorderTCRListing, mapStateToProps));
