@php
  use Dataview\IOPopup\Popup;
  use Carbon\Carbon;

  $pp = isset($popup) ? $popup : Popup::first();
  $today = Carbon::now();
  $date_start = (new Carbon($pp->date_start));
  $date_end = filled($pp->date_end) ? new Carbon($pp->date_end) : Carbon::createFromDate(2099,1,1);
  $open_delay = filled($pp->open_delay) ? $pp->open_delay : 0;
  $close_delay = filled($pp->close_delay) ? $pp->close_delay : false;
  $is_valid_date = ($today->gte($date_start) && $today->lte($date_end));
@endphp

  @if($is_valid_date)
    @php  
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

    <div id="{{$id}}" class="modal fade __pp" data-show='true' tabindex="-1" 
    role="dialog" ia-labelledby="PopupModalTitle" aria-hidden="true">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true" class = 'ico ico-close'>CLOSE</span>
      </button>
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-body p-2 d-flex">
            <div class = '__pp-content m-auto' id = "{{$id}}">
              @if(filled($pp->url))
                <a href = '{{$pp->url}}' class = 'm-auto d-flex'>
                  <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
                </a>
              @else
                <img src = "{{$pp->group->main()->getPath()}}" class ='img-fluid'/>
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
    <script>
      $(document).ready(function(){
        //console.log('hoje','{{$today->toDateString()}}');
        //console.log('inicio','{{$date_start->toDateString()}}');
        //console.log('fim','{{$date_end->toDateString()}}');
        //console.log('result',"{{$is_valid_date}}");

        var img_w = {{$w}};
        var img_h = {{$h}};
        var ar =  img_h / img_w;
        var w,h;
        var dec = .9;
        do{
            w = img_w > screen.width ? screen.width*dec : img_w*dec;
            h = w*ar;
            dec-=(.1);
        }
        while(h>(screen.height*.8) || w>(screen.width*.8))

        $("#{{$id}} img").css({width:w+'px',height:h+'px'});

        $('#{{$id}}').modal({
          backdrop:'static',
          show:false
        }).on('shown.bs.modal', (e)=>{
          //$(e.target).css({border:'3px red solid',width:'90%!important'});
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