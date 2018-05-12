module.exports = function(app,swig,gestorBD) {
	
	app.get("/usuario", function(req, res) {
        var criterio = {};
        if( req.query.busqueda != null ){
            criterio = { $or :[{"nombre" : {$regex : ".*"+req.query.busqueda+".*"}},{"email": {$regex : ".*"+req.query.busqueda+".*"}}]};
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerInvitaciones({ $or: [ { emisor: req.session.usuario}, { receptor: req.session.usuario } ] } , function(invitaciones){
            var peticionesAmistad;
            if (invitaciones != null){
                peticionesAmistad = invitaciones;
            }
            gestorBD.obtenerUsuariosPg( criterio,pg,function (usuarios,total) {

                var pgUltima = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    pgUltima = pgUltima+1;
                }
                var respuesta = swig.renderFile('views/busuarios.html',
                    {
                        usuarios:usuarios,
                        user:req.session.usuario,
                        pgActual:pg,
                        pgUltima:pgUltima,
                        invitaciones: peticionesAmistad
                    });
                res.send(respuesta);
            })
        })

	});

	app.get("/invitaciones", function(req, res){
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerInvitacionesPg( { receptor: req.session.usuario, aceptada: false } ,pg,function (invitaciones,total){
            var pgUltima = total/5;
            if (total % 5 > 0 ){ // Sobran decimales
                pgUltima = pgUltima+1;
            }
            var respuesta = swig.renderFile('views/invitaciones.html',
                {
                    pgActual:pg,
                    pgUltima:pgUltima,
                    invitaciones:invitaciones
                });
            res.send(respuesta);
        })
    });

    app.get("/amigos", function(req, res){
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerAmistadesPg( req.session.usuario,pg,function (amistades,total){
            var pgUltima = total/5;
            if (total % 5 > 0 ){ // Sobran decimales
                pgUltima = pgUltima+1;
            }
            var respuesta = swig.renderFile('views/friends.html',
                {
                    pgActual:pg,
                    pgUltima:pgUltima,
                    amistades:amistades,
                    user:req.session.usuario
                });
            res.send(respuesta);
        })
    });

    app.post("/invitacion/acept/:email", function (req, res) {
        console.log("aceptar invitacion");
        var criterio = {
            emisor: req.params.email
        }
        gestorBD.aceptarInvitacion(criterio, function (id) {
            if (id == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(201);
                res.json({
                    mensaje : "invitacion aceptada",
                    _id : id
                })
            }
        })
    })

    app.get("/invitacion/:email", function (req, res) {
        console.log("crear invitacion");
        gestorBD.obtenerUsuario({email:req.session.usuario},function (usuario) {
            var emisor=usuario.nombre;
            var eid = usuario._id.toString();
            gestorBD.obtenerUsuario({email:req.params.email},function (usuario) {
                var receptor=usuario.nombre;
                var rid= usuario._id.toString();
                var invitacion = {
                    emisor: req.session.usuario,
                    emisorNombre:emisor,
                    emisorId: gestorBD.mongo.ObjectID(eid),
                    receptor: req.params.email,
                    receptorNombre:receptor,
                    receptorId: gestorBD.mongo.ObjectID(rid),
                    aceptada: false
                }
                gestorBD.insertarInvitacion(invitacion, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje : "invitacion enviada",
                            _id : id
                        });
                    }
                });
            });
        });


    })



    app.get("/signup", function(req, res) {
        var respuesta = swig.renderFile('views/signup.html', {});
        res.send(respuesta);
    });

    app.post('/signup', function(req, res) {
        console.log("creando usuario");
        if (req.body.password != req.body.passwordConfirm)
            res.redirect("/signup?mensaje=Error al registrar usuario: las contraseñas no coinciden&tipoMensaje=alert-danger");
        else {
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var usuario = {
                email: req.body.email,
                password: seguro,
                nombre: req.body.name
            }
            gestorBD.insertarUsuario(usuario, function (id) {
                if (id == null) {
                    res.redirect("/signup?mensaje=Error al registrar usuario: ya existe el usuario&tipoMensaje=alert-danger")
                } else {
                    res.redirect("/login?mensaje=Nuevo usuario registrado");
                }
            });
        }
    })

    app.get("/login", function(req, res) {
        var respuesta = swig.renderFile('views/login.html', {});
        res.send(respuesta);
    });

    app.post("/login", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/login" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/usuario");
            }
            console.log("login usuario");
        });
    });

    app.get('/logout', function (req, res) {
        console.log("logout usuario");
        req.session.usuario = null;
        res.redirect("/login");
    })

    app.get('/borrarTodo', function (req, res) {
        gestorBD.eliminarTodo();
        res.redirect("/login");
    })
};