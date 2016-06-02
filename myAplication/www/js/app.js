/**
 * Created by dev10 on 12/23/2015.
 */
var app_angular = angular.module('PedidosOnline', ['chart.js','ui.calendar','angular-websql', 'ngResource', 'ngRoute']);

app_angular.config(['$routeProvider',//'$locationProvider',
    function ($routeProvider) {
        //, $locationProvider) {
        $routeProvider
            .when("/", {
                controller: 'appController',
                templateUrl: "view/home/home.html"
            })
            .when('/:modulo/:url', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'appController'
            })
            .when('/:modulo/:url/:personId', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'appController'
            })
            /*.when("/:modulo/:url",{
             controller:'appController',
             templateUrl: function(urlattr){
             if(urlattr.modulo=='pagina_Actual')
             return '#'+ urlattr.url;
             if(urlattr.modulo=='' || urlattr.url=='') {
             urlattr.modulo = 'home';
             urlattr.urlurl = 'home';
             }
             //angular.element('#titulo').html( urlattr.urlurl);
             return 'view/'+ urlattr.modulo+'/' + urlattr.url + '.html';
             }
             })*/
            .otherwise("/");
        // use the HTML5 History API
        //$locationProvider.html5Mode(true);
    }
]);

//CONTROLADOR DE GENERAL
app_angular.controller('sessionController',['Conexion','$scope','$location','$http','$route', '$routeParams', 'Factory' ,function (Conexion, $scope, $location, $http,$route, $routeParams, Factory) {
    $scope.sessiondate=JSON.parse(window.localStorage.getItem("CUR_USER"));
    $scope.pedidos=[];
    $scope.actividades=[];
    $scope.$watch('online', function(newStatus) {  });
    $scope.datosSubir=function(){
        $scope.pedidos=[];
        $scope.actividades=[];
        $scope.detalle_pedidos=[];
        $scope.pedido=[];
        CRUD.select('select *from crm_actividades where usuario_modificacion="MOBILE"',function(elem){$scope.actividades.push(elem)})
        CRUD.select('select *from t_pedidos where usuariomod="MOBILE"',function(elem){$scope.pedidos.push(elem)})
        CRUD.select('select *from t_pedidos_detalle where usuariomod="MOBILE"',function(elem){$scope.detalle_pedidos.push(elem)})
        window.setTimeout(function(){
            ALMACENARDATOS[2]=$scope.actividades;
            ALMACENARDATOS[0]=$scope.pedidos;
            ALMACENARDATOS[1]=$scope.detalle_pedidos;
            //Validacion de que lo que se va a subir contega datos 
            if (ALMACENARDATOS[0].length==0) {
                if (ALMACENARDATOS[1].length==0) {
                    if (ALMACENARDATOS[2].length==0) {
                        Mensajes('No hay Datos que Subir','error','') 
                        ProcesadoHiden();
                        return;
                    }
                }
            }
            var cantidadDatos=
            $scope.usuario=$scope.sessiondate.nombre_usuario;
            $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
            for (var i =0;i< STEP_SUBIRDATOS.length;i++) {
                debugger
                //ACTIVIDADES 
                if (STEP_SUBIRDATOS[i]==ENTIDAD_ACTIVIDADES && ALMACENARDATOS[i].length!=0) {
                    for (var j =0;j< ALMACENARDATOS[i].length ; j++) {
                        $scope.objeto=ALMACENARDATOS[i][j];
                        $http({
                          method: 'GET',
                          url: 'http://demos.pedidosonline.co/Mobile/SubirDatos?usuario='+$scope.usuario+'&entidad=ACTIVIDADES&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify($scope.objeto),
                            }).then(
                            function success(data) { console.log(data.data.message)}, 
                            function error(err) {Mensajes('Error al Subir la Actividad','error','');return 
                        });  
                    }  
                }
                //PEDIDOS
                if (STEP_SUBIRDATOS[i]==ENTIDAD_PEDIDOS && ALMACENARDATOS[i].length!=0) {
                    debugger
                    for (var j =0;j< ALMACENARDATOS[i].length ; j++) {
                        debugger
                        $scope.objeto=ALMACENARDATOS[i][j];
                        $http({
                          method: 'GET',
                          url: 'http://demos.pedidosonline.co/Mobile/SubirDatos?usuario='+$scope.usuario+'&entidad=PEDIDOS&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify($scope.objeto),
                        })
                        .then(
                            function success(data) 
                            {
                                debugger
                                $scope.pedido.rowid=data.data.rowid
                                angular.forEach($scope.detalle_pedidos,function(event){
                                    debugger
                                    if (event.rowid_pedido==$scope.objeto.rowid) {
                                        //Enviar Detalle del Pedido
                                        debugger
                                        $scope.detalle=event;
                                        $scope.detalle.rowid_pedido=$scope.pedido.rowid;
                                        $http({
                                          method: 'GET',
                                          url: 'http://demos.pedidosonline.co/Mobile/SubirDatos?usuario='+$scope.usuario+'&entidad=PEDIDO_DETALLE&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify($scope.detalle),
                                        })
                                        .then(
                                            function success(data) {}, 
                                            function error(err) {Mensajes('Error al Subir El Pedido','error','');return }
                                        ); 
                                    }
                                });
                            }, 
                            function error(err) {Mensajes('Error al Subir El  Pedido','error','');return  }
                        ); 
                        
                    }  
                }
            }
            Mensajes('Datos Subidos Correctamente','success','') 
        },3000)
    }

    $scope.sincronizar=function(){
        ProcesadoShow();
        $scope.datosSubir();
        window.setTimeout(function(){
            //VACIAR TABLAS
            CRUD.Updatedynamic("delete from crm_actividades");
            CRUD.Updatedynamic("delete from t_pedidos");
            CRUD.Updatedynamic("delete from t_pedidos_detalle");
            CRUD.Updatedynamic("delete from erp_items");
            CRUD.Updatedynamic("delete from erp_entidades_master");
            CRUD.Updatedynamic("delete from erp_items_precios");
            CRUD.Updatedynamic("delete  from erp_terceros");
            CRUD.Updatedynamic("delete from erp_terceros_punto_envio");
            CRUD.Updatedynamic("delete from erp_terceros_sucursales");
            CRUD.Updatedynamic("delete from m_estados");
            CRUD.Updatedynamic("delete from m_metaclass");
            CRUD.Updatedynamic("delete from crm_contactos");
            
            //
            Sincronizar($scope.sessiondate.nombre_usuario,$scope.sessiondate.codigo_empresa);
            var contador=0;
            var  stringSentencia='';
            var NewQuery=true;
            //Guardar Nuevos Datos
            for(var i=0; i < STEP_SINCRONIZACION.length; i++)
            {
                contador=0;
                NewQuery=true;
                stringSentencia='';
                //DATOS_ENTIDADES_SINCRONIZACION[i]=localStorage.getItem(STEP_SINCRONIZACION[i].toString());
                //DATOS_ENTIDADES_SINCRONIZACION[i] = JSON.parse(DATOS_ENTIDADES_SINCRONIZACION[i]);
                for(var j=0; j < DATOS_ENTIDADES_SINCRONIZACION[i].length; j++) {
                    contador++;
                    if (STEP_SINCRONIZACION[i] == ENTIDAD_PEDIDOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0 ) {
                        //CRUD.insert('t_pedidos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        //debugger
                        if (NewQuery) {
                            stringSentencia=" insert into t_pedidos  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_cliente_facturacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_cliente_despacho+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_lista_precios+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_bodega+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_pedido+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_entrega+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_solicitud+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_punto_envio+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].observaciones+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].observaciones2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].orden_compra+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].referencia+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_base+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_descuento+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_impuesto+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_total+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_estado+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numpedido_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numfactura_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].estado_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_facturado+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cond_especial+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_doc+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cond_pago+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numremision_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_co+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_conductor_cc+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_conductor_nombre+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_placa+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_anulacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_anulacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_nota+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].criterio_clasificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].modulo_creacion+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_PEDIDOS_DETALLE  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('t_pedidos_detalle',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        //debugger
                        if (NewQuery) {
                            stringSentencia=" insert into t_pedidos_detalle  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_pedido+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_bodega+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].linea_descripcion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].factor+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad_base+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].precio_unitario+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_motivo+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].stock+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_base+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_impuesto+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_descuento+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_total_linea+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].unidad_medida+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext1+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].num_lote+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_anulacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_anulacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].flete+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento3+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento3+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_TERCEROS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_terceros',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into erp_terceros  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_interno+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].identificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_identificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].razonsocial+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_comercial+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_erp+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_activo+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_vendedor+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_cliente+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_proveedor+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_accionista+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].industria+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_industria+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].clasificacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_impuesto+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }

                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_SUCURSALES && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_terceros_sucursales',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (DATOS_ENTIDADES_SINCRONIZACION[i][j].length==0) {

                        }
                        if (NewQuery) {
                            stringSentencia=" insert into erp_terceros_sucursales  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_tercero+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_sucursal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_sucursal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_sucursal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion1+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion2+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion3+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono1+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_postal+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_ciudad+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_depto+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_pais+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_lista_precios+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_contacto+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email_contacto+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].centro_operacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_condicion_pago+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad_negocio+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_grupo_descuento+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_zona+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_bloqueo_cupo+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_bloqueo_mora+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cupo_credito+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_tipo_cliente+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].clave+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_bodega+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_division+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_canal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_principal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_criterio_clasificacion+"' "; 
                        if (contador==499) {
                            
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_MAESTROS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_entidades_master',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into erp_entidades_master  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_tipo_maestro+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_id_cia+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_rowid_maestro+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_id_maestro+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom1+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_disabled+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom2+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom3+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_PUNTOS_ENVIO  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_terceros_punto_envio',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into erp_terceros_punto_envio  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_tercero+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_sucursal+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_punto_envio+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_punto_envio+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_ITEMS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_items',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into erp_items  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_erp+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_item+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_referencia+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_codigo+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_descripcion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_linea+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext1+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext2+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad_venta+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion_extensa+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_custom1+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].impuesto_id+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].impuesto_porcentaje+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion_adicional+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad_embalaje+"' "; 
                        
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_ITEMS_PRECIOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('erp_items_precios',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into erp_items_precios  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_lista_precios+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].precio_lista+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_activacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_inactivacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].estado_item+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_ACTIVIDADES  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('crm_actividades',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        //debugger
                        if (NewQuery) {
                            stringSentencia=" insert into crm_actividades  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tema+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_prioridad+
                         "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_relacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_estado+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].relacionado_a+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_inicial+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_final+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_creacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_creacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_modificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_modificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_relacion+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_METACLASS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('m_metaclass',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into m_metaclass  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].class_code+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_reg_codigo+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_reg_nombre+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_activo+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].CreatedBy+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].CreationDate+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ModifiedBy+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ModDate+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_ESTADOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('m_estados',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into m_estados  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].id_estado+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_estado+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_estado+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_editar+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }
                    }
                    else if (STEP_SINCRONIZACION[i] == ENTIDAD_CONTACTOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                        //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                        if (NewQuery) {
                            stringSentencia=" insert into crm_contactos  ";
                            NewQuery=false;
                        }
                        else{
                            stringSentencia+= "   UNION   ";
                        }
                        stringSentencia+=  "  SELECT  '"+
                        DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_sucursal+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].identificacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombres+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].apellidos+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].skype+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ruta_imagen+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].celular+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cargo+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].area+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_principal+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_creacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_creacion+
                        "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_modificacion+
                        "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_modificacion+"' "; 
                        if (contador==499) {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                            stringSentencia="";
                            contador=0;
                        }

                    } 
                }
                if (stringSentencia!='') {
                    CRUD.Updatedynamic(stringSentencia)
                    NewQuery=true;
                }
            }
            ProcesadoHiden();
            $route.reload();
            Mensajes('Sincronizado Con Exito','success','')
            
        },5000)
        //Traer Nuevos Datos
        
        
        
    }

}]);


app_angular.controller('appController',['Conexion','$scope','$location','$http', '$routeParams', 'Factory' ,function (Conexion, $scope, $location, $http, $routeParams, Factory) {
    
    if (window.localStorage.getItem("CUR_USER") == null || window.localStorage.getItem("CUR_USER")==undefined) {
        location.href='login.html';
        return;
    }
    
    if ($routeParams.url == undefined) {
   
    }
    else {
        console.log($routeParams);
        $scope.templateUrl = 'view/' + $routeParams.modulo + '/' + $routeParams.url + '.html';
    }
    $scope.CurrentDate=function(){
        $scope.day;
        $scope.DayNow=Date.now();
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.YearS+''+$scope.MonthS+''+$scope.DayS;
        return $scope.day;
    }

    $scope.actividadesToday=[];

    var query="select  tema,descripcion,fecha_inicial,fecha_final ,replace(fecha_inicial,'-','') as fecha_inicialF,replace(fecha_final,'-','') as fecha_finalF from crm_actividades ";
    $scope.today=$scope.CurrentDate();
    CRUD.select(query,function(elem){
        var f1 = elem.fecha_inicialF.slice(0,8);
        var f2 = elem.fecha_finalF.slice(0,8);
        f1.replace(' ','');
        f2.replace(' ','');
        if (f1<=$scope.today) {
            if (f2>=$scope.today) {
                $scope.actividadesToday.push(elem);
            }
        }
    })

    $scope.cantidadTerceros=[];
    $scope.cantidadTerceros1=[];
    $scope.cantidadPedidos=[];
    $scope.cantidadPedidos1=[];
    $scope.estadisticagrafica=[];
    $scope.enero=0;
    $scope.febrero=0;
    $scope.marzo=0;
    $scope.abril=0;
    $scope.mayo=0;
    $scope.junio=0;
    $scope.registros=[];
    $scope.validacion='';
    CRUD.select('SELECT COUNT(*) as cantidad FROM erp_terceros',function(elem){$scope.cantidadTerceros.push(elem);$scope.cantidadTerceros1=$scope.cantidadTerceros[0];})
    CRUD.select('SELECT COUNT(*) as cantidad FROM t_pedidos',function(elem){$scope.cantidadPedidos.push(elem);$scope.cantidadPedidos1=$scope.cantidadPedidos[0];})
    CRUD.select("select strftime('%m', fecha_solicitud) as mes,count(strftime('%m', fecha_solicitud)) as cantidad from t_pedidos group by mes ",
        function(elem){$scope.estadisticagrafica.push(elem);
            if (elem.mes=='01') {$scope.enero=elem.cantidad};
            if (elem.mes=='02') {$scope.febrero=elem.cantidad};
            if (elem.mes=='03') {$scope.marzo=elem.cantidad};
            if (elem.mes=='04') {$scope.abril=elem.cantidad};
            if (elem.mes=='05') {$scope.mayo=elem.cantidad};
            if (elem.mes=='06') {$scope.junio=elem.cantidad};
            $scope.registros=[[$scope.enero,$scope.febrero,$scope.marzo,$scope.abril,$scope.mayo,$scope.junio]];
            
    })
    window.setTimeout(function(){
        if ($scope.estadisticagrafica.length==0) {$scope.validacion='No fue encontrado Ningun  Pedido'}
    },2000);
    
    $scope.labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
    $scope.data = [ [65, 59, 80, 81, 56, 55] ];
    $scope.colours=["#26B99A"];
    
    
    
}]);


//CONTROLADOR DE MENU
app_angular.controller('menuController', function ($scope, Factory) {
    $scope.menuList = [
        {
            nombre_opcion: 'Ventas', url: '#/', isSubmenu: true, icono: 'fa fa-bar-chart',
            submenu: [{nombre_opcion: 'Pedidos', url: '#/ventas/pedidos_ingresados'}
            ]
        },
        {
            nombre_opcion: 'Crm', url: '#/', isSubmenu: true, icono: 'icon-user',
            submenu: [{nombre_opcion: 'Clientes', url: '#/crm/terceros'}
            ]
        },
        {
            nombre_opcion: 'Configuracion', url: '#/', isSubmenu: true, icono: 'icon-cog',
            submenu: [{nombre_opcion: 'Mi Cuenta', url: '#/configuracion/mi_cuenta'}, {
                nombre_opcion: 'Cambiar Clave',
                url: '#/'
            }]
        }
    ];
});

//CONTROLADOR DEL LOGIN
app_angular.controller('loginController', function ($scope, Factory, $location, $http) {

    angular.element(document).ready(function () {
        "use strict";
        Login.init(); // Init login JavaScript
    });

    $scope.Login=function(){

        //debugger;
        $http.get("https://api.github.com/users/codigofacilito/repos")
            .success(function (data) {
                //debugger;
            })
            .error(function (err) {
                console.log("Error" + err);
            });

        //window.localStorage.setItem("user", "user:xxx;pass:xxxxxx;");

    }
});


//CONTROLADOR DE PANTALLA DE CALENDARIO
app_angular.controller('calendarioController', function ($scope, Factory) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    var h = {};

    if (angular.element('#calendar').width() <= 400) {
        h = {
            left: 'title',
            center: '',
            right: 'prev,next'
        };
    } else {
        h = {
            left: 'prev,next',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        };
    }

    angular.element('#calendar').fullCalendar({
        disableDragging: false,
        header: h,
        editable: true,
        events: [{
            title: 'All Day Event',
            start: new Date(y, m, 1),
            backgroundColor: App.getLayoutColorCode('yellow')
        }, {
            title: 'Long Event',
            start: new Date(y, m, d - 5),
            end: new Date(y, m, d - 2),
            backgroundColor: App.getLayoutColorCode('green')
        }, {
            title: 'Repeating Event',
            start: new Date(y, m, d - 3, 16, 0),
            allDay: false,
            backgroundColor: App.getLayoutColorCode('red')
        }, {
            title: 'Repeating Event',
            start: new Date(y, m, d + 4, 16, 0),
            allDay: false,
            backgroundColor: App.getLayoutColorCode('green')
        }, {
            title: 'Meeting',
            start: new Date(y, m, d, 10, 30),
            allDay: false,
        }, {
            title: 'Lunch',
            start: new Date(y, m, d, 12, 0),
            end: new Date(y, m, d, 14, 0),
            backgroundColor: App.getLayoutColorCode('grey'),
            allDay: false,
        }, {
            title: 'Birthday Party',
            start: new Date(y, m, d + 1, 19, 0),
            end: new Date(y, m, d + 1, 22, 30),
            backgroundColor: App.getLayoutColorCode('purple'),
            allDay: false,
        }, {
            title: 'Click for Google',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            backgroundColor: App.getLayoutColorCode('yellow'),
            url: 'http://google.com/',
        }
        ]
    });
});