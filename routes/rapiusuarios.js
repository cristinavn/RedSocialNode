module.exports = function(app, gestorBD){

    app.get("/api/amigos", function(req,res){
        var criterio = {$and:[{$or:[{emisor:res.usuario},{receptor:res.usuario}]},{aceptada:true}]};
        gestorBD.obtenerAmistades( criterio, function(amistades) {
            if (amistades == null) {
                res.status(500);
                res.json( {
                    error : "Se ha producido un error"
                })
            } else {
                res.status(200);
                var amigos=[];
                amistades.forEach(function(invitacion){
                    if(invitacion.receptor===res.usuario){
                       amigos.push({_id:invitacion.emisorId,nombre: invitacion.emisorNombre,email: invitacion.emisor});
                    }else if (invitacion.emisor === res.usuario){
                      amigos.push({id:invitacion.receptorId,nombre: invitacion.receptorNombre,email:invitacion.receptor});
                    }
                });
                res.send( JSON.stringify(amigos) );
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
            }
        });
    });
}