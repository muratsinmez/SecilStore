namespace ConfigurationReader.Interfaces;

public interface IConfigurationReader
{
    // Bu bizim sözleşmemiz. Diyoruz ki: "Bu interface'i kullanan her sınıf, 
    // dışarıya bir GetValue metodu sunmak ZORUNDADIR."
    T GetValue<T>(string key);
}