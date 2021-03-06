module.exports = function(app, gestorBD){

    app.get("/api/usuarios", function(req,res){
        console.log("obteniendo usuarios api");
        gestorBD.obtenerAmistades( res.usuario, function(amistades) {
            if (amistades == null) {
                res.status(500);
                res.json( {
                    error : "Se ha producido un error"
                });
            } else {
                res.status(200);
                res.send( JSON.stringify(amistades) );
            }
        })

    });

    app.get("/api/mensajes/:email", function (req, res) {
        console.log("obtener mensajes");
        var criterio = {$or:[{$and:[{emisor:res.usuario, destino:req.params.email}]},
                    {$and:[{emisor:req.params.email, destino:res.usuario}]}]};
        gestorBD.obtenerMensajes( criterio, function(mensajes) {
            if (mensajes == null) {
                res.status(500);
                res.json( {
                    error : "Se ha producido un error"
                });
            } else {
                res.status(200);
                res.send( JSON.stringify(mensajes) );
            }
        })
    });
    app.post("/api/mensajes/:email", function (req, res) {
        console.log("leer mensajes");
        var criterio = {$and:[{destino:res.usuario, emisor:req.params.email}]};
        gestorBD.leerMensajes( criterio, function(mensajes) {
            if (mensajes == null) {
                res.status(500);
                res.json( {
                    error : "Se ha producido un error"
                });
            } else {
                res.status(201);
                res.json({
                    mensaje: "Mensajes leidos"
                })
            }
        })
    });

    app.post("/api/autenticar/", function(req,res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        var criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); //Unauthorized
                res.json({
                    autenticado : false
                });
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token : token
                });
                console.log("usuario login");
            }
        });
    });
    app.post("/api/mensaje/", function(req,res) {
        console.log("enviando mensaje");
        var mensaje={
            emisor:res.usuario,
            destino: req.body.destino,
            texto:req.body.texto,
            leido:false
        };
        gestorBD.obtenerAmistades(mensaje.emisor, function (amigos) {
            var isAmigo=false;
            amigos.forEach(function (amigo) {
                if(amigo.email===mensaje.destino) isAmigo=true;
            });
            if(isAmigo) {
                gestorBD.enviarMensaje(mensaje, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({error: "se ha producido un error"});
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "Se ha insertdao el mensaje",
                            _id: id
                        });
                    }
                });
            }else{
                res.status(500);
                res.json({error: "no son amigos"});
            }
        })

    });
}