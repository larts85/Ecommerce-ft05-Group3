import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Container,
  Modal,
  Alert,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { IconContext } from "react-icons";
import { BiShowAlt, BiHide } from "react-icons/bi";
import { Link, Redirect } from "react-router-dom";
import SignIn from "./userLogin"; //importamos el componente UserLogin (menu modal)

/*-------------redux-------------*/
import { getAllUsers, createUser } from "../../actions/userAction";
import { clearErrors } from "../../actions/errorActions";

/*--------LOGIN WHIT GOOGLE ---------*/
import {GoogleLogin, GoogleLogout } from "react-google-login"; 

/*--------LOGIN WHIT GITHUB ---------*/
import { GithubLoginButton } from "react-social-login-buttons";
import Axios from "axios";


class UserRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      passwordShowing: false, //para el boton que muestra o esconde la password
      loading: false, //despues que das click en el boto ncrear cuenta se cambia a loading
      modal: false,
      name: "",
      lastname: "",
      email: "",
      password: "",
    };
  }

  componentDidUpdate(prevProps) {
    const { error, isAuthenticated } = this.props;
    if (error !== prevProps.error) {
      //check for register error
      if (error.id === "REGISTER_FAIL") {
        let errorMsgs = [];
        error.msg.errors.map((ele) => errorMsgs.push(ele));
        this.setState({ msg: errorMsgs });
      } else {
        this.setState({ msg: null });
      }
    }
    if (isAuthenticated) {
      if (this.state.modal) {
        this.handleClose();
      }
    }
    // y siempre que se cambia el estado email
  }

  switchPassword = () => {
    //para mostrar o esconder el password
    this.setState({
      ...this.state,
      passwordShowing: !this.state.passwordShowing,
    });
  };

  handleClose = () => {
    this.props.clearErrors();
    this.setState({
      modal: false,
    });
  };

  handleShow = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { name, lastname, email, password } = this.state;
    const newUser = { name, lastname, email, password };
    this.props.createUser(newUser);
  };

handleBoth=()=>{
    this.handleClose(); 
    this.props.handler()
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                //////////////////////// LOGIN WITH GOOGLE  ////////////////////////
   responseGoogle = (response) =>{                      //la respuesta son los datos del usuario de google autenticado
                                    //console.log(response) //si consologuean la respuesta van a ver todos los datos que devuevle google
    let newGoogleUser = {                               //se arma un nuevo objeto con los datos que requerimos para nuesra DB
      name: response.profileObj.givenName,          
      lastname: response.profileObj.familyName,
      email: response.profileObj.email,
      password: "$2a$10$KtUH0poKeLEQ8WqZ8hjcruwXPcA7.W8O1WDtcMoAFJweRGMQxDWam", //esta password es generica para todas las cuentas de google y gitHub pues es un campo obligatorio para nuestra DB
      image: response.profileObj.imageUrl,
      whitGoogle: true                                  // esta ultima propiedad funciona como bandera, para indicarle a la accion "createUser" que el usuario que esta ingresando es externo a nuestra web
    }
    this.props.createUser(newGoogleUser)


  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
                                  //////////////////////// LOGIN WITH GIHUB  ////////////////////////
//aqui la mentalidad es diferente a la de google, pues no hay un boton que me traiga los datos de gitHub, si no, que es una serie de 
//redireccionamientos a paginas Web de gitHub que no voy a poder leer automaticamente sin el ciclo de vida del componente; si no tendria que 
//presionar un boton que me lleve a la pagina de github y otro que me haga el login
  componentDidMount =  () => {            //siempre que el componente se "monte", se despacha una petion para preguntarle al back 
                                          //si es que hay datos de un usuario de gitHub actualemente
    let data;
      Axios({                             //petion para pedir los datos del usuario de github 
        method: "GET",                            //esta peticion no es un axios como los demas pues se deben habilitar las credenciales  
        withCredentials: true,                    //para que mi back me permita acceder al a informacion del usuario
        url: "http://localhost:4000/github/user", //ruta donde se piden los datos del usuario de gitHub, esto es en nuestro back
      }).then((res) => {
      
        data = res.data;                  //la respuesta de la informacion de gitHub esta en data pueden consologearlo
                          // console.log(data);
      }).then(()=>{ 

      if(data == false){                  //si el componente se monta y la respuesta del back es un false, entonces no va a hacer nada
              return console.log("No gitHub User to Login")
      }else {
                                          //de lo contrario si retorna datos, se crea un nuevo objeto, "gitHubUser" para enviarlo a la accion
          let newGitHubUser = {           //que me crea un nuevo usuario en mi DB con los datos entregados por gitHub
            name: data.username,       //lastname se debe poner igual que el name, pues gitHub entrega solo un display Name, y necesitamos pasar
            lastname: data.username,   //la validacion de sequelize que pide que el lastname no sea null
            email: data.username+"@cyberfitness.com", //gitHub no retorna un correo electronico por lo cual se le crea un nuevo correo al usuario con el username de github
            password: "$2a$10$KtUH0poKeLEQ8WqZ8hjcruwXPcA7.W8O1WDtcMoAFJweRGMQxDWam", //esta password es generica para todas las cuentas de google y gitHub para pasar la validacion de sequelize
            image: data.photos[0].value,
            whitGoogle: true              //se envia la misma bandera que indica que hay un usuario logueandose externamente, se recicla la bandera de google
          }
          this.props.createUser(newGitHubUser).then(()=>{  //se despacha la accion que crea el nuevo usuario y lo loguea automaticamente
                          Axios({                                     //ESTO ES MUY IMPORTANTE, como la autenticacion esta hecha por passport, hay una sesion
                            method:"POST",                            //que esta siendo manejada por cookies, entonces tenemos la sesion en la cookie, y ademas la JWT       
                            withCredentials:true,                     //que se creo cuando agregamos nuestro usuario de gitHub en la DB, por eso debemos hacer un logOut
                            url:"http://localhost:4000/github/logout" //automatico de la cookie, para que sea destruida y solo mantener la JWT para manejar la sesion del usuario.
                          }).then((res) => console.log(res));         
          }) 
      }

    })   
  }

  render() {
    return (
      <React.Fragment>
        <Button className="button-register" onClick={this.handleShow}>
          Sign up
        </Button>

        <Modal
          show={this.state.modal}
          onHide={this.handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header 
            style={{ backgroundColor: "#8a2be2", color: "white" }}
            closeButton={true}
          >
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.msg &&
              this.state.msg.map((ele, id) => (
                <Alert key={id} variant="danger">
                  {ele}
                </Alert>
              ))}
            <Form>
              <Form.Group>
                <Form.Label>Name </Form.Label>
                <Form.Control
                  // ref={register()}
                  autoComplete="off"
                  name="name"
                  onChange={this.onChange}
                ></Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Lastname </Form.Label>
                <Form.Control
                  // ref={register()}
                  autoComplete="off"
                  name="lastname"
                  onChange={this.onChange}
                ></Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  // onChange={onChangeEmail}
                  // ref={register()}
                  autoComplete="off"
                  name="email"
                  onChange={this.onChange}
                ></Form.Control>
              </Form.Group>

              <Form.Group>
                <IconContext.Provider
                  value={
                    this.state.passwordShowing
                      ? { className: "icon-change" }
                      : { className: "icon" }
                  }
                >
                  <Form.Label>
                    <span
                      style={{
                        marginRight: "0.125rem",
                      }}
                    >
                      Password
                    </span>{" "}
                    {this.state.passwordShowing ? (
                      <BiHide
                        type="button"
                        onClick={() => this.switchPassword()}
                        title="Hide Password"
                      />
                    ) : (
                      <BiShowAlt
                        type="button"
                        onClick={() => this.switchPassword()}
                        title="Show Password"
                      />
                    )}
                  </Form.Label>
                </IconContext.Provider>
                <Form.Control
                  // onChange={onChangePassword}
                  // ref={register()}
                  autoComplete="off"
                  name="password"
                  onChange={this.onChange}
                  type={this.state.passwordShowing ? "text" : "password"}
                ></Form.Control>
              </Form.Group>

              <Form.Group className="d-flex justify-content-between">
                <span className="mt-2">
                  ¿Do you have an account?{"     "}
                  <Button
                    onClick={this.handleBoth}
                    className="button-register mt-1"
                    style={{ width: "5rem" }}                  
                  >Login                
                  </Button>
                </span>
                <Button
                  disabled={this.state.loading}
                  type="submit"
                  onClick={this.onSubmit}
                  className="button-register mt-1"
                  style={{ width: "9rem" }}
                >
                  {this.state.loading ? "Loading..." : "Create Account"}
                </Button>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
                      <h6> --------- OR ---------</h6>
                                 {/*///////////////////////////////////////////////////////////////////////////////////*/}
                                               
                                                               {/*LOGIN WHIT GITHUB*/}

                      <GithubLoginButton onClick={()=> alert("este boton no hace nada")} />    {/** BOTON DE GITHUB SOLO ES VISUAL NO HACE NADA  **/}    
                     
                              <a href="http://localhost:4000/gitHub"> LOGIN GITHUB </a>         {/** BOTON DE REDIRECCIONAMIENTO A GITHUB PARA HACER LA AUTENTICACION DESDE SU PAGINA  **/}
                     
                                 {/*///////////////////////////////////////////////////////////////////////////////////*/}


                                                                {/*LOGIN WHIT GOOGLE*/}
                  
                      <GoogleLogin                                                      //LIBRERIA QUE TIENE IMPLEMETANDO EL BOTON PARA LOGUEARSE CON GOOGLE
                        clientId="807609632644-ken5ulpg4t4gjuinurpjfuif4ord8e0s.apps.googleusercontent.com" //ESTE ID SE CREA EN console.developers.google.com -> CREDENCIALES, leer documentacion sobre como crear un OAuth con google Credencials
                        buttonText="Login With Google"                      //EL TEXTO DEL NOMBRE DEL BOTON
                        onSuccess={this.responseGoogle}                     //SI LA RESPUESTA DE GOOGLE FUE EXITOSA SE LLAMA A LA FUNCION
                        onFailure={this.responseGoogle}                     //SI LA RESPUES DE GOOGLE FALLA, SE LLAMA A LA FUNCION
                        cookiePolicy={"single_host_origin"}                 //SE HABILITAN LAS COOKIES PARA NUESTRO SITIO WEB
                        //   isSignedIn={true}                              //MANTIENE LA SESION INICIADA CON COOKIES NO LO NECESITAMOS PORQUE USAMOS JWT 
                       /> 
                                  
                                  {/*///////////////////////////////////////////////////////////////////////////////////*/}
            
            <button
              className="btn"
              style={{ backgroundColor: "#8a2be2", color: "white" }}
              onClick={this.handleClose}
            >
              Close
            </button>
  
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    allUsers: state.userReducer.users,
    error: state.error,
    isAuthenticated: state.userReducer.isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllUsers: () => dispatch(getAllUsers()),
    createUser: (user) => dispatch(createUser(user)),
    clearErrors: () => dispatch(clearErrors()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRegister);
