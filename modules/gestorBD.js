module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
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
                                    funcionCallback(usuarios[0]);
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
            //db.collection('usuarios').deleteMany({});
            db.collection('usuarios').remove({email:{$nin:["ivan@prueba.es", "maria@prueba.es", "sara@prueba.es", "ana@prueba.es"]}});
            db.collection('amigos').remove({emisor:{$nin:["edu@prueba.es"]}});
            db.collection('mensajes').remove({texto:"Ivan"});
            db.collection('mensajes').remove({texto:"Encantada de conocerte"});
        });
    },

    aceptarInvitacion : function(criterio, funcionCallback) {

        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                var atributo = {aceptada:true};
                collection.updateOne(criterio, {$set: atributo}, function(err, result) {
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

    obtenerAmistadesPg : function(usuario,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                var criterio = {$and:[{$or:[{emisor:usuario},{receptor:usuario}]},{aceptada:true}]};
                collection.count(criterio, function (err,count) {
                    collection.find(criterio).skip((pg-1)*5).limit(5).toArray(function(err, invitaciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            var amigos=[];
                            invitaciones.forEach(function(invitacion){
                                if(invitacion.receptor===usuario){
                                    amigos.push({_id:invitacion.emisorId,nombre: invitacion.emisorNombre,email: invitacion.emisor});
                                }else if (invitacion.emisor === usuario){
                                    amigos.push({id:invitacion.receptorId,nombre: invitacion.receptorNombre,email:invitacion.receptor});
                                }
                            });
                            funcionCallback(amigos,count);
                        }
                        db.close();
                    });
                });
            }
        });
    },
    obtenerAmistades : function(usuario,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amigos');
                var criterio = {$and:[{$or:[{emisor:usuario},{receptor:usuario}]},{aceptada:true}]};
                collection.find(criterio).toArray(function(err, invitaciones) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var amigos=[];
                        invitaciones.forEach(function(invitacion){
                            if(invitacion.receptor===usuario){
                                amigos.push({_id:invitacion.emisorId,nombre: invitacion.emisorNombre,email: invitacion.emisor});
                            }else if (invitacion.emisor === usuario){
                                amigos.push({id:invitacion.receptorId,nombre: invitacion.receptorNombre,email:invitacion.receptor});
                            }
                        });
                        funcionCallback(amigos);

                        db.close();
                    }
                });
            }
        });
    },
    enviarMensaje: function (mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                if (err) {
                    funcionCallback(null);
                } else {
                    var collection = db.collection('mensajes');
                    collection.insert(mensaje, function (err, result) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(result.ops[0]._id);
                        }
                        db.close();
                    });
                }
            }
        });
    },
    obtenerMensajes: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.find(criterio).toArray(function(err, mensajes) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(mensajes);
                    }
                    db.close();
                });
            }
        });
    },
    leerMensajes: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                var atributo = {leido:true};
                collection.updateMany(criterio, {$set: atributo}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);

                    }
                    db.close();
                });
            }
        });
    }

};