using System;

namespace ConfigurationReader.Models;

// Tüm veritabanı tablolarımızda ortak olacak özellikleri buraya yazıyoruz.
public abstract class BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public bool IsActive { get; set; } = true;
}