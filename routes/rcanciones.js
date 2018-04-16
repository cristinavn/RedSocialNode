module.exports = function(app,swig,gestorBD) {

	app.post("/cancion", function(req, res) {
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        var cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
            autor: req.session.usuario
        }
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.send("Error al insertar ");
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            if (req.files.audio != null) {
                                var audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.redirect("/publicaciones");
                                    }
                                });
                            }

                        }
                    });
                }
            }
        });
	});

    app.get('/canciones/agregar', function (req, res) {
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        var respuesta = swig.renderFile('views/bagregar.html', {
        });
        res.send(respuesta);
    })

	app.get('/cancion/:id', function (req, res) {
	    var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
	    gestorBD.obtenerCanciones(criterio,function(canciones){
	        if ( canciones == null ){
	            res.send(respuesta);
	        } else {
	            var respuesta = swig.renderFile('views/bcancion.html',
                    {
                        cancion : canciones[0]
                    });
	            res.send(respuesta);
	        }
	    });
	})

	app.get('/canciones/:genero/:id', function(req, res) {
		var respuesta = 'id: ' + req.params.id + '<br>' + 'Genero: ' + req.params.genero;
		res.send(respuesta);
	})

    app.get("/tienda", function(req, res) {
        var criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "nombre" :  {$regex : ".*"+req.query.busqueda+".*"} };
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg , function(canciones, total ) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {

                var pgUltima = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    pgUltima = pgUltima+1;
                }

                var respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones,
                        pgActual : pg,
                        pgUltima : pgUltima
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/canciones", function(req, res) {
		var canciones = [ {
			"nombre" : "Blank space",
			"precio" : "1.2"
		}, {
			"nombre" : "See you again",
			"precio" : "1.3"
		}, {
			"nombre" : "Uptown Funk",
			"precio" : "1.1"
		} ];
		
		var respuesta = swig.renderFile('views/btienda.html',
		{
			vendedor : 'Tienda de canciones',
			canciones : canciones
		});
		res.send(respuesta);
	});

    app.get("/publicaciones", function(req, res) {
        var criterio = { autor : req.session.usuario };
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones : canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    })

    app.get('/cancion/eliminar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        var cancionId = gestorBD.mongo.ObjectID(req.params.id);
        var compra = {
            usuario : req.session.usuario,
            cancionId : cancionId
        }
        gestorBD.insertarCompra(compra ,function(idCompra){
            if ( idCompra == null ){
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    })

    app.get('/compras', function (req, res) {
        var criterio = { "usuario" : req.session.usuario };
        gestorBD.obtenerCompras(criterio ,function(compras){
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                var cancionesCompradasIds = [];
                for(i=0; i < compras.length; i++){
                    cancionesCompradasIds.push( compras[i].cancionId );
                }
                var criterio = { "_id" : { $in: cancionesCompradasIds } }
                gestorBD.obtenerCanciones(criterio ,function(canciones){
                    var respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    })

    app.post('/cancion/modificar/:id', function (req, res) {
        var id = req.params.id;
        var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        var cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.send("Error en la modificación");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    })

    function paso1ModificarPortada(files, id, callback){
        if (files.portada != null) {
            var imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }
    function paso2ModificarAudio(files, id, callback){
        if (files.audio != null) {
            var audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }

};