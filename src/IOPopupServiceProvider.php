<?php

namespace Dataview\IOPopup;

use Illuminate\Support\ServiceProvider;

class IOPopupServiceProvider extends ServiceProvider
{
  public static function pkgAddr($addr){
    return __DIR__.'/'.$addr;
  }

  public function boot(){
    $this->loadViewsFrom(__DIR__.'/views', 'Popup');
  }

  public function register(){
  $this->commands([
    Console\Install::class,
    Console\Remove::class
  ]);

  $this->app['router']->group(['namespace' => 'dataview\iopopup'], function () {
    include __DIR__.'/routes/web.php';
  });
  
    $this->app->make('Dataview\IOPopup\PopupController');
    $this->app->make('Dataview\IOPopup\PopupRequest');
  }
}
