namespace ConfigurationReader.Models;

// Kalıtım (Inheritance) burada başlıyor: ": BaseEntity" 
public class ConfigurationItem : BaseEntity
{
    public string Name { get; set; }
    public string Type { get; set; } // "string", "int", "bool" vb.
    public string Value { get; set; }
    public string ApplicationName { get; set; }
}