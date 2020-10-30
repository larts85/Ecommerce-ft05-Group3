import React, { useEffect, useState } from "react";
import { Table, Container } from "react-bootstrap";
import '../Reviews/Reviews.css';
import { connect } from "react-redux";
import AddReview from '../Reviews/AddReview';
import {oneStar, towStars, threeStars, fourStars, fiveStars} from '../Reviews/stars'
import "./Profile.css";
import { getUserReviews } from "../../actions/reviewsActions";
import { getCompletedOrderlines } from "../../actions/completeOrdelinesActions";
import moment from "moment";
import ReviewCard from "../Reviews/ReviewCard";
import { Link } from "react-router-dom";


const CompletedOrderline = ({ getUserReviews, userReviews, getCompletedOrderlines, user, orderlines }) => {
  const idUser = user && user.id;
  const orderLines = orderlines.rows ? orderlines.rows : [];
  const myTable = []
  const DATE_FORMAT = "DD/MM/YYYY - HH:mm";
  const reviews = userReviews;

  console.log('reviewsssss', reviews)
  console.log('orderLines', orderLines)

  useEffect(() => {
    if(user){
      getCompletedOrderlines(idUser);
      getUserReviews(idUser);
    }
  }, []);
  
  const createMyTable = () =>{
    for (let i = 0; i < orderLines.length; i++) {
      myTable.push({
        id: orderLines[i].product.id,
        name: orderLines[i].product.name,
        price: orderLines[i].price,
        quantity: orderLines[i].quantity,
        date: orderLines[i].updatedAt,
      })
    }
    return myTable;
  }
  createMyTable();
  console.log('myTable', myTable)
  
  function matching(){
    for (let i = 0; i < orderLines.length; i++) {
      const foundReview = reviews.find(review=>
        review.productId === orderLines[i].productId)
      myTable[i].qualification = foundReview && (foundReview.qualification || null);
      myTable[i].description = foundReview && (foundReview.description || null);
      myTable[i].reviewid = foundReview && (foundReview.id || null);
    }
    return;
  }
  matching();

  return (
    <React.Fragment>
      <Container className="mt-5">
        <h3 style={{color: 'white'}}>Shopping History</h3>
        <div className="table-responsive">
          <Table striped hover variant='dark' style={{borderRadius: '30px', textAlign: 'center'}}>
            <thead>
              <tr>
                <th scope="col"><h4>Products ({orderlines.count})</h4></th>
                <th scope="col"><h4>Price</h4></th>
                <th scope="col"><h4>Quantity</h4></th>
                <th scope="col"><h4>Date</h4></th>
                <th scope="col"><h4>Qualification</h4></th>
                <th scope="col"><h4>Review Ops</h4></th>
              </tr>
            </thead>
            <tbody>
              {myTable && myTable.map((row, index)=>{
                  console.log('MAP ', row.reviewid)
                return (
                  <tr>
                      <td>
                      <Link to={`/user/product/${row.id}`} className="nav-link">
                        <h6>{row.name}</h6>
                      </Link>
                      </td>
                    <td>
                      <h6>{row.price}</h6>
                    </td>
                    <td>
                      <h6>{row.quantity}</h6>
                    </td>
                    <td>
                      <h6>{moment(row.date).format(DATE_FORMAT)}</h6>
                    </td>
                    { 
                      row.qualification == 1 ? (<td className='bigStars'>{oneStar}</td>) : 
                      row.qualification == 2 ? (<td className='bigStars'>{towStars}</td>) : 
                      row.qualification == 3 ? (<td className='bigStars'>{threeStars}</td>) : 
                      row.qualification == 4 ? (<td className='bigStars'>{fourStars}</td>) : 
                      row.qualification == 5 ? (<td className='bigStars'>{fiveStars}</td>) : 
                      <td><h6>You did not review this product yet</h6></td>
                    }
                    <td>
                      <div key={index}>
                        <span>{
                          <AddReview 
                            productId={row.id} 
                            idUser={idUser} 
                            reviewQualification={row.qualification}
                          />}
                        </span>
                        <span>{
                          <ReviewCard 
                            reviewid={row.reviewid} 
                            reviewQualification={row.qualification}
                            reviewDescription={row.description}
                          />}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </Container>
    </React.Fragment>
  );
};


function mapStateToProps(state) {
  return {
    user: state.userReducer.user,
    orderlines: state.completedOrderlinesReducer.orderlines,
    userReviews: state.reviewsReducer.userReviews
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompletedOrderlines: (id) => dispatch(getCompletedOrderlines(id)),
    getUserReviews: (userId) => dispatch(getUserReviews(userId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompletedOrderline);
