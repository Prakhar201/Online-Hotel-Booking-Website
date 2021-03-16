//import those pages in App.js
//Then based on the path show each components using react-router-components
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Home from "./booking/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import TopNav from "./components/TopNav";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

/** we are executing the top navigation function here */
function App() {
  return (
    <BrowserRouter>
      <TopNav/>
      <ToastContainer />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
