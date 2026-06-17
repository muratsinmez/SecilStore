# 1. Aşama: Kodları derleme (Build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala ve bağımlılıkları yükle
COPY ["ConfigurationManager.Api/ConfigurationManager.Api.csproj", "ConfigurationManager.Api/"]
COPY ["ConfigurationReader/ConfigurationReader.csproj", "ConfigurationReader/"]
RUN dotnet restore "ConfigurationManager.Api/ConfigurationManager.Api.csproj"

# Tüm kodları kopyala ve yayınla (Publish)
COPY . .
WORKDIR "/app/ConfigurationManager.Api"
RUN dotnet publish -c Release -o /out

# 2. Aşama: Çalıştırma (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

# Konteyner ayağa kalktığında API'yi başlat
ENTRYPOINT ["dotnet", "ConfigurationManager.Api.dll"]