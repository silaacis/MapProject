# MapProject

Leaflet.js ve ASP.NET Core Web API kullanılarak geliştirilmiş web tabanlı bir CBS (Coğrafi Bilgi Sistemi) uygulamasıdır. Uygulama, kullanıcıların harita üzerinde geometri oluşturmasına, düzenlemesine, silmesine ve temel mekânsal analiz işlemleri gerçekleştirmesine olanak sağlar.

Geometriler GeoJSON formatında saklanır ve REST API üzerinden yönetilir. Proje; harita servisleri, GeoJSON veri modeli, katman yönetimi ve mekânsal analiz gibi temel Web GIS bileşenlerini içermektedir.

## Özellikler

* Nokta (`Point`), çizgi (`LineString`) ve alan (`Polygon`) çizme ve düzenleme
* Geometri meta verisi (isim, açıklama) ile kayıt oluşturma
* Geometri güncelleme ve silme işlemleri
* GeoJSON tabanlı veri yönetimi
* Geometri adına göre arama
* Geometri tipine göre filtreleme
* Bir geometrinin içerisinde bulunan diğer geometrileri analiz etme
* Analiz sonuçlarını harita üzerinde vurgulama
* OpenStreetMap ve Uydu görüntüsü katmanları
* WMS katman desteği

## Kullanılan Teknolojiler

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* Leaflet.js
* Leaflet Draw

### Backend

* ASP.NET Core Web API

### Harita Servisleri

- OpenStreetMap taban haritası
- Esri World Imagery uydu görüntüleri
- TUCBS WMS servisleri

## Sistem Mimarisi

```text
Frontend (Leaflet.js)
        │
        ▼
ASP.NET Core Web API
        │
        ▼
Veritabanı
```

## Hızlı Başlat

1. Backend API'yi çalıştırın veya `API_URL` değerini güncelleyin (`app.js`).
2. Proje dizinini bir statik sunucu ile yayınlayın:

```bash
python -m http.server 5500
```

3. Tarayıcı üzerinden uygulamayı açın:

```text
http://localhost:5500
```

## API Sözleşmesi

Frontend varsayılan olarak aşağıdaki endpoint'i kullanır:

```text
https://localhost:7220/api/geometries
```

### Endpointler

| Method | Endpoint                         | Açıklama                         |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/api/geometries`                | Tüm geometrileri getirir         |
| POST   | `/api/geometries`                | Yeni geometri oluşturur          |
| PUT    | `/api/geometries/{id}`           | Geometri veya metadata günceller |
| DELETE | `/api/geometries/{id}`           | Geometri siler                   |
| GET    | `/api/geometries/{id}/contained` | İçerme analizi gerçekleştirir    |

## Dosya Yapısı

```text
MapProject
│
├── index.html
├── app.js
├── style.css
```

* **index.html** → Arayüz ve harita bileşenleri
* **app.js** → Harita işlemleri, CRUD operasyonları ve mekânsal analiz mantığı
* **style.css** → Uygulama stilleri

## Proje Kapsamı

Bu proje kapsamında;

* Leaflet.js ile interaktif harita geliştirme
* GeoJSON veri modeli kullanımı
* REST API entegrasyonu
* Katman yönetimi
* Geometri CRUD işlemleri
* Temel mekânsal analiz uygulamaları

gerçekleştirilmiştir.
