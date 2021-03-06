import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Dimmer, Loader} from 'semantic-ui-react'
import { Form } from 'semantic-ui-react'
import '../App.css'

class Tic extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tic: [0,0,0,0,0,0,0,0,0],
      turnP1: true,
      GO: false,
      result: '',
      say:'',
      chat: [],
      PA: true
    };
    const {socket} = this.props;
    socket.on('MakeMove',data =>{
      this.setState({
        tic: data.array,
        turnP1: data.turn
      });
    })
    socket.on('updatePlayers', client=>{
      this.props.update(client)
    })
    socket.on('results', data => {
      this.setState({
        result: data.result,
        GO: true,
        PA: data.PA
      });
    })
    socket.on('say', chat =>{
      this.setState({
        chat: chat
      });
    })
    socket.on('resetGame', data=>{
      this.setState({
        result: data.result,
        GO: data.GO,
        tic: data.tic,
        turnP1: data.turnP1,
      });
    })
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  gameStatus = () => {
    const {tic} = this.state;
    let show = tic.map((box,index) =>{

        if(box === 1){
          return(<div key={index} onClick={()=>this.change(index)} className = {`box box${index} player1`}></div>)
        }
        else if(box === 2){
          return(<div key={index} onClick={()=>this.change(index)} className = {`box box${index} player2`}></div>)
        } else {
          return(<div key={index} onClick={()=>this.change(index)} className = {`box box${index} `}></div>)
        }

    })
    return show
  }

  change = (index) => {
    const { tic, turnP1 , GO} = this.state;
    const {socket, id, players} = this.props;

    if(turnP1 && id === players[0] && !GO){

        tic[index] = 1
        socket.emit('MakeMove',
        {
          array: tic,
          room: this.props.room,
          turn: !turnP1
        })
        this.checkWinner();
    }

    if(!turnP1 && id === players[1] && !GO){

        tic[index] = 2
        socket.emit('MakeMove',
        {
          array: tic,
          room: this.props.room,
          turn: !turnP1
        })
        this.checkWinner();
    }

  }

  checkWinner = () => {
    const { socket, room } = this.props
    let player1 = this.playerCurrentStanding(1);
    let player2 = this.playerCurrentStanding(2);

    if (player1.length === 5) {
      socket.emit('results', {
        result: 'TIE',
        room: room,
        PA: true
      })
    }
    else if(this.Win(player1)){
      socket.emit('results', {
        result: 'PLAYER ONE WINS ! ! !',
        room: room,
        PA: true
      })
    }
    else if(this.Win(player2)){
      socket.emit('results', {
        result: 'PLAYER TWO WINS ! ! !',
        room: room,
        PA: true
      })
    }
  }

  Win = (player) => {
    if (player.includes(0) && player.includes(1) && player.includes(2)) {
      return true
    }
    if (player.includes(0) && player.includes(4) && player.includes(8)) {
      return true
    }
    if (player.includes(0) && player.includes(3) && player.includes(6)) {
      return true
    }
    if (player.includes(3) && player.includes(4) && player.includes(5)) {
      return true
    }
    if (player.includes(6) && player.includes(7) && player.includes(8)) {
      return true
    }
    if (player.includes(6) && player.includes(4) && player.includes(2)) {
      return true
    }
    if (player.includes(2) && player.includes(5) && player.includes(8)) {
      return true
    }
    if (player.includes(1) && player.includes(4) && player.includes(7)) {
      return true
    }
  }

  playerCurrentStanding = (who) => {
    const { tic } = this.state
    let array=[];
    tic.forEach((value,index)=>{
      if(value === who){
        array.push(index);
      }
    })
    return array
  }

  handleSay = (e) =>{
    this.setState({
      say: e.target.value
    });
  }
  saySomething = () => {
    const {say, chat} = this.state
    const {socket, name, room, id, players} = this.props
    let msg = {
      who: name,
      what: say,
      key: (id === players[0]) ? true : false
    }
    chat.push(msg);
    socket.emit('say', {
      chat: chat,
      room: room
    })
    this.setState({
      say: ''
    });
  }

  showMessage = () => {
    const {chat} = this.state
    let array = chat.map(msg =>{
      return (<div className="msg-pair">
        <p className="font who"><span className={(msg.key) ? "redTxt" : "blueTxt"}>{msg.who}</span> says: </p>
        <p className="font what">{msg.what}</p>
      </div>)
    })
    return array
  }
  resetGame = () => {
    const { socket, room} = this.props
    socket.emit('resetGame',{
      tic: [0,0,0,0,0,0,0,0,0],
      result: '',
      GO: false,
      room : room,
      turnP1: true
    })
  }

  leaveRoom = () =>{
    const {socket, room} = this.props;
    socket.emit('leaveRoom',room);
    socket.emit('results', {
      result: 'YOUR OPPONENT HAS FLEED :(',
      room: room,
      PA: false
    })
  }

  render() {
    const { players, id, name, room} = this.props
    const { turnP1, GO, result, say, PA} = this.state
    return (
      <div className="tic-js">
        <h1 className="font game-title">TIC-TAC-TOE</h1>
        <div className="game-content-contain">
          <div className="game-info">
            <h1 className="font room">ROOM NUMBER</h1>
            <h1 className="font room-num">{room}</h1>
            {
              (id === players[0])
                ? (<div>
                  <h1 className ="font player"> YOU ARE PLAYER ONE </h1>
                  <h1 className="font name">{name}</h1>
                </div>)
                : null
            }
            {
              (id === players[1])
                ? (<div>
                  <h1 className ="font player"> YOU ARE PLAYER TWO </h1>
                  <h1 className="font name">{name}</h1>
                </div>)
                : null
            }
            <div className="leave-button">
              <Link to = '/'><button onClick={()=>{this.leaveRoom();this.props.leave()}} className="font input-field button-style">Leave Game</button></Link>
            </div>
          </div>
          <div className="game-space-contain">
            <div className="tic-board">
              {this.gameStatus()}
            </div>
            {
              (GO)
                ? (
                  <Dimmer active inverted>
                    {
                      (result === 'TIE')
                        ? <h1 className="font result-style" > IT'S A DRAW ! ! ! </h1>
                        : <h1 className="font result-style" >{result}</h1>
                    }
                    <Link to = '/'><button onClick={()=>{this.leaveRoom();this.props.leave()}} className="font input-field button-style">BACK TO LOBBY</button></Link>
                    {
                      (PA)
                        ?<button onClick={()=>this.resetGame()} className="font input-field button-style">PLAY AGAIN</button>
                        :null
                    }
                  </Dimmer>
                )
                :((players.length === 2)
                  ? (
                    (turnP1)
                      ? <h1 className="font turn">Player 1! Please Make your Move!</h1>
                      : <h1 className="font turn">Player 2! Please Make your Move!</h1>
                  )
                  : (
                    <Dimmer active inverted>
                      <Loader size='massive'>Waiting For Another Player . . .</Loader>
                      <Link to = '/'><button onClick={()=>{this.leaveRoom();this.props.leave()}} className="font input-field button-style cancel-button">CANCEL</button></Link>
                    </Dimmer>
                  )
                )
            }

          </div>
          <div className="chat">
            <div className="chat-box">
              <h1 className="font chat-style">CHAT ROOM</h1>
              <div className='messages'>
                {this.showMessage()}
                <div style={{ float:"left", clear: "both" }}
                  ref={(el) => { this.messagesEnd = el; }}>
                </div>
              </div>
            </div>
            <Form onSubmit={()=>this.saySomething()}>
              <input value={say} onChange={this.handleSay} className="say" type="text"/>
            </Form>

          </div>
        </div>
      </div>
    );
  }

}

export default Tic;
