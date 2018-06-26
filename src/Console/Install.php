<?php
namespace Dataview\IOPopup\Console;
use Dataview\IntranetOne\Console\IOServiceInstallCmd;
use Dataview\IOPopup\IOPopupServiceProvider;
use Dataview\IOPopup\PopupSeeder;

class Install extends IOServiceInstallCmd
{
  public function __construct(){
    parent::__construct([
      "service"=>"popup",
      "provider"=> IOPopupServiceProvider::class,
      "seeder"=>PopupSeeder::class,
    ]);
  }

  public function handle(){
    parent::handle();
  }
}
