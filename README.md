# 🚀 Seçil Store - Dinamik Konfigürasyon Yönetimi (Zero-Downtime)

Bu proje, e-ticaret ve arka plan servislerinin deployment, restart veya recycle gerektirmeden, **zero-downtime** (sıfır kesinti) prensibiyle konfigürasyon ayarlarını güncelleyebilmesi için geliştirilmiş mikroservis tabanlı bir mimaridir.

## 🏗️ Mimari ve Teknoloji Yığını

* **Core Kütüphane (.NET 8):** Thread-safe, jenerik tip dönüşümü destekleyen ve memory-cache kullanan ana konfigürasyon DLL'i.
* **Backend API (.NET 8 Minimal API):** Yüksek performanslı, gereksiz boilerplate kodlardan arındırılmış RESTful servis.
* **Frontend (React 18 + Vite):** Seçil Store ve SOTY marka kimliğine uygun tasarlanmış "Editöryel Konsol" UI.
* **Veritabanı (MongoDB):** Esnek JSON/BSON yapısı sayesinde dinamik ayarları tutmak için NoSQL tercih edilmiştir.
* **Orkestrasyon:** Tüm ekosistem `docker-compose` ile izole ve taşınabilir hale getirilmiştir.

## 🎯 Case Gereksinimleri ve Çözüm Yaklaşımları

1.  **Dinamik Tip Dönüşümü (`T GetValue<T>`):** Kütüphane, MongoDB'den string olarak gelen değerleri, generic mimari sayesinde çalışma anında (runtime) istenilen tipe (int, bool, double, string) güvenli bir şekilde dönüştürür.
2.  **Concurrency (Eşzamanlılık) Kontrolü:** Uygulama içi önbellekleme (Caching) mekanizmasında `ConcurrentDictionary` kullanılarak, arka plandaki Timer güncellemeleri sırasında oluşabilecek Race Condition problemleri engellenmiştir.
3.  **Fallback Mekanizması (Çökme Koruması):** Veritabanı bağlantısı kopsa dahi kütüphane hata fırlatmaz. Bellekteki (Cache) son başarılı verilerle sistemin kesintisiz çalışmasını garanti eder.
4.  **Client-Side Filtreleme:** React arayüzündeki arama işlemi sunucuya (API) yük bindirmez, state üzerindeki veriler `filter` metodu ile doğrudan tarayıcı belleğinde filtrelenir.

## ⚙️ Hızlı Başlangıç (Docker ile Kurulum)

Tüm sistemi ayağa kaldırmak için bilgisayarınızda **Docker** yüklü olması yeterlidir.

1. Proje dizininde terminali açın.
2. Aşağıdaki komutu çalıştırın:
   ```bash
   docker compose up -d --build