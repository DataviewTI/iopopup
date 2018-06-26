<?php
namespace Dataview\IOPopup\Console;
use Dataview\IntranetOne\Console\IOServiceRemoveCmd;
use Dataview\IOPopup\IOPopupServiceProvider;
use Dataview\IntranetOne\IntranetOne;


class Remove extends IOServiceRemoveCmd
{
  public function __construct(){
    parent::__construct([
      "service"=>"popup",
      "tables" =>['popups'],
    ]);
  }

  public function handle(){
    parent::handle();
  }
}
