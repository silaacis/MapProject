# MapProject

Leaflet.js ve ASP.NET Core Web API kullanılarak geliştirilmiş web tabanlı bir CBS (Coğrafi Bilgi Sistemi) uygulamasıdır. Uygulama, kullanıcıların harita üzerinde geometri oluşturmasına, düzenlemesine, silmesine ve temel mekânsal analiz işlemleri gerçekleştirmesine olanak sağlar.

Geometriler GeoJSON formatında saklanır ve REST API üzerinden yönetilir. Proje; harita servisleri, GeoJSON veri modeli, katman yönetimi ve mekânsal analiz gibi temel Web GIS bileşenlerini içermektedir.

## Özellikler

* Nokta (Point), çizgi (LineString) ve alan (Polygon) çizme ve düzenleme
* Geometri meta verisi (isim, açıklama) ile kayıt oluşturma
* Geometri güncelleme ve silme işlemleri
* GeoJSON tabanlı veri yönetimi
* Geometri adına göre arama
* Geometri tipine göre filtreleme (Point, Polyline, Polygon)
* Bir geometrinin içerisinde bulunan diğer geometrileri analiz etme
* PostGIS / NetTopologySuite kullanılarak geometrik içerme (Contains) analizi
* Analiz sonuçlarının harita üzerinde vurgulanması
* OpenStreetMap ve uydu görüntüsü katmanları
* WMS katman desteği (TUCBS)

## Kullanılan Teknolojiler

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* Leaflet.js
* Leaflet Draw

### Backend

* ASP.NET Core Web API
* Entity Framework Core

### Veritabanı

* PostgreSQL
* PostGIS

### Harita Servisleri

* OpenStreetMap
* Esri World Imagery
* TUCBS WMS Servisleri

## Sistem Mimarisi

```text
Frontend (Leaflet.js)
        │
        ▼
ASP.NET Core Web API
        │
        ▼
PostgreSQL + PostGIS
```

## Kurulum

### Backend

1. PostgreSQL ve PostGIS kurulumu yapılır.
2. Veritabanı bağlantı bilgileri `appsettings.json` üzerinden güncellenir.
3. ASP.NET Core Web API projesi çalıştırılır.

### Frontend

Proje dizininde aşağıdaki komut çalıştırılır:

```bash
python -m http.server 5500
```

Ardından uygulama aşağıdaki adresten açılır:

```text
http://localhost:5500
```

## API Endpointleri

Varsayılan API adresi:

```text
https://localhost:7220/api/geometries
```

| Method | Endpoint                       | Açıklama                         |
| ------ | ------------------------------ | -------------------------------- |
| GET    | /api/geometries                | Tüm geometrileri getirir         |
| POST   | /api/geometries                | Yeni geometri oluşturur          |
| PUT    | /api/geometries/{id}           | Geometri veya metadata günceller |
| DELETE | /api/geometries/{id}           | Geometri siler                   |
| GET    | /api/geometries/{id}/contained | İçerme analizi gerçekleştirir    |

## Dosya Yapısı

```text
MapProject
│
├── MapApi
│
├── index.html
├── app.js
├── style.css
```

* **index.html** → Kullanıcı arayüzü ve harita bileşenleri
* **app.js** → Harita işlemleri, CRUD operasyonları ve mekânsal analiz mantığı
* **style.css** → Uygulama stilleri

## Proje Kapsamı

Bu proje kapsamında;

* Leaflet.js ile interaktif harita geliştirme
* GeoJSON veri modeli kullanımı
* REST API entegrasyonu
* Katman yönetimi
* Geometri CRUD işlemleri
* WMS servis entegrasyonu
* Temel mekânsal analiz uygulamaları
* PostGIS ve NetTopologySuite kullanımı

gerçekleştirilmiştir.
