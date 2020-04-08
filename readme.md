# Controle de Popup's

Controle de Popup's com definição automatica ou não de dimensões, período de exibição, delay de abertura e fechamento, redirecionamento e uso de videos do youtube ou facebook.

## Instalação

#### Composer installation

Laravel 7 or above, PHP >= 7.2.5

```sh
composer require dataview/iopopup dev-master
```

laravel 5.6 or below, PHP >= 7 and < 7.2.5

```sh
composer require dataview/iopopup 1.0.0
```

#### Laravel artisan installation

```sh
php artisan io-popup:install
```

- Configure o webpack conforme abaixo

```js
...
let popup = require('intranetone-popup');
io.compile({
  services:[
    ...
    new popup(),
    ...
  ]
});

```

- Compile os assets e faça o cache

```sh
npm run dev|prod|watch
php artisan config:cache
```

## Frontend

- Adicione a chamada da classe ao seu arquivo .blade

```php
@php
  use Dataview\IOPopup\Popup
@endphp
```

- Insira o componente abaixo informando o ID do popup cadastrado, se "popup" não for informado, o ID mais recente será chamado.

```php
@component('Popup::fe.popup',[
  "popup"=> Popup::find(1)
])
@endcomponent
```
