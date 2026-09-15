FROM ://microsoft.com AS build
WORKDIR /src

COPY ["ColorConverterLab.csproj", "./"]
RUN dotnet restore "ColorConverterLab.csproj"

COPY . .
RUN dotnet publish "ColorConverterLab.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM ://microsoft.com AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ColorConverterLab.dll"]
