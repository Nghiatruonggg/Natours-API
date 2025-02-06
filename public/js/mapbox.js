export const displayMap = (locations) => {

  mapboxgl.accessToken =
    'pk.eyJ1IjoibmdoaWF0cnVvbmcxMTA3MDAiLCJhIjoiY202ZzVrYXg0MGIyMTJqczlveHE5eDh2ZSJ9.wsOs5Tr2fsGW4b1k0a37aw';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nghiatruong110700/cm6kilwjs00kh01pbatf94v0v',
    zoomScroll: false,
    boxZoom: false
    // center: [-118.333504, 34.023454],
    // zoom: 8
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  // Locate + Zoom into the bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });

  // disable map zoom when using scroll
  map.scrollZoom.disable();
};
