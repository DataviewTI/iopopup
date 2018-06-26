new IOService({
    name:'Gallery',
  },
  function(self){

    //mututor observer for attributes
    $('#featured').attrchange(function(attrName) {
      if(attrName == 'aria-pressed'){
        $('#__featured').val($(this).attr('aria-pressed'));
      }
    });

    $('#img_original').attrchange(function(attrName) {
      if(attrName == 'aria-pressed'){
        $('#__img_original').val($(this).attr('aria-pressed'));
        self.dz.copy_params.original = $(this).attr('aria-pressed')=='true';
      }
    });


    $('#add_dimension').on("click",function(e){
      e.preventDefault();
      self.fv.caller = 'dimensions';
      self.df.formValidation('enableFieldValidators','img_prefix',true);
      self.df.formValidation('enableFieldValidators','img_largura',true);
      self.df.formValidation('enableFieldValidators','img_altura',true);
      self.df.formValidation('validateContainer',$('#dimension_container'));

      if(self.wz.keys.fv.isValidContainer($('#dimension_container')))
        addDimension(
          {
            self:self,
            prefixo:$('#img_prefix').val(),
            largura:$('#img_largura').val(),
            altura:$('#img_altura').val(),
          })
      });


    Sortable.create(document.getElementById('custom-dropzone'),{
      animation: 250,
      handle: ".dz-reorder",
    });

    ['__sl-box-left-1','__sl-box-left-2','__sl-box-left-3','__sl-main-group'].forEach(function(obj){
      if(document.getElementById(obj)!=null)
        Sortable.create(document.getElementById(obj),{
          handle: ".__sl-handle",
          animation: 250,
          group:"sl-categories",
          onAdd: function (evt) {
            var item = evt.item;
            self.df.formValidation('revalidateField', '__cat_subcats');
          },
          sort:false,
        });
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
        
        self.df.formValidation('revalidateField', 'date_start');
    });
  
    $('#date_end').pickadate({
      formatSubmit: 'yyyy-mm-dd 00:00:00',
      min: new Date(),
      onClose:function(){
        $("[name='description']").focus();
      }
    }).pickadate('picker').on('render', function(){
      self.df.formValidation('revalidateField', 'date_end');
    });


    //Datatables initialization
    
    FormValidation.Validator.checkPrefix = {
      validate: function(validator, $field, options){

        let prfs = self.dimensions_dt.columns(0).data().toArray()[0];

        if(prfs.includes($field.val().toLowerCase()))
          return {
              valid: false,
              message: 'O Prefixo já existe'
          }

          return {
              valid: true,
          }
      }
    }
  
    FormValidation.Validator.thumbPrefix = {
      validate: function(validator, $field, options){
        let prfs = self.dimensions_dt.columns(0).data().toArray()[0];
        if(!prfs.includes("thumb"))
        return {
            valid: false,
            message: 'Prefixo thumb é obrigatório'
        }
          return {
              valid: true,
          }
      }
    }


    self.dt = $('#default-table').DataTable({
      aaSorting:[ [0,"desc" ]],
      ajax: self.path+'/list',
      initComplete:function(){
        //parent call
        let api = this.api();
        this.teste = 10;
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

        api.addDTSelectFilter([
          {el:$('#ft_featured'),column:'featured'},
          //verificar cats e subcats durante os filtros, tem que fazer outras N verificações
          {el:$('#ft_category'),column:'categories',format:"|{{value}}|"},
          {el:$('#ft_subcategory'),column:'categories',format:"|{{value}}|"},
        ]);

        $("#ft_category").change(function(e){
          if($(this).val()=='') 
            $("#ft_subcategory").prop('disabled','disabled').find('option').remove().end();
          else
            $.ajax({
              url:'/categories/list/'+$(this).val(),
              dataType: "json",
              success: function(data){
              if(data.length>0){
                  $("#ft_subcategory").removeAttr('disabled');
                  let arr = [{value:'',text:''}];
                  $.each(data, function (i, item) {
                    arr.push({value:item.id,text:item.category});
                  });
                  refreshSelect($("#ft_subcategory"),arr);
                }
                else
                  $("#ft_subcategory").prop('disabled','disabled').find('option').remove();
              }
            });	
        });
                  
      },
      footerCallback:function(row, data, start, end, display){
      },
      columns: [
        { data: 'id', name: 'id'},
        { data: 'null', name: 'null'},
        { data: 'title', name: 'title'},
        { data: 'date_start', name: 'date_start'},
        { data: 'date_end', name: 'date_end'},
        { data: 'group', name: 'group'},
        { data: 'categories', name: 'categories'},
        { data: 'featured', name: 'featured'},
        { data: 'actions', name: 'actions'},
      ],
      columnDefs:
      [
        {targets:'__dt_',width: "3%",class:"text-center",searchable: true,orderable:true},
        {targets:'__dt_c',width:"2%",searchable: true, orderable:false,className:"text-center",render:function(data,type,row){
          var data = row['categories'];
          var cats=[];
          data.forEach(function(c){
            cats.push(c.category);
            if(c.parent!='' && c.parent!= null && !cats.includes(c.maincategory.category))
              cats.push(c.maincategory.category)
          });
          
          return self.dt.addDTIcon({ico:'ico-structure-2',title:"<span class = 'text-left'>"+(cats.join('<br>'))+"</span>",value:1,pos:'right',_class:'text-primary text-normal',html:true}
            );
        }
      },
      {targets:'__dt_titulo',searchable: true,orderable:true},
      {targets:'__dt_dt-inicial',type:'date-br',width: "9%",orderable:true,className:"text-center",
        render:function(data,type,row){
          return moment(data).format('DD/MM/YYYY');
        }
      },
      {targets:'__dt_dt-final',type:'date-br',width: "9%",orderable:true,className:"text-center",
      render:function(data,type,row){
        if(data!==null)
          return moment(data).format('DD/MM/YYYY');
        else
          return "";
      }
    },
    {targets:'__dt_s',width: "2%",orderable:false,className:"text-center",render:function(data,type,row){
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
    {targets:'__dt_cats',visible:false,render:function(data,type,row){
        var cats=[];
        data.forEach(function(c){
          cats.push(c.id);
          if(c.parent!='' && c.parent!= null && !cats.includes(c.parent.id))
            cats.push(c.parent.id)
        });
        return  '|'+cats.join('|')+'|';
      }
    },
    {targets:'__dt_f',width: "2%",orderable:true,className:"text-center",render:function(data,type,row){
        if(data)
          return self.dt.addDTIcon({ico:'ico-star',value:1,title:'galeria destaque',pos:'left',_class:'text-info'});
        else
          return self.dt.addDTIcon({value:0,_class:'invisible'});
      }
    },
    {targets:'__dt_acoes',width:"7%",className:"text-center",searchable:false,orderable:false,render:function(data,type,row,y){
            return self.dt.addDTButtons({
              buttons:[
                {ico:'ico-eye',_class:'text-primary',title:'preview'},
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
    

    self.dimensions_dt = $('#__dimensions').DataTable({
      "paging":   false,
      "info":false,
      "ordering":false,
      initComplete:function(){
        let api = this.api();
        api.row.add([
          'thumb',
          '240',
          '180',
          null
          ],
        ).draw(true);

       let img_dim = getDimension(self);
       self.dz.options.thumbnailHeight = img_dim.thumb.h ||180;
       self.dz.options.thumbnailWidth = img_dim.thumb.w || 240;
      },
      columnDefs:
      [
        {targets:'__dt_prefixo',class:"text-center", orderable:false},
        {targets:'__dt_largura',width: "10%",class:"text-center"},
        {targets:'__dt_altura',width: "10%",class:"text-center"},
        {targets:'__dt_acoes',width:"7%",className:"text-center",searchable:false,
        orderable:false,render:function(data,type,row,y){
            if(row[0] !== 'thumb')
              return self.dt.addDTButtons({
                buttons:[
                  {ico:'ico-trash',_class:'text-danger',title:'excluir'},
                ]});
              else
              return self.dt.addDTButtons({
                buttons:[
                  {ico:'ico-edit',_class:'text-info',title:'editar'},
                ]});
          }
        }      
      ]
    })
    .on('click','.ico-trash',function(){
      self.dimensions_dt.row($(this).parents('tr')).remove().draw();
    })
    .on('click','.ico-edit',function(){
      var data = self.dimensions_dt.row($(this).parents('tr')).data();
      $('#add_dimension').addClass('d-none');
      $('#img_prefix').val(data[0]).attr('disabled','disabled');
      $('#thumb_edit').removeClass('d-none');
      $('#cancel_thumb_edit').removeClass('d-none');
      $('#img_altura').val(data[2]);
      $('#img_largura').val(data[1]).focus();
    });

    $('#cancel_thumb_edit').on("click",function(){
      $('#add_dimension').removeClass('d-none');
      $('#img_prefix').val('').removeAttr('disabled');
      $('#thumb_edit').addClass('d-none');
      $('#cancel_thumb_edit').addClass('d-none');
      $('#img_largura').val('');
      $('#img_altura').val('');
      $('#img_prefix').focus();
      self.df.formValidation('updateStatus','img_largura','NOT_VALIDATED');
      self.df.formValidation('updateStatus','img_altura','NOT_VALIDATED');
      self.df.formValidation('updateStatus','img_prefix','NOT_VALIDATED');
    });

    $('#thumb_edit').on("click",function(e){
      e.preventDefault();
      self.fv.caller = 'dimensions';
      self.df.formValidation('enableFieldValidators','img_prefix',false);
      self.df.formValidation('enableFieldValidators','img_largura',true);
      self.df.formValidation('enableFieldValidators','img_altura',true);
      self.df.formValidation('validateContainer',$('#dimension_container'));

      if(self.wz.keys.fv.isValidContainer($('#dimension_container'))){
        self.dz.copy_params.sizes.thumb.w = $('#img_largura').val();
        self.dz.copy_params.sizes.thumb.h = $('#img_altura').val();
        self.dz.options.thumbnailHeight = $('#img_altura').val();
        self.dz.options.thumbnailWidth = $('#img_largura').val();
        let data = self.dimensions_dt.row(0).data();
        data[1] = $('#img_largura').val();
        data[2] = $('#img_altura').val();
        self.dimensions_dt.row(0).data(data);
        $('#cancel_thumb_edit').trigger('click');
      }
    });


    //FormValidation initialization
    self.fv = self.df.formValidation({
      locale: 'pt_BR',
      excluded: 'disabled',
      framework: 'bootstrap',  
      icon: {
        valid: 'fv-ico ico-check',
        invalid: 'fv-ico ico-close',
        validating: 'fv-ico ico-gear ico-spin'
      },
      fields:{
        title:{
          validators:{
            notEmpty:{
              message: 'O título da galeria é obrigatório!'
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
        date_end:{
          validators:{
            date:{
              format: 'DD/MM/YYYY',
              message: 'Informe uma data válida!'
            }
          }
        },
        __cat_subcats:{
          validators:{
            callback:{
              message: 'A galeria deve ter no mínimo uma categoria vinculada!',
              callback: function(value, validator, $field){
                return $('#__sl-main-group button.list-group-item').length > 0;
              }
            }
          }
        },
        has_images:{
          validators:{
            callback:{
              message: 'A galeria deve ter no mínimo uma imagem!',
              callback: function(value, validator, $field){
                
                if(self.dz.files.length>0)
                  return true
                
                toastr["error"]("A galeria deve conter no mínimo uma imagem!")
                
                return false;
              }
            }
          }
        },
        'img_prefix':{
          enabled:false,
          validators:{
              checkPrefix:{
              },
              thumbPrefix:{
              },
              notEmpty:{
                message: 'Informe o prefíxo da imagem!'
              }
          }
        },
        'img_altura':{
          enabled:false,
          validators:{
            notEmpty:{
              message: 'Informe a Altura'
            },
            greaterThan: {
              value: 1,
              message: 'Alt. Mínima 1px',
            },
            lessThan: {
              value: 4000,
              message: 'Alt. Máxima 4000px',
            }
          }
        },
        'img_largura':{
          enabled:false,
          validators:{
            notEmpty:{
              message: 'Informe a Largura'
            },
            greaterThan: {
              value: 1,
              message: 'Larg. Mínima 1px',
            },
            lessThan: {
              value: 4000,
              message: 'Larg. Máxima 4000px',
            }
          }
        },
      }
    })
    .on('err.field.fv', function(e, data) {
      if(self.fv.caller=='wizard'){
        self.df.formValidation('enableFieldValidators','img_prefix',false);
        self.df.formValidation('enableFieldValidators','img_largura',false);
        self.df.formValidation('enableFieldValidators','img_altura',false);
      }
    })
    .on('err.validator.fv', function(e, data) {
      data.element
          .data('fv.messages')
          .find('.help-block[data-fv-for="' + data.field + '"]').hide()
          .filter('[data-fv-validator="' + data.validator + '"]').show();
    });

    //Dropzone initialization
    Dropzone.autoDiscover = false;
    self.dz = new DropZoneLoader({
      id:'#custom-dropzone',
      autoProcessQueue	: false,
      thumbnailWidth: 240,
      thumbnailHeight: 180,
      copy_params:{
        original:true,
        sizes:{
         }
      },
      removedFile:function(file){
        self.df.formValidation('updateStatus','has_images', 'NOT_VALIDATED')
      },
      onSuccess:function(file,ret){
        self.df.formValidation('revalidateField', 'has_images');
      }
    });

    // modal window template
    var modalTemplate = `
    <div class="modal crop-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content" style="">
                <div class="modal-header">
                    <h5 class="modal-title">Ajuste da Imagem</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" style=""> 
                    <div class="row">
                        <div class="col-12">
                            <div class="image-container" style="height: 60vh"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="row w-100">
                        <div class="col-6 pl-0">
                            <div class="btn-group" role="group" aria-label="Basic example">
                                <button type="button" class="btn btn-default rotate-left"><i class="ico ico-rotate-left"></i></button>
                                <button type="button" class="btn btn-default rotate-right"><i class="ico ico-rotate-right"></i></button>
                            </div>

                            <div class="btn-group" role="group" aria-label="Basic example">
                                <button type="button" class="btn btn-default zoom-in"><i class="ico ico-zoom-in"></i></button>
                                <button type="button" class="btn btn-default zoom-out"><i class="ico ico-zoom-out"></i></button>
                            </div>
                        </div>
                        <div class="col-6 d-flex justify-content-end">
                            <button type="button" class="btn btn-primary crop-upload" style="margin-right: 5px;">Salvar</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if(window.IntranetOne.gallery != undefined && window.IntranetOne.gallery.crop.activate){
      // listen to thumbnail event to trigger crop actions
      self.dz.on('thumbnail', function (file) {
        if(file.upload != undefined){
          // ignore files which were already cropped and re-rendered
          // to prevent infinite loop
          if (file.cropped) {
              return;
          }
          // cache filename to re-assign it to cropped file
          var cachedFilename = file.name;
          // remove not cropped file from dropzone (we will replace it later)
          self.dz.removeFile(file);
          
          // dynamically create modals to allow multiple files processing
          var $cropperModal = $(modalTemplate);
          // 'Crop and Upload' button in a modal
          var $uploadCrop = $cropperModal.find('.crop-upload');
          var $zoomIn = $cropperModal.find('.zoom-in');
          var $zoomOut = $cropperModal.find('.zoom-out');
          var $rotateLeft = $cropperModal.find('.rotate-left');
          var $rotateRight = $cropperModal.find('.rotate-right');

          var $img = $('<img style="max-width: 100%;"/>');

          // initialize FileReader which reads uploaded file
          var reader = new FileReader();
          reader.onloadend = function () { 
              // add uploaded and read image to modal
              $cropperModal.find('.image-container').html($img);
              $img.attr('src', reader.result);

              // initialize cropper for uploaded image
              var aspecRatio = window.IntranetOne.gallery.crop.aspect_ratio_x / window.IntranetOne.gallery.crop.aspect_ratio_y;
              $img.cropper({
                  viewMode: 0, 
                  aspectRatio: aspecRatio,
                  // autoCropArea: 1,
                  movable: false,
                  cropBoxResizable: true,
                  // minContainerWidth: 850
              });
          };
          // read uploaded file (triggers code above)
          reader.readAsDataURL(file);

          $cropperModal.modal('show');

          // listener for 'Crop and Upload' button in modal
          $uploadCrop.on('click', function() {
              // get cropped image data
              var blob = $img.cropper('getCroppedCanvas').toDataURL();
              // transform it to Blob object
              var newFile = dataURItoBlob(blob);
              // set 'cropped to true' (so that we don't get to that listener again)
              newFile.cropped = true;
              // assign original filename
              newFile.name = cachedFilename;

              // add cropped file to dropzone
              self.dz.addFile(newFile);
              // upload cropped file with dropzone
              self.dz.processQueue();
              $cropperModal.modal('hide');
          });

          $zoomIn.on('click', function() {
            var cropper = $img.data('cropper');
            cropper.zoom(0.1);
          });

          $zoomOut.on('click', function() {
            var cropper = $img.data('cropper');
            cropper.zoom(-0.1);
          });

          $rotateLeft.on('click', function() {
            var cropper = $img.data('cropper');
            cropper.rotate(-90);
          });

          $rotateRight.on('click', function() {
            var cropper = $img.data('cropper');
            cropper.rotate(90);
          });  
        }
      });
    }

    //need to transform wizardActions in a method of Class
    self.wizardActions(function(){
       let img_dim = getDimension(self);
       self.dz.copy_params.sizes = img_dim;
       self.dz.options.thumbnailHeight = img_dim.thumb.h;
       self.dz.options.thumbnailWidth = img_dim.thumb.w;

      $("[name='__dz_images']").val(JSON.stringify(self.dz.getOrderedDataImages()));
      $("[name='__dz_copy_params']").val(JSON.stringify(self.dz.copy_params));

      var cats = getCatAndSubCats();
      $('#__cat_subcats').val(cats);
      $(document.createElement('input')).prop('type','hidden').prop('name','main_cat').val(cats[0]).appendTo(self.df);
    });

    self.callbacks.view = view(self);
    self.callbacks.update.onSuccess = function(){
      self.tabs['listar'].tab.tab('show');
    }

    self.callbacks.create.onSuccess = function(){
      self.tabs['listar'].tab.tab('show');
    }

    self.callbacks.unload = function(self){
      $(".aanjulena-btn-toggle").aaDefaultState();

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
function addDimension(p){
  p.self.dimensions_dt.row.add([
      p.prefixo,
      p.largura,
      p.altura,
      null
    ],
  ).draw(true);
  
  $('#img_largura').val('');
  $('#img_altura').val('');
  $('#img_prefix').val('').focus();
  p.self.df.formValidation('updateStatus','img_largura','NOT_VALIDATED');
  p.self.df.formValidation('updateStatus','img_altura','NOT_VALIDATED');
  p.self.df.formValidation('updateStatus','img_prefix','NOT_VALIDATED');
}

function getDimension(self){
  let rows = self.dimensions_dt.rows().data().toArray();
  let sizes = {};
  rows.forEach(function(obj,i){
    sizes[obj[0]] = {'w':obj[1],'h':obj[2]}
  });
  return sizes;
}


function getCatAndSubCats(){
	var arr=[];
	$('#__sl-main-group button').each(function(a,b){
		var cat = $(b).attr('__val');
		var subcat = $(b).attr('__cat');
		arr.push(cat);
	});
	return arr;
}

function getCategories(param){
  $.ajax({
    url:'categories/list/'+(param.id||''),
    dataType: "json",
    success: function(ret){
      param.callback(ret)
    }
  });	
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
        $("[name='title']").val(data.title);
        $("[name='description']").val(data.description);
        $("[name='date_start']").pickadate('picker').set('select',new Date(data.date_start));
        if(data.date_end!=null)
          $("[name='date_end']").pickadate('picker').set('select',new Date(data.date_end));
        $("#featured").aaToggle(data.featured);


          //reload imagens 
          self.dz.removeAllFiles(true);

          //zera as categorias no unload
          let attrcats = []; 
          data.categories.forEach(function(obj){
            attrcats.push(obj.id)
          });
           
          attrcats.forEach(function(i){
            $('.__sortable-list').not('#__sl-main-group').find(".list-group-item[__val='"+i+"']")
            .appendTo($('#__sl-main-group'));
          });
          self.df.formValidation('revalidateField','__cat_subcats');
          
          //zera a tabela de dimensões e atualiza
          let __sizes = JSON.parse(data.group.sizes.replace(/&quot;/g,'"'));
          self.dimensions_dt.clear().draw();
          for(let s in __sizes.sizes){
            addDimension(
              {
                self:self,
                prefixo:s,
                largura:__sizes.sizes[s].w,
                altura:__sizes.sizes[s].h,
              })
          };

          if(data.group!=null){
            self.dz.reloadImages(data);
          }
        },
        onError:function(self){
          console.log('executa algo no erro do callback');
      }
    }
}


// transform cropper dataURI output to a Blob which Dropzone accepts
function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'image/jpeg' });
}