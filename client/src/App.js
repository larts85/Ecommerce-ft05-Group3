import React,{useState} from "react";
import "./App.css";

import "bootstrap/dist/css/bootstrap.min.css";
import FormCategories from './components/FormCategories/FormCategories';
import { BrowserRouter as Router, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar/SearchBar";
import axios from 'axios';
import Catalogo from "./components/Catalogo";
import CrudShow from "./components/CrudProducts/CrudShow";
import AdminProducts from "./components/AdminProducts/AdminProducts";
import LandingPage from './components/LandingPage';
import PrductsMati from './components/ProductsMati';
import Footer from './components/Footer';
import NavbarAdmin from './components/NavbarAdmin';
import Login from "./components/Login";
import SignUp from "./components/SignUp";



function App() {
  const [productSearch, setProductSearch] = useState([]);

  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setSearch(e.target.value);
    handleSubmit(e);
    console.log(search)
    if (e.target.value.length === 1) {
      setSearch("")
      return handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .get(`http://localhost:4000/products/search?valor=${search}`)
      .then((res) => res.data)
      .then((res) => {
        setProductSearch(res.rows);
      });
  };

  return (
    <div>
      <Router> 
       
        <Route path="/user" render={() => <SearchBar handleSubmit={handleSubmit} handleChange={handleChange} />}/>
        <Route path="/admin" component={NavbarAdmin} />
        <Route exact path="/" component={LandingPage} />
        <Route path="/user/catalogo"
          render={() => <Catalogo productSearch={productSearch} />}
        />
        <Route exact path="/admin/categories" component={FormCategories} />
        {/* <Route exact path="/admin/producto" component={CrudShow} /> */}
        <Route exact path="/admin/product" component={AdminProducts} />
        <Route exact path="/user/product/:id" component={PrductsMati} />
        <Route path="/user" component={Footer} />
        <Route path="/SignIn" component={Login} />
        <Route path="/SignUp" component={SignUp} />
      </Router>
    </div>
  );
}

export default App;