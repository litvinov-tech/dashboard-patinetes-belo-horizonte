# Dashboard Patinetes - Belo Horizonte

Google Apps Script dashboard for scooter fleet operations in Belo Horizonte, MG.

The app supports:

- daily movement uploads (`.xlsx`)
- battery exchange uploads (`.xlsx`)
- monitor point uploads (`.csv`)
- all parking point uploads (`.xlsx`)
- optional city zone uploads (`.csv` with WKT polygons)
- multi-user and multi-city access control
- GoJet parking import, including `Belo Horizonte`

## Files

- `Codigo_Dashboard.gs` - Google Apps Script backend
- `dashboard.html` - web dashboard frontend
- `GUIA_RAPIDO_UPLOAD.txt` - quick upload order guide
- `MANUAL_INSTALACAO.txt` - installation and usage manual
- `MANUAL_INSTALACAO_COMPLETO.md` - full trilingual manual
- `appsscript.json` - Apps Script manifest

## Belo Horizonte Setup

1. Open [Google Apps Script](https://script.google.com).
2. Create a new project named `Dashboard Patinetes - Belo Horizonte`.
3. Replace the default `.gs` file with the contents of `Codigo_Dashboard.gs`.
4. Create an HTML file named exactly `dashboard` and paste `dashboard.html`.
5. Add `appsscript.json` as the project manifest if you use clasp.
6. Run `autorizar` once and grant permissions.
7. Deploy as a Web App.
8. Log in with the default credentials:
   - user: `admin`
   - password: `admin123`
9. Change the admin password.
10. Register the city:
   - Estado: `MG`
   - Cidade: `Belo Horizonte`

## Upload Order

For the first city setup:

1. Upload monitor points CSV for Belo Horizonte.
2. Upload all parking points XLSX for Belo Horizonte, or import them from GoJet.
3. Optionally upload city zones CSV.

Daily:

1. Upload movements XLSX.
2. Upload batteries XLSX.

Monitor point CSV format:

```csv
city_id;city_name;schedule_id;schedule_name;parking_id;parking_name;lat;lng;capacity
```

Accepted `schedule_name` values:

- `weekday-morning`
- `weekday-evening`
- `weekend`

## Notes

The dashboard map defaults to Belo Horizonte coordinates:

```text
-19.9167, -43.9345
```

The code remains multi-city, so additional cities can still be registered from the admin interface.