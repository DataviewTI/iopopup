new IOService({
    name:'Popup',
  },
  function(self){

    $('[data-toggle="popover"]').popover();

    $('#close_on_esc').attrchange(function(attrName) {
      if(attrName == 'aria-pressed'){
        console.log($(this).attr('aria-pressed'));
        //$('#__close_on_esc').val($(this).attr('aria-pressed'));
      }
    });

    Sortable.create(document.getElementById('custom-dropzone'),{
      animation: 250,
      handle: ".dz-reorder",
    });

    //video configs
    $(".video-thumb").each(function(i,obj){
      $(obj).on('click',function(){
          $(".video-thumb").removeClass('active');
          $(this).addClass('active');
      });
    });

    $('#video_start_at').wickedpicker({
      now: "00:00:00",
      clearable: false,
      twentyFour: true,
      showSeconds: true,
      clearable: false,
      beforeShow:function(e,t){
       $(t).css({'width':$(e).parent().width()+'px'});
       self.fv[1].revalidateField('video_start_at');
      },
     });

     $('#video_start_at').on('change',function(){
      //para evitar chamadas redundantes
        if($(this).attr('data-old-value') != $(this).val()){
          $(this).attr('data-old-value',$(this).val())
          self.fv[1].revalidateField('video_start_at');
        }
     });

    //pickadate objects initialization
    $('#video_date').pickadate({
        formatSubmit: 'yyyy-mm-dd 00:00:00',
        onClose:function(){
        }
      }).pickadate('picker').on('render', function(){
        self.fv[0].revalidateField('date');
    });

     $('#btn-get-current-time').on('click',function(){
        let time = moment.duration(parseInt(self.VPlayer.__getCurrent()),'seconds');
        $('#video_start_at').val(time.format('hh : mm : ss',{trim:false}));
        $('#video_start_at').data('plugin_wickedpicker')
        .setTime({hours:time._data.hours,minutes:time._data.minutes,seconds:time._data.seconds});
        //pause video
        self.VPlayer.__pause();
     });

     //pickadate objects initialization
    $('#date_start').pickadate({
      formatSubmit: 'yyyy-mm-dd 00:00:00',
      min: new Date(),
      onClose:function(){
        //$("[name='date_end']").focus();
      }
    }).pickadate('picker').on('set', function(t){
      $('#date_end').pickadate().pickadate('picker').clear();

      if(t.select!==undefined)
        $('#date_end').pickadate().pickadate('picker').set('min',new Date(t.select));
      else
        $('#date_end').pickadate().pickadate('picker').set('min',new Date())
        self.fv[0].revalidateField('date_start');
    });

    $('#date_end').pickadate({
      formatSubmit: 'yyyy-mm-dd 00:00:00',
      min: new Date(),
      onClose:function(){
        $("[name='description']").focus();
      }
    }).pickadate('picker').on('render', function(){
      self.fv[0].revalidateField('date_end');
    });


    //Datatables initialization

    self.dt = $('#default-table').DataTable({
      aaSorting:[ [0,"desc" ]],
      ajax: self.path+'/list',
      initComplete:function(){
        //parent call
        let api = this.api();
        $.fn.dataTable.defaults.initComplete(this);

        //pickadate objects initialization
        $('#ft_dtini').pickadate({
        }).pickadate('picker').on('set', function(t){
          $('#ft_dtfim').pickadate().pickadate('picker').clear();
          if(t.select!==undefined)
            $('#ft_dtfim').pickadate().pickadate('picker').set('min',new Date(t.select));
          else
            $('#ft_dtfim').pickadate().pickadate('picker').set('min',false)
            api.draw()
        });

        $('#ft_dtfim').pickadate().pickadate('picker').on('render', function(){
          api.draw()
        });

        api.addDTBetweenDatesFilter({
          column:'date_start',
          min: $('#ft_dtini'),
          max: $('#ft_dtfim')
        });
      },
      footerCallback:function(row, data, start, end, display){
      },
      columns: [
        { data: 'id', name: 'id'},
        { data: 'name', name: 'name'},
        { data: 'date_start', name: 'date_start'},
        { data: 'date_end', name: 'date_end'},
        { data: 'actions', name: 'actions'},
      ],
      columnDefs:
      [
        {targets:'__dt_',width: "3%",class:"text-center",searchable: true,orderable:true},
        {targets:'__dt_name',searchable: true,orderable:true},
        {targets:'__dt_dt-inicial',type:'date-br',width: "9%",orderable:true,className:"text-center",
          render:function(data,type,row){
            return moment(data).format('DD/MM/YYYY');
          }
        },
        {targets:'__dt_dt-final',type:'date-br',width: "9%",orderable:true,className:"text-center",
          render:function(data,type,row){
              return data!==null ? moment(data).format('DD/MM/YYYY') : "";
          }
        },
        {targets:'__dt_s',width: "2%",orderable:false,className:"text-center",
          render:function(data,type,row){
            if(data.sizes!=''){
              data = JSON.parse(data.sizes.replace(/&quot;/g,'"'));
              let __sizes = [];
              let s;
              for(s in data.sizes){
                __sizes.push(s+': '+data.sizes[s].w+'x'+data.sizes[s].h);
              }
              return self.dt.addDTIcon({ico:'ico-structure',
              title:"<span class = 'text-left'>"+(__sizes.join('<br>'))+"</span>",
              value:1,pos:'right',_class:'text-primary text-normal',html:true});
            }
            else
              return "";
            }
        },
        {targets:'__dt_acoes',width:"7%",className:"text-center",searchable:false,orderable:false,
          render:function(data,type,row,y){
            return self.dt.addDTButtons({
              buttons:[
                // {ico:'ico-eye',_class:'text-primary',title:'preview'},
                {ico:'ico-edit',_class:'text-info',title:'editar'},
                {ico:'ico-trash',_class:'text-danger',title:'excluir'},
            ]});
          }
        }
      ]
    }).on('click',".btn-dt-button[data-original-title=editar]",function(){
      var data = self.dt.row($(this).parents('tr')).data();
      self.view(data.id);
    }).on('click','.ico-trash',function(){
      var data = self.dt.row($(this).parents('tr')).data();
      self.delete(data.id);
    }).on('click','.ico-eye',function(){
      var data = self.dt.row($(this).parents('tr')).data();
      preview({id:data.id});
    }).on('draw.dt',function(){
      $('[data-toggle="tooltip"]').tooltip();
    });

    let form = document.getElementById(self.dfId);
    let fv1 = FormValidation.formValidation(
      form.querySelector('.step-pane[data-step="1"]'),
      {
        fields: {
          name:{
            validators:{
              notEmpty:{
                message: 'O nome/título do popup é obrigatório!'
              }
            }
          },
          date_start:{
            validators:{
              notEmpty:{
                message: 'O data inicial é obrigatória'
              },
              date:{
                format: 'DD/MM/YYYY',
                message: 'Informe uma data válida!'
              }
            }
          },
          url:{
            enable:false,
            validators:{
              uri:{
                message: 'Informe uma URL válida!'
              }
            }
          },
          date_end:{
            validators:{
              date:{
                format: 'DD/MM/YYYY',
                message: 'Informe uma data válida!'
              }
            }
          },
          width:{
            enabled:true,
            validators:{
              greaterThan: {
                value: 1,
                message: 'Alt. Mínima 1px',
              },
              lessThan: {
                value: 2000,
                message: 'Larg. Máxima 2000px',
              }
            }
          },
          height:{
            enabled:true,
            validators:{
              greaterThan: {
                value: 1,
                message: 'Larg. Mínima 1px',
              },
              lessThan: {
                value: 1000,
                message: 'Alt. Máxima 1000px',
              }
            }
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          submitButton: new FormValidation.plugins.SubmitButton(),
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
          icon: new FormValidation.plugins.Icon({
            valid: 'fv-ico ico-check',
            invalid: 'fv-ico ico-close',
            validating: 'fv-ico ico-gear ico-spin'
          }),
        },
    }).setLocale('pt_BR', FormValidation.locales.pt_BR);

    // self.imgOrVideoFv = FormValidation.formValidation(
    //   form,
    //   {
    //     fields: {
    //       imageorvideo:{
    //         validators:{
    //           callback:{
    //             message: 'O popup deve conter uma imagem ou um vídeo!',
    //             callback: function(input){

    //               if(self.dz.files.length==0 && $('#video_data').val()==''){
    //                 toastr["error"]("O popup deve conter uma imagem ou um vídeo!")
    //                 return false;
    //               }
    //               return true
    //             }
    //           }
    //         }
    //       },
    //     },
    //     plugins: {
    //       trigger: new FormValidation.plugins.Trigger(),
    //       submitButton: new FormValidation.plugins.SubmitButton(),
    //       // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
    //       bootstrap: new FormValidation.plugins.Bootstrap(),
    //       icon: new FormValidation.plugins.Icon({
    //         valid: 'fv-ico ico-check',
    //         invalid: 'fv-ico ico-close',
    //         validating: 'fv-ico ico-gear ico-spin'
    //       }),
    //     },
    // }).setLocale('pt_BR', FormValidation.locales.pt_BR);

    let fv2 = FormValidation.formValidation(
      form.querySelector('.step-pane[data-step="2"]'),
      {
        fields: {
          imageorvideo:{
            validators:{
              callback:{
                message: 'O popup deve conter uma imagem ou um vídeo!',
                callback: function(input){

                  if(self.dz.files.length==0 && $('#video_data').val()==''){
                    toastr["error"]("O popup deve conter uma imagem ou um vídeo!")
                    return false;
                  }
                  return true
                }
              }
            }
          },
          video_url:{
            validators:{
              promise:{
                promise: function(input){
                  let dfd   = new $.Deferred(),
                      video = getVideoInfos($('#video_url').val()),
                      prom;

                  if(video.source != null){
                    $('#embed-container-video').addClass('loading');
                    switch(video.source){
                      case 'youtube':
                        prom = getYoutubeVideoPromise(video,self);
                        break;
                      case 'facebook':
                        prom = getFacebookVideoPromise(video,self);
                        break;
                    }

                    prom.then(resolve=>{
                      resolve.callback(resolve);
                      $('#video_title').val(video.infos.title);
                      $('#video_description').val(video.infos.description);
                      $('#video_start_at').removeAttr('disabled');
                      $('#btn-get-current-time').removeClass('__disabled mouse-off');

                      makeVideoThumbs(video,self);
                      $('#video_data').val(JSON.stringify(video));
                      dfd.resolve({ valid: true });

                      if($('#video_url').attr('data-loaded')!==undefined){
                        let vdata = JSON.parse($('#video_url').attr('data-loaded'));
                        //what need to call twice??
                        let vthumb = JSON.parse(JSON.parse($('#video_url').attr('data-thumb')));
                        $('#video_title').val(vdata.title)
                        $('#video_description').val(vdata.description)
                        $($('.container-video-thumb .video-thumb')[vthumb.pos]).css({
                          'backgroundImage': "url('"+vthumb.url+"')"
                        }).trigger('click');

                        $('#video_url').removeAttr('data-loaded').removeAttr('data-thumb');
                      }
                      self.fv[1].revalidateField('imageorvideo');
                      return dfd.promise();
                    }).
                    catch(reject=>{
                      console.log(reject);
                      reject.callback(reject);
                      let msg = reject.data != null ? reject.data : "Este link não corresponde a nenhum vídeo válido"
                      dfd.reject({
                        valid:false,
                        message: msg
                      });
                    });
                  }
                  else{
                    videoUnload(self);
                    if($('#video_url').val()=='')
                      dfd.resolve({ valid: true });
                    else
                    dfd.reject({
                      valid:false,
                      message: "Este link não corresponde a nenhum vídeo válido"
                    });

                  }
                  return dfd.promise();
                },
                message: 'O link do vídeo informado é inválido',
              },
            }
          },
          video_start_at:{
            validators:{
              callback:{
                callback:function(input){
                  let dur = moment.duration(input.value.replace(/\s/g,''));
                  let isodur = $('#video_start_at').attr('data-video-duration')
                  if(isodur !== undefined && isodur != null){
                    if(dur.asSeconds() > moment.duration(isodur).asSeconds())
                      return {
                        valid:false,
                        message:'Início máximo em '+moment.duration(isodur,"minutes").format("H:mm:ss")
                      }
                  }
                  return true;
               },
              },
            }
          },
          video_date:{
            validators:{
              date:{
                format: 'DD/MM/YYYY',
                message: 'Informe uma data válida!'
              }
            }
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          submitButton: new FormValidation.plugins.SubmitButton(),
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
          icon: new FormValidation.plugins.Icon({
            valid: 'fv-ico ico-check',
            invalid: 'fv-ico ico-close',
            validating: 'fv-ico ico-gear ico-spin'
          }),
        },
    }).setLocale('pt_BR', FormValidation.locales.pt_BR);

    self.fv = [fv1, fv2];

  //  //FormValidation initialization
  //   self.fv = self.df.formValidation({
  //     locale: 'pt_BR',
  //     excluded: 'disabled',
  //     framework: 'bootstrap',
  //     icon: {
  //       valid: 'fv-ico ico-check',
  //       invalid: 'fv-ico ico-close',
  //       validating: 'fv-ico ico-gear ico-spin'
  //     },
  //     fields:{
  //     }
  //   })
  //   .on('err.field.fv', function(e, data) {
  //     if(self.fv.caller=='wizard'){
  //       //self.df.formValidation('enableFieldValidators','width',false);
  //       //self.df.formValidation('enableFieldValidators','height',false);
  //     }
  //   })
  //   .on('err.validator.fv', function(e, data) {
  //     data.element
  //         .data('fv.messages')
  //         .find('.help-block[data-fv-for="' + data.field + '"]').hide()
  //         .filter('[data-fv-validator="' + data.validator + '"]').show();
  //   });

    //Dropzone initialization
    Dropzone.autoDiscover = false;
    self.dz = new DropZoneLoader({
      id:'#custom-dropzone',
      autoProcessQueue	: false,
      thumbnailWidth: 680,
      thumbnailHeight: 340,
      copy_params:{
        original:true,
        sizes:{
         }
      },
      crop:{
        aspect_ratio_x:2,
        aspect_ratio_y:1
      },
      removedFile:function(file){
        //S
        // self.fv[0].updateFieldStatus('has_images', 'NotValidated');
      },
      onSuccess:function(file,ret){
        self.fv[1].revalidateField('imageorvideo');
        //self.df.formValidation('revalidateField','imageorvideo');
        //self.df.formValidation('revalidateField', 'has_images');
      }
    });

    //need to transform wizardActions in a method of Class
    self.wizardActions(function(){
      // self.imgOrVideoFv.revalidateField('imageorvideo');

      //criar função para calcular o aspectratio
      //let img_dim = getDimension(self);
      //self.dz.copy_params.sizes = img_dim;
      //self.dz.options.thumbnailHeight = img_dim.thumb.h;
      //self.dz.options.thumbnailWidth = img_dim.thumb.w;

      $("[name='__dz_images']").val(JSON.stringify(self.dz.getOrderedDataImages()));
      $("[name='__dz_copy_params']").val(JSON.stringify(self.dz.copy_params));

    });

    self.callbacks.view = view(self);
    self.callbacks.update.onSuccess = ()=>{
      self.tabs['listar'].tab.tab('show');
    }

    self.callbacks.create.onSuccess = ()=>{
      self.tabs['listar'].tab.tab('show');
    }

    self.callbacks.unload = self=>{
      self.dz.removeAllFiles(true);
    }

});//the end ??


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  ██╗      ██████╗  ██████╗ █████╗ ██╗         ███╗   ███╗███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ███████╗
  ██║     ██╔═══██╗██╔════╝██╔══██╗██║         ████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║   ██║██║     ███████║██║         ██╔████╔██║█████╗     ██║   ███████║██║   ██║██║  ██║███████╗
  ██║     ██║   ██║██║     ██╔══██║██║         ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║   ██║██║  ██║╚════██║
  ███████╗╚██████╔╝╚██████╗██║  ██║███████╗    ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝██████╔╝███████║
  ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function makeVideoThumbs(video,self){

  let container = $('.container-video-thumb');
  container.find('.video-thumb').remove();
  let new_div = $(document.createElement("div")).addClass('video-thumb d-flex');

  //se existe alguma foto na galeria, add a primeira
  if(self.dz.files.length){
    container.append(new_div.clone().on('click',function(){
        $(".video-thumb").removeClass('active');
        $(this).addClass('active');
      })
      .css({'background-image':"url("+($(self.dz.files[0].previewTemplate).find('[data-dz-thumbnail]').attr('src'))+")      "})
      .attrchange(function(attrName) {
        if(attrName == 'class'){
          if($(this).hasClass('active')){
            let bg = $(this).css('backgroundImage');
            $('#video_thumbnail').val(JSON.stringify({
              pos:$(this).attr('data-pos'),
              url:bg.substring(5,bg.lastIndexOf("\""))
            }));
          }
        }
      })
    );
  }

  //cria as thumbs de acordo com o retorno de data.thumbs
   //$('#video_start_at').attr('data-video-duration',null);
  video.thumbs.forEach(function(url,i){
    container.append(new_div.clone().on('click',function(){
      $(".video-thumb").removeClass('active');
      $(this).addClass('active');
    })
    .css({'backgroundImage':"url('"+(url)+"')"})
    .attrchange(function(attrName){
      if(attrName == 'class'){
        if($(this).hasClass('active')){
          let bg = $(this).css('backgroundImage');
          $('#video_thumbnail').val(JSON.stringify({
            pos:$(this).attr('data-pos'),
            url:bg.substring(5,bg.lastIndexOf("\""))
          }));
         }
      }
    }));
  });

  container.find('.video-thumb').first().addClass('active');
  container.find('.video-thumb').each(function(i,obj){
    $(obj).attr('data-pos',i);
  });
}

function getYoutubeVideoPromise(video,self){
  let _resolve = function(res){
    let player = $('#'+video.source+'-player');
    player.removeClass('d-none').attr('src',video.embed);

    let _ytp = new YT.Player('youtube-player',{
      events: {
        'onReady': function(_t){
          self.VPlayer = _t.target;
          self.VPlayer.__getCurrent = _t.target.getCurrentTime;
          self.VPlayer.__play = _t.target.playVideo;
          self.VPlayer.__pause = _t.target.pauseVideo;
        }
      }
    });

    video.infos = {
        title:res.data.items[0].snippet.title,
        description:res.data.items[0].snippet.description,
        duration:moment.duration(res.data.items[0].contentDetails.duration,'seconds').format('hh:mm:ss',{trim:false}),
      }
      for(let i=0;i<3;i++)
        video.thumbs.push('https://img.youtube.com/vi/'+video.id+'/'+i+'.jpg');
  }

  let _reject = function(res){
    videoUnload(self);
  }
  return new Promise((resolve,reject) => {
      //$('#embed-container-video').addClass('loading');
      $.ajax({
        url: ['https://www.googleapis.com/youtube/v3/videos',
              '?key=AIzaSyB2-i5P7MPuioxONBQOZwgC7vWEeJ4PnIo',
              '&part=snippet,contentDetails',
              '&id='+video.id
        ].join(''),
        type:'GET',
        success: function(ret){
            if(ret.items.length)
              resolve({state:true,data:ret,callback:_resolve});
            else
              reject({state:false,data:'o link informado está quebrado ou é inválido!',callback:_reject});
            },
            error: function(ret){
              reject({state:false,data:'o link informado está quebrado ou é inválido!',callback:_reject});
            }
          }).done(function(){
        });
      });
  }

function getFacebookVideoPromise(video,self){
  let _resolve = function(res){
    let player = $('#'+video.source+'-player');
    player.removeClass('d-none').attr('data-href',video.url);
    FB.XFBML.parse(document.getElementById('facebook-player').parentNode);
    self.VPlayer = null;
    FB.Event.subscribe('xfbml.ready', function(msg) {
      if (msg.type === 'video') {
        self.VPlayer = msg.instance;
        self.VPlayer.__getCurrent = msg.instance.getCurrentPosition;
        self.VPlayer.__play = msg.instance.play;
        self.VPlayer.__pause = msg.instance.pause;
      }
    });
    video.infos = {
      title:res.data.title,
      description:res.data.description,
      duration:moment.duration(parseInt(res.data.length),'seconds').format('hh:mm:ss'),
    }

    video.embed = video.embed+'&width='+res.data.format[0].width
    let max_video_number = (res.data.thumbnails.data.length>=3) ? 3 : res.data.thumbnails.data.length;
    for(let i=0;i<max_video_number;i++)
      video.thumbs.push(res.data.thumbnails.data[i].uri);
  }

  let _reject = function(res){
    videoUnload(self);
  }

  return new Promise((resolve,reject) => {
    FB.api(
      "/"+video.id+'?fields=thumbnails,description,length,embeddable,embed_html,format,title&access_token='+window.IntranetOne.social_media.facebook.long_token,
      function (ret){
        if(ret && !ret.error){
          resolve({state:true,data:ret,callback:_resolve});
        }
        else{
          if(ret.error.code == 100)
            reject({state:false,data:"O video deste link não permite sua utilização",callback:_reject});
          console.log('entrou no erro');
          reject({state:false,data:null,callback:_reject});
        }
      });

  });

}

function videoUnload(self){
  self.fv[1].revalidateField('imageorvideo');

  $('#embed-container-video').removeClass('loading');
  $('.vplayer').attr('src','').addClass('d-none');
  $('.vplayer').attr('data-href','').addClass('d-none');

  $('#video_start_at').val('00 : 00 : 00').attr('disabled','disabled');
//  $('#btn-get-current-time').attr('disabled','disabled');
  self.VPlayer = null;
  $('#video_start_at').data('plugin_wickedpicker')
  .setTime({hours:0,minutes:0,seconds:0});
  $('.container-video-thumb .video-thumb').remove();
  $('#video_title,#video_description, #video_data').val('');

  $('#video_start_at').attr('disabled','disabled');
  $('#btn-get-current-time').addClass('__disabled mouse-off');
  $('#video_data').val('');
}

function getVideoInfos(url){
  let rgx_youtube = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  let rgx_facebook = /^http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$/

  if(rgx_youtube.test(url))
    return {
      source:'youtube',
      id:url.match(rgx_youtube)[1],
      url:url,
      embed:[
        'https://www.youtube.com/embed/'+url.match(rgx_youtube)[1],
        '?enablejsapi=1',
        '&origin='+document.location.origin
      ].join(''),
      thumbs:[]
  }

  if(rgx_facebook.test(url)){
    let url_match = url.match(rgx_facebook);
    return {
        source:'facebook',
        id:url_match[2],
        url:url,
        embed:[
          'https://www.facebook.com/plugins/video.php',
          '?href=https%3A%2F%2Fwww.facebook.com%2F',
          url_match[1]+'%2Fvideos%2F'+url_match[2]
        ].join(''),
        thumbs:[]
      }
  }

    return {source:null,id:null,thumbs:[],embed:null,url:null};
}



function preview(param){
  alert('futuramente implementar uma vizualização com photoswipe');
  //var win = window.open(document.location.origin+'/reader/'+param.id+'/teste-preview', '_blank');
  //win.focus();
}
//CRUD CallBacks
function view(self){
  return{
      onSuccess:function(data){
        console.log(data);
        $("[name='name']").val(data.name);
        $("[name='url']").val(data.url);
        $("[name='date_start']").pickadate('picker').set('select',new Date(data.date_start));
        if(data.date_end!=null)
          $("[name='date_end']").pickadate('picker').set('select',new Date(data.date_end));
        $("[name='open_delay']").val(data.open_delay);
        $("[name='close_delay']").val(data.close_delay);
        $("[name='width']").val(data.width);
        $("[name='height']").val(data.height);

        $("#close_on_esc").aaToggle(!data.close_on_esc==0);

        //reload imagens
          self.dz.removeAllFiles(true);

          if(data.group!=null){
            self.dz.reloadImages(data);
          }

          if(data.video_id != null){
            $('#video_url').attr('data-loaded',JSON.stringify(data.video)).val(data.video.url);
            $('#video_url').attr('data-thumb',JSON.stringify(data.video.thumbnail));
            self.fv[1].revalidateField('video_url');

            if(data.video.date!=null)
              $("#video_date").pickadate('picker').set('select',new Date(data.video.date));

              let dur = moment.duration(data.video.start_at,'seconds');
              $('#video_start_at').val(dur.format('hh : mm : ss',{trim:false}));
              $('#video_start_at').data('plugin_wickedpicker').setTime({
                hours:dur._data.hours,
                minutes:dur._data.minutes,
                seconds:dur._data.seconds
              });
          }
          else{
            $('#video_url').removeAttr('data-loaded');
            $('#video_url').removeAttr('data-thumb');
          }
        },
        onError:function(self){
          console.log('executa algo no erro do callback');
      }
    }
}
