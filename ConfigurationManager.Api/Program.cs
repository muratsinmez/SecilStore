using ConfigurationReader.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// React (Frontend) ile haberleşirken engellenmemek için CORS ayarını açıyoruz
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowReact");

// MongoDB Bağlantısı (İleride Docker'a alırken bunu çevre değişkeninden okuyacağız)
// Docker içindeyken "mongodb" adresini, normal çalışırken "localhost"u kullanacak.
var mongoHost = Environment.GetEnvironmentVariable("MONGO_HOST") ?? "localhost";
var client = new MongoClient($"mongodb://{mongoHost}:27017");
var db = client.GetDatabase("SecilConfigDb");
var collection = db.GetCollection<ConfigurationItem>("Settings");

// GET: React'in tüm kayıtları listelemesi için
app.MapGet("/api/settings", () =>
{
    var settings = collection.Find(_ => true).ToList();
    return Results.Ok(settings);
});

// POST: React'ten yeni kayıt eklenmesi için
app.MapPost("/api/settings", (ConfigurationItem newItem) =>
{
    collection.InsertOne(newItem);
    return Results.Ok(newItem);
});

// PUT: React'ten bir kaydın güncellenmesi için
app.MapPut("/api/settings/{id}", (string id, ConfigurationItem updatedItem) =>
{
    collection.ReplaceOne(x => x.Id == id, updatedItem);
    return Results.Ok(updatedItem);
});

app.Run();