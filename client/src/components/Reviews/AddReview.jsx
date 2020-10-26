import React,  {useEffect} from 'react';
import { useState } from 'react';
import { Button, Container, Modal, Col, Row, Form, InputGroup, FormControl } from 'react-bootstrap';
import Stars from 'react-stars';
import {addReview} from '../../actions/reviewsActions';
import {connect} from 'react-redux';
// import store from '../../store'

function AddReview({addReview, user, product, productId}) {
  const[show, setShow] = useState(false);
  const [stars, setStars] = useState(0);
  const [description, setDescription] = useState('');

  const handleOnclick = (e) => {
    e.preventDefault();
    setShow(true);
  }
  const handleOnChange = (e) => {
    e.preventDefault();
    setDescription(e.target.value)
  }
  let review = {
    description: description,
    qualification: stars,
    userId: user.id
  }
  const handleOnSubmit = (e, productId) => {
    e.preventDefault();
    addReview(productId, review);
    setShow(false);
  }

  const star = {
    count:5,
    onChange: stars=>setStars(stars),
    size: 74,
    color2: '#8a2be2',
    half: false,
  }
  return (
    <React.Fragment>
      <Button 
        onClick={(e)=>handleOnclick(e)}
        style={{backgroundColor: '#8a2be2', border: '#8a2be2', marginTop: '-30px', height: '32px'}}
        className="m-1"
      >
        Add review
      </Button>
      &nbsp;
      &nbsp;
      <Modal 
        show={show} 
        onHide={()=>setShow(false)}
        keyboard={true}
        animation={true}
        centered={true}
      >
        <Modal.Header 
          style={{ backgroundColor: "#8a2be2", color: "white" }}
          closeButton={true} 
          closeLabel={'Close'}
        >
          <Modal.Title>Product review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Rate your product.</h4>
          <Form>
            <Stars {...star} key={'starskey'}/>
            <hr/>
            <h4>Give us a product review.</h4>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>Don't be shy</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl 
                as="textarea"  
                aria-label="Description" 
                placeholder="Your review"
                onChange={e=>handleOnChange(e)}
              />
            </InputGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Container>
            <Row lg='5'>
              <Col lg='2'>
                <Button
                  onClick={()=>setShow(false)}
                  className="button-register mt-1"
                >Close
                </Button>
              </Col>
              <Col lg='7'></Col>
              <Col lg='3'>
                <Button
                  className="button-register mt-1"
                  onClick={e =>handleOnSubmit(e, productId)}
                >Send
                </Button>
              </Col>
            </Row>
          </Container>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  )
}

const mapStateToProps = (state) => {
  return {
    // review: state.reviewsReducer.review,
    user: state.userReducer.user,
    product: state.productReducer.product
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addReview: (user, review) => dispatch(addReview(user, review))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddReview)
