//input-message
let width_input = $("#input-message").width()
$("#input-message").css('max-width',`${width_input}px`)


$(window).resize(function(){
    let width_input = $(window).width()-$("#container-contacts").width()-50
    $("#input-message").css('max-width',`${width_input}px`)
    console.log("asdasdsad")
});

//input-message

let socketio = io(window.location.protocol+'//'+document.domain+':'+location.port);

socketio.on('connect',function(){
    let location = document.location.href.split('/');
    let name_room = location[location.length-1]
    socketio.emit('join_in_room',{
        name_room:name_room
    }) 
})



//recibir mensajes
socketio.on('message',function(data){
    if($('#p-show-message').text().length != 0){
        $('#p-show-message').html($('#p-show-message').html()+'<br>'+data)
    }
    else{
        $('#p-show-message').html(data)
    }
})
//recibir mensajes

//enviar mensaje
$('#input-message').keyup(function(event){
    if(event.key == 'Enter'){
        socketio.emit('message',{
            message:$('#input-message').text()
        });
        $('#input-message').text("");
    }
})
//enviar mensaje

//cambiar nombre
$("#button-name-user").click(function(){
    let name_button = $("#button-name-user").text()
    if(name_button=='cambiar'){
        $("#name-user").attr('contenteditable','true');
        $("#button-name-user").text("guardar");
    }
    else if(name_button=='guardar'){
        new_name = $("#name-user").text();
        socketio.emit('change_name',{
            name:new_name
        })
        $("#name-user").attr('contenteditable','false');
        $("#button-name-user").text("cambiar")
    }
});

$("#name-user").keyup(function(event){
    if(event.key == "Enter"){
        new_name = $("#name-user").text();
        socketio.emit('change_name',{
            name:new_name
        })
        $("#name-user").attr('contenteditable','false');
        $("#button-name-user").text("cambiar");
        $("#name-user").text($("#name-user").text().trim())
    }
})
//cambiar nombre


//añadir usuario a lista
socketio.on('add_user',function(data){
    ids = data.id_users.split(' ')
    nicknames = data.nickname.split(' ')
    for(let i=0; i<ids.length; i++){
        contact = $(`#${ids[i]}`)
        if(contact.length <=0){
            $('#container-contacts').html($('#container-contacts').html()+`<p id=${ids[i]}>${nicknames[i]}</p>`)
        
        }
    }
})
//añadir usuario a lista

//eliiminar usuario al desconectarse
socketio.on('delete_name',function(data){
    id_user = data.id_user

    $(`#${id_user}`).remove()
    
})
//eliiminar usuario al desconectarse

//cambiar de nombre
socketio.on('change_name',function(data){
    id_user = data.id_user
    nickname = data.nickname

    $(`#${id_user}`).text(nickname)
    
})
//cambiar de nombre