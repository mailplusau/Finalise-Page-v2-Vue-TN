# Finalise Page v2 with Vue
This is an upgraded Customer Finalisation Form using SuiteScript 2.1, Vue 2 and Bootstrap 5

## Project setup
```
npm install
```

### Compiles and hot-reloads for simple UI debugging
Note: This mode run without NetSuite modules which greatly limits what the application can do
```
npm run serve
```

### Compiles, minifies and uploads to NetSuite file cabinet
Note: Output file name is under `netsuite.htmlFile` key in `package.json`
```
npm run build
```

### Suitelet, Client script and NetSuite uploader setup
This project includes a Suitelet script and a Client script in `SuiteScripts` directory.

#### To upload the scripts to NetSuite:
- Copy `.env.example` and rename to `.env`
- Edit the `.env` file with the credentials needed to upload files to NetSuite file cabinet
- Once all the correct credentials are in place, the Suitelet script can be uploaded like so:
```
node netsuite.upload.js SuiteScripts\mp_sl_finalise_page_tn_v2_vue.js
```
or
```
npm run postbuild SuiteScripts\mp_sl_finalise_page_tn_v2_vue.js
```
The 2 commands are the same and the client script can be uploaded in a similar fashion.