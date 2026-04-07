if (!coordinates) {
  document.getElementById("map").style.display = "none";
} else {
  const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/bright/style.json?key=${mapToken}`,
    center: coordinates,
    zoom: 10,
    scrollZoom: false,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.FullscreenControl(), "top-right");

  new maplibregl.Marker({ color: "#fe424d" })
    .setLngLat(coordinates)
    .setPopup(
      new maplibregl.Popup({ offset: 30, closeButton: false })
        .setHTML(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 2px;">
            <strong style="font-size:0.9rem;">Great location!</strong><br>
            <span style="font-size:0.8rem;color:#717171;">Exact address after booking</span>
          </div>
        `)
    )
    .addTo(map);
}
