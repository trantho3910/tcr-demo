import React, { Component } from 'react'
import ProgramLoading from '../program/programLoading'
import PropTypes from 'prop-types'
import '../../App.css'
import Manager from './Manager'

class MangerPanel extends Component {
  constructor(props, context) {
    super(props)   
  }
  
  render() {
    
    return (
      <ProgramLoading>
         <Manager />
      </ProgramLoading>
    )
  }
}

MangerPanel.contextTypes = {
  drizzle: PropTypes.object
}

export default MangerPanel
