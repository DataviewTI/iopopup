# Controle de Popup's
Controle de Popup's com definição automatica ou não de dimensões, período de exibição, delay de abertura e fechamento, redirecionamento e uso de videos do youtube ou facebook.
## Conteúdo
 
## Instalação

```sh
composer require dataview/iopopup
```
```sh
php artisan io-popup:install
```

- Configure o webpack conforme abaixo 
```js
...
let popup = require('io-popup');
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
