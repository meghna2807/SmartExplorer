let selectedType = "Cafes";
let allPlaces = [];
let map;

map = L.map('map').setView([28.6139, 77.2090],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ,{
    maxZoom: 20,
    attribution: '© OpenStreetMap'
}).addTo(map);

function getDistance(lat1, lng1, lat2, lng2) {
    const point1 = L.latLng(lat1,lng1);
    const point2 = L.latLng(lat2,lng2);
    
    const dist = point1.distanceTo(point2);
    return dist/1000;
}

async function loadPlaces() {
    const response = await fetch("/static/places.json");
    allPlaces = await response.json();
}

function renderCards() {
    const container = document.getElementById("result-list");
    container.innerHTML = "";

    const filtered = allPlaces.filter(p => p.type == selectedType);
    if(!filtered.length) {
        container.innerHTML = "<p>No Places Found</p>";
        return;
    }

    const icons = {
        "Cafes" : "fas fa-mug-saucer",
        "Street-Food" : "fas fa-utensils",
        "Hangout" : "fas fa-users"
    };

    filtered.forEach(place => {
        const icon = icons[place.type] || "fa-map-marker-alt";

        const card = document.createElement("div");
        card.className = "place-card";
        card.innerHTML = `
            <div class="card-header"><i class="fas ${icon}"></i></div>
            <div class="card-body">
                <div class="place-name">${place.name}</div>
                <div class="place-rating">${place.rating || "N/A"} ★</div>
                <div class="place-location"><i class="fas fa-map-marker-alt"></i> ${place.location}</div>
                <div class="place-type">${place.type}</div>
                <div class="famous">Famous for: ${place.FamousFor || "—"}</div>
            </div>
            <button class="smart-trail-btn">Smart Trail</button>
            <button class="more-details-btn">More Details</button>
        
        `;

        card.querySelector(".more-details-btn").addEventListener("click", () => {
            showDetails(place);
        });

        card.querySelector(".smart-trail-btn").addEventListener("click", () => {
            loadSmartTrail(place);
        });

        card.addEventListener("click", e => {
            if(e.target.tagName == "BUTTON") return;
            map.setView([place.lat,place.lng],15);
            L.marker([place.lat,place.lng])
                .addTo(map)
                .bindPopup(`<b>${place.name}</b>`)
                .openPopup()
        });

        container.appendChild(card);
    })
}

function loadSmartTrail(StartPlace) {
    map.eachLayer(l => {
        if(l instanceof L.Marker || l instanceof L.Polyline) {
            if(!l._url) map.removeLayer(l);
        }
    });

    const trail = [StartPlace];

    const nearestHangout = allPlaces
        .filter(p => p.type === "Hangout" && p.name !== StartPlace.name)
        .map (p => ({
            ...p,
            dist: getDistance(StartPlace.lat,StartPlace.lng,p.lat,p.lng)
        })).sort((a,b) => a.dist - b.dist)[0];

    const nearestStreetFood = allPlaces
        .filter(p => p.type === "Street-Food" && p.name !== StartPlace.name)
        .map(p => ({
            ...p,
            dist: getDistance(StartPlace.lat,StartPlace.lng,p.lat,p.lng)
        })).sort((a,b) => a.dist - b.dist)[0];

    if(nearestHangout) trail.push(nearestHangout);
    if(nearestStreetFood) trail.push(nearestStreetFood);

    const coords = trail.map(p => [p.lat,p.lng]);
    L.polyline(coords, {color: '#f59e0b',weight: 6, opacity: 0.9}).addTo(map);

    trail.forEach((p,i) => {
    const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
            className: "trail-marker",
            html: `<div style="background:#f59e0b;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;">${i+1}</div>`,
            iconSize: [28,28]
        })
    }).addTo(map);
        marker.bindPopup(`<b>${i+1}. ${p.name}</b><br>${p.type}`);
    });

    const line = L.polyline(coords);
    map.fitBounds(line.getBounds().pad(0.2));
}

function showDetails(place) {
    document.getElementById("box-name").textContent     = place.name;
    document.getElementById("box-ratings").textContent  = place.rating || "N/A";
    document.getElementById("box-location").textContent = place.location;
    document.getElementById("box-address").textContent  = place.address || "N/A";
    document.getElementById("box-phone").textContent    = place.phone || "N/A";
    document.getElementById("box-timing").textContent   = place.hours || "N/A";
    document.getElementById("box").classList.add("show");
}

document.getElementById("place-type").addEventListener("change", e => {
    selectedType = e.target.value;
    renderCards();
});

document.getElementById("search-form").addEventListener("submit", async e => {
    e.preventDefault();
    const location = document.getElementById("location-input").value.trim().toLowerCase();

    const filtered = allPlaces.filter(p => 
        p.type === selectedType &&
        p.location.toLowerCase().includes(location)
    );

    const container = document.getElementById("result-list");
    container.innerHTML = "";
    if(!filtered.length) {
        container.innerHTML = "<p>No Places Found</p>";
        return;
    }

    const temp = allPlaces;
    allPlaces = filtered;
    renderCards();
    allPlaces = temp;

    document.getElementById("box-close").addEventListener("click", () => {
        document.getElementById("box").classList.remove("show");
    });
});

(async () => {
  await loadPlaces();
  renderCards()
})();
