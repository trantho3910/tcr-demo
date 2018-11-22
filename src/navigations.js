import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './navigations.css'

class Navigation extends Component {
  
  render() {
    return ( 
      <main>
    <ul className="menu" >
        <li><Link to="/">Home</Link></li>
        <li><Link to="/manager">Manager</Link></li>
        <li><a href="https://github.com/bigbomio/tcr-demo/"target = "_bank">GitHub</a></li>
        <li><a href="https://bigbom.com/"target = "_bank">Contact</a></li>
    </ul>

  </main>
  
    );
  }
}

export default Navigation