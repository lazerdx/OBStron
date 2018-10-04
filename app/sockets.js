var sharedsession = require("express-socket.io-session")	

var exports = module.exports = function(io, session, emitter, whitelist){	
  //Set up session sharing for socket.
  io.use(sharedsession(session, {
    autoSave:true
  }));
	
  //Namespace events.
  io.on('connection', function(socket){		
    //Socket auth stuff we literally couldn't put anywhere else (besides maybe another function in this file).
    var socketId = socket.id;
    var seshPass = socket.handshake.session.passport;
    //Logic to refuse socket if things aren't on the up and up.
    if (typeof seshPass != 'undefined') {
      var userid = socket.handshake.session.passport.user.id;
      if (!checkUser(whitelist, userid)) {
        console.log('socket: a users permission was denied |', socketId, userid);
        socket.disconnect(true);
      }			
    }	
    else {
      console.log('socket: a users auth was refused |' + socketId);
      socket.disconnect(true);
    }
		
    //Push the socket session to session data because why not? (answer: because it's not performant and it's not really doing anything for us, stupid).
    socket.handshake.session.userdata = socket.handshake.session.id;
    socket.handshake.session.save();
    console.log('socket: a user connected |', socketId);
		
    toBus('sync');
		
    //Socket events
    socket.on('request', function(data){
      //Pass request onto events to send to controller.
      console.log('socket: incoming request |', socket.id, data);
      toBus(data[0], socket.id, data[1]);
    });
    socket.on('disconnect', function(){
      if (socket.handshake.session.userdata) {
        delete socket.handshake.session.userdata;
        socket.handshake.session.save();
      }
        console.log('socket: a user discconnected |' + socketId);
    });
  });
	
  //Emitter events.
  emitter.eventBus.on('update', function(data) {
    //Pass update to client(s).
    var id = data.id;
    var body = {'head': data.head, 'body': data.body};
    //if 'all' is passed as id by main controller, socket will send message to all connected.
    if (id != 'all') {io.sockets.in(id).emit('update', body)}
    else {io.sockets.emit('update', body)};
    console.log("socket: emitting | update", id, body);		
  });

  //Functions.
  function toBus(head, id, data) {
    emitter.eventBus.sendEvent(head, {'id': id, 'body': data});
  }
  function checkUser(list, userid) {
    for (var i=0; i < list.length; i++) {
      var val = list[i].id;
      if (val.includes(userid)) { return true; }
    }
  return false;
  }
}