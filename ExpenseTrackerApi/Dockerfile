# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["ExpenseTrackerApi.csproj", "./"]

RUN dotnet restore "ExpenseTrackerApi.csproj"

COPY . .

RUN dotnet publish "ExpenseTrackerApi.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ExpenseTrackerApi.dll"]