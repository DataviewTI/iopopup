<?php

namespace Dataview\IOPopup;
use Dataview\IntranetOne\IORequest;

class PopupRequest extends IORequest
{
  public function sanitize(){
    $input = parent::sanitize();

    $input['date_start'] = $input['date_start_submit'];
    $input['date_end'] =  $input['date_end_submit'];
    //$input['open_delay'] =  empty($input['open_delay']) ? 0 : $input['open_delay'];
    //$input['close_delay'] =  empty($input['close_delay']) ? 0 : $input['close_delay'];
    $input['sizes'] = $input['__dz_copy_params'];

    if(isset($input['video_start_at']))
      $input['start_at'] = str_replace(' ','',date($input['video_start_at']));
    else
      $input['start_at'] = '';

    $this->replace($input);
	}

  public function rules(){
    $this->sanitize();
    return [
      'name' => 'required|max:255',
    ];
  }
}
