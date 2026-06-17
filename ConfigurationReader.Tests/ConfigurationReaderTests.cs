using Xunit;
// Kendi yazdığımız kütüphaneyi test edebilmek için referansını ekliyoruz
using ConfigurationReader; 

namespace ConfigurationReader.Tests;

public class ConfigurationReaderTests
{
    // [Fact] etiketi, xUnit'e "Bu bir test metodudur, bunu çalıştır" der.
    [Fact]
    public void GetValue_WhenDatabaseIsDown_ShouldReturnDefaultValue()
    {
        // 1. Arrange (Hazırlık): Sahte ve bozuk bir MongoDB bağlantı adresi veriyoruz.
        string fakeConnectionString = "mongodb://localhost:27018/FakeDb";
        var reader = new ConfigurationReader("SERVICE-A", fakeConnectionString, 10000);

        // 2. Act (Eylem): Kütüphaneden 'MaxItemCount' adında bir int (sayı) değeri istiyoruz.
        var result = reader.GetValue<int>("MaxItemCount");

        // 3. Assert (Doğrulama): Veritabanı bağlantısı patladığı için sistemin çökmediğini 
        // ve bize int tipinin varsayılan (default) değeri olan '0'ı döndüğünü doğruluyoruz.
        Assert.Equal(0, result);
    }

    [Fact]
    public void GetValue_WhenDatabaseIsDown_ShouldReturnNullForString()
    {
        // 1. Arrange (Hazırlık)
        var reader = new ConfigurationReader("SERVICE-A", "mongodb://localhost:27018/FakeDb", 10000);

        // 2. Act (Eylem)
        var result = reader.GetValue<string>("SiteName");

        // 3. Assert (Doğrulama): String için default değer 'null' olmalıdır.
        Assert.Null(result);
    }
}