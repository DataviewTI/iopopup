<?php

namespace Dataview\IOGallery;

use Illuminate\Support\ServiceProvider;

class IOGalleryServiceProvider extends ServiceProvider
{
    public static function pkgAddr($addr){
      return __DIR__.'/'.$addr;
    }

    public function boot()
    {
      $this->loadViewsFrom(__DIR__.'/views', 'Gallery');
      //$this->loadMigrationsFrom(__DIR__.'/database/migrations');
    }

    public function register()
    {
      $this->commands([
        Console\Install::class,
        Console\Remove::class
      ]);

      $this->app['router']->group(['namespace' => 'dataview\iogallery'], function () {
        include __DIR__.'/routes/web.php';
      });
      //buscar uma forma de não precisar fazer o make de cada classe
  
      $this->app->make('Dataview\IOGallery\GalleryController');
      $this->app->make('Dataview\IOGallery\GalleryRequest');
      //$this->app->make('Dataview\IONews\News');
    }
}
