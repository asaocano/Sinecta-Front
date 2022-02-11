document.body.onload = function(){
    let errores = '';
    var points = [];
    var map = L.map('map').setView([29.0836, -110.96037], 15);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18
    }).addTo(map);
    L.control.scale().addTo(map);
    getAreas(); //Lanza método para mostrar las áreas registradas


map.on('click', onClickMap); 
let button = document.getElementById('guardar');
button.addEventListener('click', guardarFigura);

function onClickMap(e){
    points.push([e.latlng.lat, e.latlng.lng]); //Arreglo que se va construyendo para guardar posición en la base de datos
    L.marker([e.latlng.lat, e.latlng.lng]).addTo(map) //Agrega un marcador al mapa para dar una guía visual de la figura que se está construyendo
    
}
function verificarErrores(){
   let nombre = $('#nombre').val();
   console.log(nombre);
   if(errores === ''){
    if(points.length < 3){
        errores += '\n-Seleccione al menos 3 puntos';
    }
    if(nombre === ''){
        errores += '\n-El nombre no puede estar vacío';
    }
   }
    return errores;
}
async function guardarFigura(e){
    e.preventDefault();
    if(verificarErrores() !== ''){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errores,
            
        }) //Alerta que indica si el usuario hizo algo mal
        errores = ''
    }else{
        let aux = points[0];
        let primero = aux[0] + ' ' + aux[1];
        let figura = '';
        
        points.forEach(point => {figura += point[0] + ' ' + point[1] + ', ';}); //Recorre el arreglo para formar las coordenadas que se van a guardar en la base de datos
        figura = figura + primero; //Agrega al último la primera posición, pues es requisito de la base de datos que la primera y la última coordenada sean iguales
        const nombre = $('#nombre').val(); //Obtiene el nombre
        const obj = {nombre, figura};
        const respuesta = await axios.post('http://192.168.100.5/sinectaApi/', obj); //Se envia petición a API para guardar
        if(respuesta.data != null){
            points = [];
            $('#nombre').val('');
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Área agregada'
            })
            setTimeout(() => {
               location.reload();
            }, 2000);
        }
        
    }
}

 async function getAreas(){
    const respuesta = await axios.get('http://192.168.100.5/sinectaApi/'); //Petición a la API de las figuras guardadas
    let areas = respuesta.data;
    for (let index = 0; index < areas.length; index++) {
       let _area = JSON.parse(areas[index].area); //Se obtiene un resultado
       let json = _area.coordinates; //Coordenadas de la figura
       var polygon = L.polygon(json).addTo(map); //Se añade la figura al mapa
       polygon.bindPopup(areas[index].nombre); //Se añade nombre a la figura para que al hacer click en ella, muestre el nombre
       $('#areas').append(`<li>${areas[index].nombre}</li>`); //Agrega el nombre a la lista
    }
   
}
};