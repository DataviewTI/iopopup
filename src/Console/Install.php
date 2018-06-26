<?php
<<<<<<< HEAD
namespace Dataview\IOGallery\Console;
use Dataview\IntranetOne\Console\IOServiceInstallCmd;
use Dataview\IOGallery\IOGalleryServiceProvider;
use Dataview\IOGallery\GallerySeeder;
=======
namespace Dataview\IOPopup\Console;
use Dataview\IntranetOne\Console\IOServiceInstallCmd;
use Dataview\IOPopup\IOPopupServiceProvider;
use Dataview\IOPopup\PopupSeeder;
>>>>>>> fe/popup added

class Install extends IOServiceInstallCmd
{
  public function __construct(){
    parent::__construct([
<<<<<<< HEAD
      "service"=>"gallery",
      "provider"=> IOGalleryServiceProvider::class,
      "seeder"=>GallerySeeder::class,
=======
      "service"=>"popup",
      "provider"=> IOPopupServiceProvider::class,
      "seeder"=>PopupSeeder::class,
>>>>>>> fe/popup added
    ]);
  }

  public function handle(){
    parent::handle();
  }
}
