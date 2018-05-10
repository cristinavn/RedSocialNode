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
/*
    app.get("/amigos", function(req, res){
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerAmistadesPg( req.session.usuario,pg,function (amigos,total){
            var pgUltima = total/5;
            if (total % 5 > 0 ){ // Sobran decimales
                pgUltima = pgUltima+1;
            }
            var respuesta = swig.renderFile('views/friends.html',
                {
                    pgActual:pg,
                    pgUltima:pgUltima,
                    amigos:amigos
                });
            res.send(respuesta);
        })
    });
*/
    app.post("/invitacion/acept/:email", function (req, res) {
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

    app.post("/invitacion/:email", function (req, res) {
        var invitacion = {
            emisor: req.session.usuario,
            receptor: req.params.email,
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
                })
            }
        })
    })



    app.get("/signup", function(req, res) {
        var respuesta = swig.renderFile('views/signup.html', {});
        res.send(respuesta);
    });

    app.post('/signup', function(req, res) {
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
        });
    });

    app.get('/logout', function (req, res) {
        req.session.usuario = null;
        res.redirect("/tienda");
    })

    app.get('/borrarTodo', function (req, res) {
        gestorBD.eliminarTodo();
        res.redirect("/tienda");
    })
};