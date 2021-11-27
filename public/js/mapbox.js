/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGNkMTUwMiIsImEiOiJja3djdm9rMGUzN25zMnZtbngzZng1ZnNzIn0.bHvrXvH4C4d2X_k9ybuk1w';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        // center: [-118.113491, 34.111745],
        // zoom: 6,
        // scrollZoom: true,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loca) => {
        // Create maker
        const el = document.createElement('div');
        el.className = 'marker';
        // Add marker

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(loca.coordinates)
            .addTo(map);
        // add popup
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loca.coordinates)
            .setHTML(`<h4>Day ${loca.day}: ${loca.description}</h4>`)
            .addTo(map);
        // extend map bounds with current location
        bounds.extend(loca.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            right: 100,
            left: 100,
        },
    });
};
