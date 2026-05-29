# Noreh Beauty Room — Sitio Web

Sitio web de lujo para Noreh Beauty Room con portfolio automático desde Google Drive.

## Instalación local

```bash
npm install
```

## Configurar variables de entorno

Abre `.env.local` y rellena:

```env
GOOGLE_DRIVE_FOLDER_ID=1H1-_FAt8Itg6MIfvEVA-gJMQLNTUO7Zy
GOOGLE_SERVICE_ACCOUNT_EMAIL=noreh-portfolio-reader@noreh-beauty.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...tu clave...\n-----END PRIVATE KEY-----\n"
```

Para obtener la `GOOGLE_PRIVATE_KEY`:
1. Abre tu archivo JSON de cuenta de servicio
2. Copia el valor del campo `"private_key"` completo (incluyendo los `\n`)
3. Pégalo entre comillas dobles en `.env.local`

## Correr en local

```bash
npm run dev
```

Abre http://localhost:3000

## Deploy en Vercel

### Opción A — Desde GitHub (recomendado)
```bash
git init
git add .
git commit -m "Noreh Beauty Room"
# Crea repo en github.com y conéctalo
git remote add origin https://github.com/TU_USUARIO/noreh-beauty-room.git
git push -u origin main
```
Luego en vercel.com → Import → selecciona el repo.

### Opción B — Vercel CLI directo
```bash
npm install -g vercel
vercel
```

### Variables de entorno en Vercel
En el dashboard de Vercel → Settings → Environment Variables, agrega:
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
- `GOOGLE_PRIVATE_KEY` (pega la clave con los `\n` literales)

## Actualizar portfolio

El portfolio se cachea 60 minutos. Para forzar actualización inmediata:

```
https://tu-sitio.vercel.app/api/portfolio?refresh=1
```

O simplemente espera — cada vez que subas una foto nueva a Drive,
aparecerá sola en el sitio en menos de una hora.

## Estructura de carpetas en Drive

```
📁 Noreh Portfolio  (tu carpeta principal)
   📁 Bridal Glam
      🖼 foto1.jpg
      🖼 foto2.jpg
   📁 Soft Glam
      🖼 ...
   📁 Dark Romance
      🖼 ...
```

Cada carpeta = una categoría en el menú orbital.
La primera foto = cover de la categoría.
Carpeta nueva = aparece automáticamente en el sitio.
