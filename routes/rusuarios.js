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
		gestorBD.obtenerUsuariosPg( criterio,pg,function (usuarios,total) {
            var pgUltima = total/4;
            if (total % 4 > 0 ){ // Sobran decimales
                pgUltima = pgUltima+1;
            }
            var respuesta = swig.renderFile('views/busuarios.html',
                {
                    usuarios:usuarios,
                    pgActual : pg,
                    pgUltima : pgUltima
                });
            res.send(respuesta);
        })
	});

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
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/tienda");
    })
};