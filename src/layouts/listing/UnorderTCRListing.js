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
  this.items = [{name:'cc',status: 'Voting', created: 1542605000}, {name:'cc',status: 'Apply', created: 1542605105}, {name:'cc',status: 'Challenge', created: 1542605005}]
 	this.state = {
	    rows: [],
	    page: 0,
	    rowsPerPage: 5,
	    open:false
	};
	this.context = context;
  }
  componentDidMount() {
    console.log('todo here to get status from block change and enable button')
  	this.setState({rows: this.items.map(x=>{
	 		return {name:x.name, status: x.status, created: x.created, itemHash: this.context.drizzle.web3.utils.sha3(x.name)}
	 	})}) 
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

    let btnColor = "primary"
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
