import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import ProgramContainer from './layouts/program/programContainer'
import ManagerPanel from            './layouts/manager/MangerPanel'
import Introduce from     './layouts/introduce/introduce'
import Navigation from "./navigations";

import { history } from './store'
console.log(process.env.PUBLIC_URL);
export default () => (
	<HashRouter  history={history} >
        <React.Fragment>
        <Navigation />
        <Switch>
            <Route exact path="/" component={ManagerPanel} />
            <Route exact path="/listing/:listID" component={ProgramContainer} />    
            <Route path='/pages/:page' component={Introduce}/>
        </Switch>
        </React.Fragment>
    </HashRouter>
)