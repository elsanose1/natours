
export const displayMap = (locations) =>{


    mapboxgl.accessToken = 'pk.eyJ1IjoiZWxzYW5vc2UiLCJhIjoiY2xjMmN5anFsMHo5YzNxcW03YjBlbHdvbSJ9.Lhq0y9LFzHP8SuDOqjmfxA';
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/elsanose/clc2e1uk4006614oxd4xgpssk', // style URL
    scrollZoom: false,
    interactive : false
    });
    
    
    const bounds = new mapboxgl.LngLatBounds()
    
    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';
    
        new mapboxgl.Marker({
            element : el,
            anchor : 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
    
        new mapboxgl.Popup({
            offset : 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
        
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds,{
        padding : {
            top : 200,
            bottom : 150,
            left : 100,
            right : 100
        }
    })
}
