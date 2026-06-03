// HARITA VE KATMAN AYARLARI
const map = L.map('map').setView([40.1885, 29.0610], 13);

let currentLayer = null;
let editingGeometryId = null;
let editingLayer = null;

const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Esri World Imagery'
    }
);

const wmsLayer = L.tileLayer.wms(
    "https://tucbs-public-api.csb.gov.tr/trk_srtm_wms?",
    {
        layers: "srtm_tr_90m",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        attribution: "TUCBS SRTM"
    }
);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const baseLayers = {
    "OpenStreetMap": osmLayer,
    "Uydu Görüntüsü": satelliteLayer
};

const overlayLayers = {
    "WMS Katmanı": wmsLayer,
    "Çizimler": drawnItems
};

L.control.layers(baseLayers, overlayLayers).addTo(map);

// LEAFLET DRAW AYARLARI
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
});

map.addControl(drawControl);

// YENİ GEOMETRİ ÇİZİMİ
map.on(L.Draw.Event.CREATED, function (e) {
    currentLayer = e.layer;
    drawnItems.addLayer(currentLayer);

    document.getElementById("geometryForm").style.display = "block";
});

// GEOMETRİ KAYDETME
document.getElementById("saveGeometry")
    .addEventListener("click", async function () {
        if (editingGeometryId) {
            const name = document.getElementById("geometryName").value;

            if (!name) {
                alert("Geometri adı zorunludur.");
                return;
            }

            const description = document.getElementById("geometryDescription").value;

            const response = await fetch(`https://localhost:7220/api/geometries/${editingGeometryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });

            if (response.ok) {
                alert("Geometri bilgileri güncellendi.");
                location.reload();
            } else {
                alert("Guncelleme basarisiz oldu.");
            }

            return;
        }

        if (!currentLayer) return;

        const name = document.getElementById("geometryName").value;

        if (!name) {
            alert("Geometri adı zorunludur.");
            return;
        }

        const description = document.getElementById("geometryDescription").value;

        const geometryJson = JSON.stringify(currentLayer.toGeoJSON().geometry);

        const response = await fetch("https://localhost:7220/api/geometries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                description: description,
                geoJson: geometryJson
            })
        });

        const result = await response.json();

        currentLayer.geometryId = result.id;

        currentLayer.bindPopup(`
            <b>${result.name}</b><br>
            ${result.description ?? ""}<br><br>
            <button onclick="deleteGeometry(${result.id})">Sil</button>
        `);

        console.log(result);

        document.getElementById("geometryForm").style.display = "none";
        document.getElementById("geometryName").value = "";
        document.getElementById("geometryDescription").value = "";

        currentLayer = null;
    });

// GEOMETRİ EKLEME İPTAL
document.getElementById("cancelGeometry")
    .addEventListener("click", function () {

        if (currentLayer) {
            drawnItems.removeLayer(currentLayer);
        }

        currentLayer = null;

        document.getElementById("geometryForm").style.display = "none";
        document.getElementById("geometryName").value = "";
        document.getElementById("geometryDescription").value = "";
    });


// VERİTABANINDAN GEOMETRİLERİ YÜKLEME
async function loadGeometries() {
    const response = await fetch("https://localhost:7220/api/geometries");

    const geometries = await response.json();

    geometries.forEach(item => {
        const geoJsonObject = JSON.parse(item.geoJson);

        L.geoJSON(geoJsonObject, {
            onEachFeature: function (feature, layer) {

                layer.geometryId = item.id;

                layer.bindPopup(`
                    <b>${item.name}</b><br>
                    ${item.description ?? ""}<br><br>
                    <button onclick="openEditForm(${item.id}, '${item.name}', '${item.description ?? ""}')">Duzenle</button>
                    <button onclick="deleteGeometry(${item.id})">Sil</button>
                `);

                drawnItems.addLayer(layer);
            }
        });
    });
}
function openEditForm(id, name, description) {
    editingGeometryId = id;

    document.getElementById("geometryName").value = name;
    document.getElementById("geometryDescription").value = description;

    document.getElementById("geometryForm").style.display = "block";
}

// GEOMETRİ SİLME
async function deleteGeometry(id) {
    const confirmed = confirm("Bu geometri silinsin mi?");

    if (!confirmed) return;

    const response = await fetch(`https://localhost:7220/api/geometries/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        alert("Geometri silindi.");
        location.reload();
    } else {
        alert("Silme işlemi başarısız oldu.");
    }
}

// GEOMETRİK DÜZENLEME (EDIT)
map.on(L.Draw.Event.EDITED, async function (e) {

    const layers = e.layers;

    layers.eachLayer(async function (layer) {

        const geometryId = layer.geometryId;

        if (!geometryId) return;

        const geometryJson = JSON.stringify(layer.toGeoJSON().geometry);

        await fetch(
            `https://localhost:7220/api/geometries/${geometryId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    geoJson: geometryJson
                })
            });

        console.log(`Geometri ${geometryId} güncellendi`);
    });
});

loadGeometries();