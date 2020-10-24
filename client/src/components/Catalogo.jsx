import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "./ProductCard";
import Filter from './Filter';
import SideComponent from './SideComponent';
import Pagination from './Pagination';
import * as Promise from "bluebird";
import './Catalogo.css';
import { connect } from 'react-redux';

/*----------Redux------------*/
import {
  getAllProducts,
  setProductsLoading,
} from "../actions/catalogoActions";
import {addProductToCart} from '../actions/cartActions';

import {getProductsFromCart} from '../actions/cartActions';

function Catalogo({
  getAllProducts,
  setProductsLoading,
  products,
  loading,
  reload,
  getProductsFromCart,
  cartProducts,
  cartState,
  products2,
  products3,
  isAuthenticated,
  addProductToCart
}) {

  /*------------------Pagination---------------------*/

  const [currentPage, setCurrentPage] = useState(1);
  const [elementsPerPage] = useState(9);

  const indexOfLastProduct = currentPage * elementsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - elementsPerPage;

  const [currentProducts, setCurrentProducts] = useState (products.slice(indexOfFirstProduct, indexOfLastProduct))

  const paginate = (pageNumber) => setCurrentPage(pageNumber); 
  /*------------------Pagination---------------------*/
  const [state, setState] = useState({
        reload: reload,
        cartProducts: []
    })

    useEffect(()=>{
      if(products2){
        setCurrentProducts(products2.slice(indexOfFirstProduct, indexOfLastProduct))
      } 
      else if(products3){
        setCurrentProducts(products3.slice(indexOfFirstProduct, indexOfLastProduct))
      } 
      setCurrentProducts(products.slice(indexOfFirstProduct, indexOfLastProduct));
      
    },[products, products2, products3])

  useEffect(  () =>{
    
    getProductsFromCart();
  
  },[currentPage, cartState, ])


  useEffect(() => {   
    
    setTimeout(() => {
      getAllProducts();
      
    }, 500);
  
    setState({
      reload: !reload
    })
    
  }, [reload, state.reload, cartProducts,  ]);

  //----------chequear que exista el carrito de guest cuando se loguea
  useEffect(()=>{
    if (isAuthenticated) {
      if(!localStorage.getItem("carrito")) {
        console.log('----no hay nada', localStorage.getItem("carrito"))
        return}
      let carrito = JSON.parse(localStorage.getItem("carrito"))
      console.log('carrito---------------------', carrito)
      
      let promises = carrito.map(function (e) {
          let body = {
            quantity: e.quantity,
            productId:e.id 
        }
        return addProductToCart(body);
      })

      Promise.each(promises).catch(e => console.log('error',e))

      localStorage.clear()
     }
      },[isAuthenticated])
    //----------chequear que exista el carrito de guest cuando se loguea


   
  return (
    <Row md={12} className="catalogo">
      <Col xs={0} xl={1}></Col>
      <Col xs={2}>
        <SideComponent /> 
      </Col>
      <Col>
        <Row>
          {loading ? (
            <div
              className="spinner-border spinner-catalogo"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          ) :   currentProducts.length > 0 ? (

            currentProducts.map((ele, index) => (
                       
              <div key={index} className="column-productcard">
                <ProductCard
                  id={ele.id} 
                  name={ele.name}
                  description={ele.description.slice(0, 50) + "..."}
                  price={ele.price}
                  stock={ele.stock}
                  images={ele.images[0]}
                  cartProducts={cartProducts}
                  current={currentPage}
                  currentProducts={currentProducts}
                /> 
              </div>

            ))
          ) : (
            <div>
              <h1 className="no-products">NO PRODUCTS TO DISPLAY</h1>
            </div>
          )} 
        </Row>
        <div className="d-flex justify-content-center mt-5">
          <Pagination elementsPerPage={elementsPerPage} totalElements={products.length} paginate={paginate}/>
        </div>
      </Col>
      <Col xs={0} xl={1}></Col>
    </Row>
  );
} 

const mapStateToProps = (state) => {
  return {
    cartState: state.cartReducer.cart,
    loading: state.catalogo.loading,
    reload: state.productReducer.reload,
    cartProducts: state.cartReducer.products,
    products: state.catalogo.allProducts,
    products2: state.catalogo.allProducts2,
    products3: state.catalogo.allProducts3,
    isAuthenticated: state.userReducer.isAuthenticated
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setProductsLoading: () => dispatch(setProductsLoading()),
    getAllProducts: () => dispatch(getAllProducts()),
    getProductsFromCart: () => dispatch(getProductsFromCart()),
    addProductToCart: (body) => dispatch(addProductToCart(body))
  }
}

export default connect( mapStateToProps, mapDispatchToProps )(Catalogo);
