using System.Collections.Concurrent;
using ConfigurationReader.Interfaces;
using ConfigurationReader.Models;
using MongoDB.Driver;

namespace ConfigurationReader;

public class ConfigurationReader : IConfigurationReader
{
    private readonly string _applicationName;
    private readonly string _connectionString;
    private readonly int _refreshTimerIntervalInMs;
    
    private ConcurrentDictionary<string, string> _cache;
    private Timer _timer;

    public ConfigurationReader(string applicationName, string connectionString, int refreshTimerIntervalInMs)
    {
        _applicationName = applicationName;
        _connectionString = connectionString;
        _refreshTimerIntervalInMs = refreshTimerIntervalInMs;
        
        _cache = new ConcurrentDictionary<string, string>();

        // 1. Sistem ilk ayağa kalkarken (initialize) veritabanına gidip mevcut ayarları çekiyoruz.
        LoadSettingsFromDb();

        // 2. Timer'ı başlatıyoruz. Verilen milisaniye periyodunda arka planda çalışıp değişiklikleri kontrol edecek.
        _timer = new Timer(UpdateCacheCallback, null, _refreshTimerIntervalInMs, _refreshTimerIntervalInMs);
    }

    public T GetValue<T>(string key)
    {
        // Cache'de bu anahtar kelime (key) var mı diye bakıyoruz.
        if (!_cache.TryGetValue(key, out string stringValue))
        {
            // Yoksa, istenen tipin boş (default) halini dön.
            return default(T);
        }

        try
        {
            // İSTENEN KURAL: Her tipe ait dönüş bilgisini kendi içinde halletmeli.
            // İşte o sihirli kısım: Veritabanından string gelen veriyi ("1", "50", "true")
            // kullanıcının istediği T tipine (int, bool vb.) dinamik olarak çeviriyoruz.
            return (T)Convert.ChangeType(stringValue, typeof(T));
        }
        catch (Exception)
        {
            // Çevirme hatası olursa sistemi çökertme, boş değer dön
            return default(T);
        }
    }

    private void UpdateCacheCallback(object state)
    {
        // Timer her tetiklendiğinde veritabanına gidip yeni verileri alır
        LoadSettingsFromDb();
    }

    private void LoadSettingsFromDb()
    {
        try
        {
            // MongoDB'ye bağlanıyoruz
            var client = new MongoClient(_connectionString);
            var database = client.GetDatabase("SecilConfigDb");
            var collection = database.GetCollection<ConfigurationItem>("Settings");

            // İSTENEN KURAL: Yalnızca IsActive = 1 (true) olanları ve
            // Yalnızca bu servise ait (ApplicationName) kayıtları dönmelidir.
            var records = collection.Find(x => x.ApplicationName == _applicationName && x.IsActive).ToList();

            // Eğer başarıyla çektiysek, cache'i güncelliyoruz
            foreach (var item in records)
            {
                // AddOrUpdate: Varsa değerini güncelle, yoksa yeni ekle. (Thread-Safe işlem)
                _cache.AddOrUpdate(item.Name, item.Value, (key, oldValue) => item.Value);
            }
        }
        catch (Exception)
        {
            // İSTENEN KURAL: Kütüphane storage'a erişemediğinde son başarılı kayıtlarla çalışabilmelidir.
            // Bu yüzden veritabanı bağlantısı koparsa veya sunucu çökerse burada hiçbir hata fırlatmıyoruz.
            // Catch bloğu boş geçiyor, sistem RAM'deki (cache) eski verilerle tıkır tıkır çalışmaya devam ediyor!
        }
    }
}