@php
  use Dataview\IOPopup\Popup;
  use Carbon\Carbon;

  $pp = isset($popup) ? $popup : Popup::first();
  $today = Carbon::now();
  $date_start = (new Carbon($pp->date_start));
  $date_end = filled($pp->date_end) ? new Carbon($pp->date_end) : Carbon::createFromDate(2099,1,1);
  $open_delay = filled($pp->open_delay) ? $pp->open_delay : 0;
  $close_delay = filled($pp->close_delay) ? $pp->close_delay : 0;
  $is_valid_date = ($today->gte($date_start) && $today->lte($date_end));
  $has_video = filled($pp->video_id) ? 1 : 0;
  $esc = $pp->close_on_esc==1 ? 'true' : 'false';
@endphp

  @if($is_valid_date)
    @php  
      $w = filled($pp->width) ? $pp->width : 'auto';
      $h = filled($pp->height) ? $pp->height : 'auto';
      $__imgw=$__imgh=1;
      $has_sizes = 0;
      if(!$has_video){
        if(filled($pp->width) || filled($pp->height)){
          list($__imgw,$__imgh) = getimagesize($pp->group->main()->getSRCImg());
          $has_sizes = (filled($pp->width) && filled($pp->height)) ? 0 : 1;
        }
        else{
          list($w, $h) = getimagesize($pp->group->main()->getSRCImg());
        }
      }
      else{
        $w = isset($video->w) ? $video->w : filled($pp->width) ? $pp->width : '640';
        $h = isset($video->h) ? $video->h : filled($pp->height) ? $pp->height : '480';
      }
      $id = str_random(6);
    @endphp

    <div id="{{$id}}" class="modal fade __pp" data-keyboard = "{{$esc}}" data-show='true' tabindex="-1" 
    role="dialog" ia-labelledby="PopupModalTitle" aria-hidden="true">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true" class = 'ico ico-close' title = 'fechar'></span>
      </button>
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-body p-2 d-flex">
            <div class = '__pp-content m-auto' id = "{{$id}}">
              @if(!$has_video)
                @if(filled($pp->url))
                  <a href = '{{$pp->url}}' class = 'm-auto d-flex'>
                    <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
                  </a>
                @else
                  <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
                @endif
              @else
                @desktop
                    {!! $pp->video->getEmbedPlayer(0,$w,$h) !!}
                  </div>
                @elsedesktop
                  {!! $pp->video->getEmbedPlayer(0,'100%',480) !!}
                @enddesktop
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
    <script>
      $(document).ready(function(){
        let has_video = {{$has_video}}
        let img_w,img_h;
        if(!has_video){
          if({{$has_sizes}}){
            img_w = '{{$w}}' == 'auto' ? {{$h}}*({{$__imgw}}/{{$__imgh}}) : {{$w}};
            img_h = '{{$h}}' == 'auto' ? {{$w}}*({{$__imgh}}/{{$__imgw}}) : {{$h}};
          }
          else{
            img_w = {{$w}};
            img_h = {{$h}};
          }

          let ar =  img_h / img_w;
          let w,h;
          let dec = .9;
          do{
              w = img_w > screen.width ? screen.width*dec : img_w*dec;
              h = w*ar;
              dec-=(.1);
          }
          while(h>(screen.height*.8) || w>(screen.width*.9))

          if(screen.width <= 479 ){
            $("#{{$id}} img").css({width:'100%',height:'auto'});
          }
          else
            $("#{{$id}} img").css({width:w+'px',height:h+'px'});
          
        }
        else{
          //console.log('é video')
        }

        $('#{{$id}}').modal({
          backdrop:'static',
          show:false
        }).on('shown.bs.modal', (e)=>{
          //$(e.target).css({border:'3px red solid',width:'90%!important'});
        }).on('hidden.bs.modal', function (){
          $('#{{$id}} iframe').removeAttr('src');
        });

        setTimeout(()=>{
          $('#{{$id}}').modal('show');

          if({{$close_delay}})
            setTimeout(()=>{
                $('#{{$id}}').modal('hide')
              },{{$close_delay*1000}});

          },{{$open_delay*1000}});
        });

    </script>
  @else
    <script>
        console.warn("io popup [{{$pp->name}}] expirado ou ainda não disponível!")
    </script>
  @endif