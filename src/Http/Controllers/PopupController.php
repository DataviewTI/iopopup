<?php
namespace Dataview\IOPopup;
  
use Dataview\IntranetOne\IOController;
use Illuminate\Http\Response;

use App\Http\Requests;
use Dataview\IOPopup\PopupRequest;
use Dataview\IOPopup\Popup;
use Dataview\IntranetOne\Video;
use Dataview\IntranetOne\Group;
use Validator;
use DataTables;
use Session;
use Sentinel;

class PopupController extends IOController{

	public function __construct(){
    $this->service = 'popup';
	}

  public function index(){
		return view('Popup::index');
	}
	
	public function list(){
    $query = Popup::select('id','name','url','date_start','date_end','group_id','video_id','close_on_esc','open_delay','close_delay')
    ->with([
      'group'=>function($query){
        $query->select('groups.id','sizes');
      },
      'video'=>function($query){
        $query->select('videos.id');
      }
    ])
    ->get();
  
    return Datatables::of(collect($query))->make(true);
  }

	public function create(PopupRequest $request){
    $check = $this->__create($request);
    if(!$check['status'])
      return response()->json(['errors' => $check['errors'] ], $check['code']);	
      
    $obj = new Popup($request->all());
    if($request->sizes!= null){
      $obj->setAppend("sizes",$request->sizes);
      $obj->setAppend("has_images",$request->has_images);
      $obj->save();
    }
      if($request->video_url != null){
        $_vdata = json_decode($request->video_data);
        
        $obj->video()->associate(Video::create([
          'url' => $request->video_url,
          'source' => $_vdata->source,
          'title' => $request->video_title,
          'description' => $request->video_description,
          'date' => $request->video_date_submit,
          'thumbnail' => $request->video_thumbnail,
          'data' => $request->video_data,
          'start_at' => $request->start_at
        ]));
        $obj->save();
      }

    if($request->sizes!= null && $request->has_images>0){
      $obj->group->manageImages(json_decode($request->__dz_images),json_decode($request->sizes));
      $obj->save();
    }

    return response()->json(['success'=>true,'data'=>null]);
	}

  public function view($id){
    $check = $this->__view();
    if(!$check['status'])
      return response()->json(['errors' => $check['errors'] ], $check['code']);	

    $query = Popup::select('id','name','url','width','height','date_start','date_end','open_delay','close_delay','group_id','video_id','close_on_esc')
      ->with([
          'video','group'=>function($query){
          $query->select('groups.id','sizes')
          ->with('files');
        },
      ])
      ->orderBy('date_start','desc')
      ->where('id',$id)
      ->get();
				
			return response()->json(['success'=>true,'data'=>$query]);
	}
	
	public function update($id,PopupRequest $request){
    $check = $this->__update($request);
    if(!$check['status'])
      return response()->json(['errors' => $check['errors'] ], $check['code']);	

      $_new = (object) $request->all();
			$_old = Popup::find($id);
			
      $upd = ['name','url','date_start','date_end','open_delay','close_delay','close_on_esc','width','height'];

      foreach($upd as $u)
        $_old->{$u} = $_new->{$u};

      
      if($_old->group != null){
        $_old->group->sizes = $_new->sizes;
        $_old->group->manageImages(json_decode($_new->__dz_images),json_decode($_new->sizes));
        $_old->group->save();
      }
      else
				if(count(json_decode($_new->__dz_images))>0){
					$_old->group()->associate(Group::create([
            'group' => "Album do Popup".$id,
            'sizes' => $_new->sizes
            ])
          );
					$_old->group->manageImages(json_decode($_new->__dz_images),json_decode($_new->sizes));
				}
		
        if($_old->video != null){
          if($_new->video_url==null){
            $_old->video_id = null;
          }
          else{
            $_vdata = json_decode($_new->video_data);
            $_old->video->url = $_new->video_url;
            $_old->video->source = $_vdata->source;
            $_old->video->title = $_new->video_title;
            $_old->video->description = $_new->video_description;
            $_old->video->date = $_new->video_date_submit;
            $_old->video->thumbnail = $_new->video_thumbnail;
            $_old->video->data = $_new->video_data;
            $_old->video->start_at = $_new->start_at;
            $_old->video->save();
          } 
        }
        else
        {
          if($_new->video_data!=null){
            $_vdata = json_decode($_new->video_data);
            $_old->video()->associate(Video::create([
              'url' => $_new->video_url,
              'source' => $_vdata->source, //depois fazer esse dado vir do submit		
              'title' => $_new->video_title,
              'description' => $_new->video_description,
              'date' => $_new->video_date_submit,
              'thumbnail' => $_new->video_thumbnail,
              'data' => $_new->video_data,
              'start_at' => $_new->start_at
            ]));
          }
        }

        $_old->save();
			return response()->json(['success'=>$_old->save()]);
	}

	public function delete($id){
    $check = $this->__delete();
    if(!$check['status'])
      return response()->json(['errors' => $check['errors'] ], $check['code']);	

      $obj = Popup::find($id);
			$obj = $obj->delete();
			return  json_encode(['sts'=>$obj]);
  }

}
