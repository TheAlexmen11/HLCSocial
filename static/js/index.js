function create_room(){
    $.ajax({
        url:'/link_create_room',
        method:'post',
        data:{
            name_room: $("#input-create").text()
        }
    }).done(function(data){
        if(data.state == 'error'){
            let message = data.result;
            alert(message);
        }
        else if(data.state == 'ok'){
            let link = window.location+data.result;  
            let message = "Puedes unirte a la sesion con: " + link;
            alert(message);
            location.href = link
        }
    });
}

$(".button-create").click(function(){
    create_room();
});

$("#input-create").keyup(function(event){
    if(event.key == 'Enter'){
        create_room();
    }
})

$(".button-join").click(function(){
    let link = $("#input-join").text();
    location.href = link;
});

$("#input-join").keyup(function(event){
    if(event.key == 'Enter'){
        let link = $("#input-join").text();
        location.href = link;
    }
})