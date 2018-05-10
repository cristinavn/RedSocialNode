module.exports = function(app, gestorBD){

    app.get("/api/cancion", function(req,res){
        gestorBD.obtenerCanciones( {}, function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json( {
                    error : "Se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        })
    })

    app.put("/api/cancion/:id", function(req, res) {

        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        var cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.json({
                    mensaje : "canción modificada",
                    _id : req.params.id
                })
            }
        });
    });


    app.get("/api/cancion/:id", function(req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });


    app.delete("/api/cancion/:id", function(req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });
    app.get("/api/amigo", function(req, res) {
        var criterio = {$and:[{$or:[{emisor:res.usuario},{receptor:res.usuario}]},{aceptada:true}]};
        gestorBD.obtenerAmistades(criterio,function(invitaciones){
            if ( invitaciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                var amigos=[];
                invitaciones.forEach(function(invitacion){
                    if(invitacion.receptor===res.usuario){
                        amigos.push(invitacion.emisorId);
                    }else if (invitacion.emisor === res.usuario){
                        amigos.push(invitacion.receptorId);
                    }
                });
                res.send( JSON.stringify(amigos) );
            }
        });

    });
    app.post("/api/cancion", function(req, res) {
        var cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?

        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(201);
                res.json({
                    mensaje : "canción insertarda",
                    _id : id
                })
            }
        });

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
            }
        });
    });
}