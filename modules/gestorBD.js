module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    obtenerCancionesPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('canciones');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*4 ).limit( 4 )
                        .toArray(function(err, canciones) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(canciones, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },
    obtenerCompras : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('compras');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    insertarCompra: function(compra, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('compras');
                collection.insert(compra, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    eliminarCancion : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('canciones');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    modificarCancion : function(criterio, cancion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('canciones');
                collection.update(criterio, {$set: cancion}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuario : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        if ( usuarios.length == 1) {
                                    funcionCallback(usuarios[0].nombre);
                        }
                        else {
                            funcionCallback(null);
                        }
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuariosPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.count(function (err,count) {
                    collection.find(criterio).skip((pg-1)*5).limit(5).toArray(function(err, usuarios) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(usuarios,count);
                        }
                        db.close();
                });
                });
            }
        });
    },
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find({email: usuario.email}).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        if (usuarios == null || usuarios.length == 0) {
                            collection.insert(usuario, function (err, result) {
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    funcionCallback(result.ops[0]._id);
                                }
                            });
                        }
                        else
                            funcionCallback(null);
                    }
                    db.close();
                });
            }
        });
    },

    insertarInvitacion : function(invitacion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                collection.find({emisor : invitacion.emisor, receptor: invitacion.receptor})
                    .toArray(function (err, invitaciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            if (invitaciones == null || invitaciones.length == 0) {
                                collection.insert(invitacion, function(err, result) {
                                    if (err) {
                                        funcionCallback(null);
                                    } else {
                                        funcionCallback(result.ops[0]._id);
                                    }
                                });
                            } else
                                funcionCallback(null);
                        }
                        db.close();
                    });
            }
        });
    },
    obtenerInvitaciones : function(criterio, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                collection.find(criterio).toArray(function(err, invitaciones) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(invitaciones);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerInvitacionesPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                collection.count(criterio, function (err,count) {
                    collection.find(criterio).skip((pg-1)*5).limit(5).toArray(function(err, invitaciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(invitaciones,count);
                        }
                        db.close();
                    });
                });
            }
        });
    },
    eliminarTodo : function(funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            db.collection('usuarios').deleteMany({});
            db.collection('amigos').deleteMany({});
        });
    },

    aceptarInvitacion : function(criterio, funcionCallback) {

        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                var atributo = {aceptada:true};
                collection.update(criterio, {$set: atributo}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);

                    }
                    db.close();
                });
            }
        });
    },

    obtenerAmistadesPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                collection.count(criterio, function (err,count) {
                    collection.find(criterio).skip((pg-1)*5).limit(5).toArray(function(err, invitaciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(invitaciones,count);
                        }
                        db.close();
                    });
                });
            }
        });
    }

};