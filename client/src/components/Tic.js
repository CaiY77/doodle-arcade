import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import socketIOClient from 'socket.io-client'
import { Dimmer, Loader, Segment } from 'semantic-ui-react'
import '../App.css'

class Tic extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tic: [0,0,0,0,0,0,0,0,0],
      turnP1: true
    };
  }

  gameStatus = () => {
    const {tic} = this.state;
    let show = tic.map((box,index) =>{

        if(box === 1){
          return(<div key={index} onClick={()=>this.change(index)} className = "box player1"></div>)
        }
        else if(box === 2){
          return(<div key={index} onClick={()=>this.change(index)} className = "box player2"></div>)
        } else {
          return(<div key={index} onClick={()=>this.change(index)} className = "box"></div>)
        }

    })
    return show
  }

  socketWatch = () => {
    const {socket} = this.props;
    const {players} = this.props
    socket.on('MakeMove',data =>{
      this.setState({
        tic: data.array,
        turnP1: data.turn
      });
    })
    socket.on('updatePlayers', client=>{
      this.props.update(client)
    })
  }

  change = (index) => {
    const { tic, turnP1} = this.state;
    const {socket, id, players} = this.props;
    if(turnP1 && id === players[0]){

        tic[index] = 1
        socket.emit('MakeMove',
        {
          array: tic,
          room: this.props.room,
          turn: !turnP1
        })

    }
    if(!turnP1 && id === players[1]){

        tic[index] = 2
        socket.emit('MakeMove',
        {
          array: tic,
          room: this.props.room,
          turn: !turnP1
        })

    }

  }

  leaveRoom = () =>{
    const {socket} = this.props;
    socket.emit('leaveRoom',this.props.room);
  }

  render() {
    this.socketWatch();
    const { players } = this.props
    return (
      <div className="tic-js">
        <Link to = '/'><button onClick={()=>this.leaveRoom()} className="font input-field button-style">GAME SELECT</button></Link>
        <h1 className="font game-title">TIC-TAC-TOE</h1>
        <div className="tic-content-contain">
          <div className="game-info">
            <h1 className="font">{this.props.room}</h1>
            <h1 className="font"> Player 1 : {players[0]}</h1>
            {
              (players[1])
                ? <h1 className="font"> Player 2 : {players[1]}</h1>
                : <h1 className="font">Player 2 : Waiting...</h1>
            }
          </div>
          <div className="tic-contain">
            <div className="tic-board">
              {/* {
                (players.length == 2)
                  ? this.gameStatus()
                  : (
                <Dimmer active inverted>
                <Loader size='massive'>Waiting For More Players</Loader>
                </Dimmer>
                  )
              } */}
              {this.gameStatus()}
              </div>
          </div>
          <div className="possible-chat">
          </div>
        </div>
      </div>
    );
  }

}

export default Tic;
