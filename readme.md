
# Galeria de fotos para IntranetOne
Galeria de fotos...
IOGallery requires IntranetOne
## Conteúdo
 
## Instalação

```sh
composer require dataview/iogallery
```
Instalar o IntranetOne com php artisan
```sh
php artisan intranetone-gallery:install
```

## Assets
  
- Instale o pacote de assets da do serviço IOGallery via NPM

```sh
npm install assets-io-gallery --save
```

- Configure o webpack conforme abaixo 
```js
let io = require('intranetone');
let gallery = require('intranetone-gallery');
io.compile({
  services:{
    'gallery': new gallery()
  }
});
```
- Compile os assets e faça o cache
```sh
npm run dev|prod|watch
php artisan config:cache
```