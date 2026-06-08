// API AYARLARI VE GLOBAL DEGISKENLER
const API_URL = "https://localhost:7220/api/geometries";

let currentLayer = null;
let editingGeometryId = null;

const geometryLayers = {};
const geometryData = {};

// HARITA VE KATMAN AYARLARI

const map = L.map("map").setView([40.1885, 29.0610], 13);

const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy: OpenStreetMap"
}).addTo(map);

const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Esri World Imagery"
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

L.control.layers(
    {
        "OpenStreetMap": osmLayer,
        "Uydu Görüntüsü": satelliteLayer
    },
    {
        "TUCBS WMS": wmsLayer,
        "Çizimler": drawnItems
    }
).addTo(map);

// LEAFLET DRAW AYARLARI
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
});

map.addControl(drawControl);

// FORM YARDIMCI FONKSIYONLARI
function openForm() {
    document.getElementById("geometryForm").style.display = "block";
}

function closeForm() {
    document.getElementById("geometryForm").style.display = "none";
    document.getElementById("geometryName").style.display = "";
    document.getElementById("geometryDescription").style.display = "";

    document.getElementById("geometryName").style.display = "";
    document.getElementById("geometryDescription").style.display = "";

    currentLayer = null;
    editingGeometryId = null;
}

function getFormValues() {
    return {
        name: document.getElementById("geometryName").value.trim(),
        description: document.getElementById("geometryDescription").value.trim()
    };
}

// YENI GEOMETRI CIZIMI
map.on(L.Draw.Event.CREATED, function (e) {
    currentLayer = e.layer;
    drawnItems.addLayer(currentLayer);

    openForm();
});

// FORM BUTONLARI
document.getElementById("saveGeometry").addEventListener("click", async function () {
    if (editingGeometryId) {
        await updateGeometryInfo();
        return;
    }

    await saveNewGeometry();
});

document.getElementById("cancelGeometry").addEventListener("click", function () {
    if (currentLayer) {
        drawnItems.removeLayer(currentLayer);
    }
    closeForm();
});

// YENI GEOMETRI KAYDETME
async function saveNewGeometry() {
    if (!currentLayer) return;

    const form = getFormValues();

    if (!form.name) {
        alert("Geometri adı zorunludur.");
        return;
    }

    const geometryJson = JSON.stringify(currentLayer.toGeoJSON().geometry);

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: form.name,
            description: form.description,
            geoJson: geometryJson
        })
    });

    if (!response.ok) {
        alert("Geometri Kaydedilemedi.");
        return;
    }

    const result = await response.json();
    const createdGeometryObject = JSON.parse(result.geoJson);

    currentLayer.geometryId = result.id;
    currentLayer.geometryName = result.name;
    currentLayer.geometryDescription = result.description;
    currentLayer.geometryType = createdGeometryObject.type;

    geometryLayers[result.id] = currentLayer;

    geometryData[result.id] = {
        id: result.id,
        name: result.name,
        description: result.description,
        type: createdGeometryObject.type
    };

    bindGeometryPopup(currentLayer, result);

    closeForm();
}

// GEOMETRI BILGISI GUNCELLEME

function openEditForm(id) {
    const layer = geometryLayers[id];

    if (!layer) return;

    editingGeometryId = id;

    document.getElementById("geometryName").value = layer.geometryName ?? "";
    document.getElementById("geometryDescription").value = layer.geometryDescription ?? "";

    openForm();
}

async function updateGeometryInfo() {
    const form = getFormValues();

    if (!form.name) {
        alert("Geometri adı zorunludur.");
        return;
    }

    const response = await fetch(`${API_URL}/${editingGeometryId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: form.name,
            description: form.description
        })
    });

    if (!response.ok) {
        alert("Güncelleme başarısız oldu.");
        return;
    }

    //düzenlenen katmanı bul
    const layer = geometryLayers[editingGeometryId];

    layer.geometryName = form.name;
    layer.geometryDescription = form.description;

    geometryData[editingGeometryId].name = form.name;
    geometryData[editingGeometryId].description = form.description;

    bindGeometryPopup(layer, {
        id: editingGeometryId,
        name: form.name,
        description: form.description
    });

    closeForm();
}

// VERITABANINDAN GEOMETRILERI YUKLEME
async function loadGeometries() {
    const response = await fetch(API_URL);
    const geometries = await response.json();

    geometries.forEach(item => {
        const geoJsonObject = JSON.parse(item.geoJson);

        L.geoJSON(geoJsonObject, {
            onEachFeature: function (feature, layer) {
                layer.geometryId = item.id;
                layer.geometryName = item.name;
                layer.geometryDescription = item.description;
                layer.geometryType = geoJsonObject.type;

                geometryLayers[item.id] = layer;

                geometryData[item.id] = {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    type: geoJsonObject.type
                };

                bindGeometryPopup(layer, item);

                drawnItems.addLayer(layer);
            }
        });
    });
}

// POPUP OLUSTURMA
function bindGeometryPopup(layer, item) {
    layer.bindPopup(`
        <b>${item.name}</b><br>
        ${item.description ?? ""}<br><br>
        <button onclick="openEditForm(${item.id})">Düzenle</button>
        <button onclick="deleteGeometry(${item.id})">Sil</button>
        <button onclick="analyzeGeometry(${item.id})">Analiz Et</button>
    `);
}

// GEOMETRI SILME
async function deleteGeometry(id) {
    const confirmed = confirm("Bu geometri silinsin mi?");

    if (!confirmed) return;

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("Silme işlemi başarısız oldu.");
        return;
    }

    const layer = geometryLayers[id];
    if (layer) {
        drawnItems.removeLayer(layer);
    }

    delete geometryLayers[id];
    delete geometryData[id];
}

// GEOMETRI GÜNCELLEME
map.on(L.Draw.Event.EDITED, async function (e) {
    e.layers.eachLayer(async function (layer) {
        const geometryId = layer.geometryId;

        if (!geometryId) return;

        const geometryJson = JSON.stringify(layer.toGeoJSON().geometry);

        await fetch(`${API_URL}/${geometryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                geoJson: geometryJson
            })
        });

        console.log(`Geometri ${geometryId} Güncellendi.`);
    });
});

// GEOMETRIK ANALIZ
async function analyzeGeometry(id) {
    const response = await fetch(`${API_URL}/${id}/contained`);
    const results = await response.json();

    resetLayerStyles();
    highlightSelectedGeometry(id);
    highlightAnalysisResults(results);
    showAnalysisPanel(results);
}

// KATMAN STYLERINI SIFIRLAMA
function resetLayerStyles() {
    Object.values(geometryLayers).forEach(layer => {
        if (layer.setStyle) {
            layer.setStyle({
                color: "#3388ff",
                weight: 3
            });
        }
    });
}

// Seçilen geometrinin vurgulanması için kullanılan fonksiyon
function highlightSelectedGeometry(id) {
    const layer = geometryLayers[id];
    if (layer && layer.setStyle) {
        layer.setStyle({
            color: "green",
            weight: 5
        });
    }
}

// Analiz sonuçlarını vurgulamak için kullanılan fonksiyon
function highlightAnalysisResults(results) {
    results.forEach(item => {
        const layer = geometryLayers[item.id];
        if (layer && layer.setStyle) {
            layer.setStyle({
                color: "red",
                weight: 5
            });
        }
    });
}

function showAnalysisPanel(results) {
    const panel = document.getElementById("analysisResult");
    const content = document.getElementById("analysisContent");

    if (results.length === 0) {
        content.innerHTML = "<p>Bu alan içinde başka bir geometri bulunmamaktadır.</p>";
    }
    else {
        content.innerHTML = `
            <p><strong>${results.length}</strong> geometri bulundu:</p>
            <ul>
                ${results.map(x => `
                    <li>
                        <strong>${x.name}</strong>
                    </li>
                `).join("")}
            </ul>
        `;
    }
    panel.style.display = "block";
}

// GEOMETRI ARAMA
document.getElementById("searchGeometryButton").addEventListener("click", searchGeometry);

document.getElementById("geometrySearchInput").addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        searchGeometry();
    }
});

function searchGeometry() {
    const searchText = document
        .getElementById("geometrySearchInput")
        .value
        .toLowerCase()
        .trim();

    if (!searchText) {
        alert("Lütfen arama metni giriniz.");
        return;
    }

    const foundItem = Object.values(geometryData)
        .find(x => x.name.toLowerCase().includes(searchText));

    if (!foundItem) {
        alert("Aranan geometri bulunamadı.");
        return;
    }

    const layer = geometryLayers[foundItem.id];
    if (!layer) return;

    if (layer.getBounds) {
        map.fitBounds(layer.getBounds());
    }
    else if (layer.getLatLng) {
        map.setView(layer.getLatLng(), 17);
    }

    layer.openPopup();
}

// GEOMETRI TIPI FILTRELEME
document.querySelectorAll(".geometry-type-filter").forEach(checkbox => {
    checkbox.addEventListener("change", applyGeometryTypeFilter);
});

function applyGeometryTypeFilter() {
    const selectedTypes = Array.from(document.querySelectorAll(".geometry-type-filter:checked")).map(x => x.value);

    Object.values(geometryLayers).forEach(layer => {
        if (selectedTypes.includes(layer.geometryType)) {
            drawnItems.addLayer(layer);
        }
        else {
            drawnItems.removeLayer(layer);
        }
    });
}

// UYGULAMA BASLANGICI
loadGeometries();