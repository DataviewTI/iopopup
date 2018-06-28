<?php
namespace Dataview\IOPopup;

use Dataview\IntranetOne\IOModel;
use Dataview\IntranetOne\File as ProjectFile;
use Dataview\IntranetOne\Group;
use Illuminate\Support\Facades\Storage;

class Popup extends IOModel
{
  protected $fillable = ['name','url','date_start','date_end','open_delay','close_delay','video_id','group_id'];

  public function group(){
    return $this->belongsTo('Dataview\IntranetOne\Group');
  }

  public function video(){
    return $this->belongsTo('Dataview\IntranetOne\Video');
  }

  public static function boot(){ 
    parent::boot(); 

    static::created(function (Popup $obj) {
      if($obj->getAppend("has_images")){
        $group = new Group([
          'group' => "Album do Popup ".$obj->id,
          'sizes' => $obj->getAppend("sizes")
        ]);
        $group->save();
        $obj->group()->associate($group)->save();
      }
    });
    
  }
}
