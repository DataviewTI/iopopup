<?php
namespace Dataview\IOPopup;

use Illuminate\Database\Seeder;
use Dataview\IntranetOne\Service;
use Sentinel;
use Dataview\IntranetOne\Popup;

class PopupSeeder extends Seeder
{
    public function run(){
      //cria o serviço se ele não existe
      if(!Service::where('service','Popup')->exists()){
        Service::insert([
            'service' => "Popup",
            'alias' =>'popup',
            'ico' => 'ico-image',
            'description' => "Controle de Popup's",
            'order' => Service::max('order')+1
          ]);
      }
      //seta privilegios padrão para o user admin
      $adminRole = Sentinel::findRoleBySlug('admin');
      $adminRole->addPermission('popup.view');
      $adminRole->addPermission('popup.create');
      $adminRole->addPermission('popup.update');
      $adminRole->addPermission('popup.delete');
      $adminRole->save();
      
      //seta privilegios padrão para o user odin
      $odinRole = Sentinel::findRoleBySlug('odin');
      $odinRole->addPermission('popup.view');
      $odinRole->addPermission('popup.create');
      $odinRole->addPermission('popup.update');
      $odinRole->addPermission('popup.delete');
      $odinRole->save();
    }
} 
