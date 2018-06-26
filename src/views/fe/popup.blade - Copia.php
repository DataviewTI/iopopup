@php
  use Dataview\IOPopup\Popup;

  $pp = isset($popup) ? $popup : Popup::first();
  $is_landscape = true;

  if($pp->group!==''){
    if(filled($pp->w) || filled($pp->h)){

      $w = filled($pp->w) ? $pp->w : 'auto';
      $h = filled($pp->h) ? $pp->h : 'auto';
    }
    else{
      list($w, $h) = getimagesize($pp->group->main()->getSRCImg());
      $is_landscape = ($w >= $h);
    }
  }
  else{
  }

  $id = str_random(6);
@endphp


<div class = '__pp-backdrop'>
  <div class = '__pp-content' id = "{{$id}}" style = "width:{{$w}}px; height:{{$h}}px;">
    <i class = '__pp-close' data-target="#{{$id}}" data-dismiss="alert">close</i>
    @if(filled($pp->url))
      <a href = '{{$pp->url}}'>
        <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
      </a>
    @else
      <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
    @endif
  </div>
  <script>
    (function(){
      var img_w = {{$w}};
      var img_h = {{$h}};
      var ar =  img_h / img_w;
      var w,h;
      var dec = .8;
      do{
         w = img_w > screen.width ? screen.width*dec : img_w;
         h = w*ar;
         dec-=(.1);
         console.log(dec);
      }
      while(h>(screen.height*.8))

      var obj = document.getElementById("{{$id}}");
      obj.style.width = w+'px';
      obj.style.height = h+'px'
    })();
  </script>
</div>