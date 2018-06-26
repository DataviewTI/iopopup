<?php
<<<<<<< HEAD
namespace Dataview\IOGallery\Console;
use Dataview\IntranetOne\Console\IOServiceRemoveCmd;
use Dataview\IOGallery\IOGalleryServiceProvider;
=======
namespace Dataview\IOPopup\Console;
use Dataview\IntranetOne\Console\IOServiceRemoveCmd;
use Dataview\IOPopup\IOPopupServiceProvider;
>>>>>>> fe/popup added
use Dataview\IntranetOne\IntranetOne;


class Remove extends IOServiceRemoveCmd
{
  public function __construct(){
    parent::__construct([
<<<<<<< HEAD
      "service"=>"gallery",
      "tables" =>['gallery_category','galleries'],
=======
      "service"=>"popup",
      "tables" =>['popups'],
>>>>>>> fe/popup added
    ]);
  }

  public function handle(){
    parent::handle();
  }
}
