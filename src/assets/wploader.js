'use strict';
let mix = require('laravel-mix');

<<<<<<< HEAD
function IOGallery(params={}){
  let $ = this;
  let dep = {
    gallery: 'node_modules/intranetone-gallery/src/',
=======
function IOPopup(params={}){
  let $ = this;
  let dep = {
    popup: 'node_modules/intranetone-popup/src/',
>>>>>>> fe/popup added
    moment: 'node_modules/moment/',
    sortable: 'node_modules/sortablejs/',
    cropper: 'node_modules/cropperjs/dist/',
    jquerycropper: 'node_modules/jquery-cropper/dist/',
    dropzone: 'node_modules/dropzone/dist/',
<<<<<<< HEAD
=======
    moment: 'node_modules/moment/',
    momentdf: 'node_modules/moment-duration-format/lib/',
    wickedpicker: 'node_modules/dv-wickedpicker/dist/',
>>>>>>> fe/popup added
  }

  let config = {
    optimize:false,
    sass:false,
<<<<<<< HEAD
=======
    fe:true,
>>>>>>> fe/popup added
    cb:()=>{},
  }
  
  this.compile = (IO,callback = ()=>{})=>{

    mix.styles([
      IO.src.css + 'helpers/dv-buttons.css',
      IO.src.io.css + 'dropzone.css',
      IO.src.io.css + 'dropzone-preview-template.css',
      IO.src.io.vendors + 'aanjulena-bs-toggle-switch/aanjulena-bs-toggle-switch.css',
      IO.src.io.css + 'sortable.css',
      IO.dep.io.toastr + 'toastr.min.css',
      IO.src.io.css + 'toastr.css',
<<<<<<< HEAD
      dep.cropper + 'cropper.css',
      dep.gallery + 'gallery.css',
    ], IO.dest.io.root + 'services/io-gallery.min.css');

=======
      IO.src.io.root + 'forms/video-form.css',
      dep.popup + 'popup.css',
    ], IO.dest.io.root + 'services/io-popup.min.css');
    
>>>>>>> fe/popup added
    mix.babel([
      dep.sortable + 'Sortable.min.js',
      IO.src.io.vendors + 'aanjulena-bs-toggle-switch/aanjulena-bs-toggle-switch.js',
      IO.dep.io.toastr + 'toastr.min.js',
      IO.src.io.js + 'defaults/def-toastr.js',
      dep.dropzone + 'dropzone.js',
      IO.src.io.js + 'dropzone-loader.js',
<<<<<<< HEAD
    ], IO.dest.io.root + 'services/io-gallery-babel.min.js');
=======
      dep.wickedpicker + 'wickedpicker.min.js',
    ], IO.dest.io.root + 'services/io-popup-babel.min.js');
>>>>>>> fe/popup added
    
    mix.scripts([
      dep.moment + 'min/moment.min.js',
      IO.src.io.vendors + 'moment/moment-pt-br.js',
      dep.cropper + 'cropper.js',
      dep.jquerycropper + 'jquery-cropper.js',
<<<<<<< HEAD
    ], IO.dest.io.root + 'services/io-gallery-mix.min.js');

    //copy separated for compatibility
    mix.babel(dep.gallery + 'gallery.js', IO.dest.io.root + 'services/io-gallery.min.js');
    
=======
      dep.moment + 'min/moment.min.js',
      IO.src.io.vendors + 'moment/moment-pt-br.js',
      dep.momentdf +'moment-duration-format.js',
    ], IO.dest.io.root + 'services/io-popup-mix.min.js');

    //copy separated for compatibility
    mix.babel(dep.popup + 'popup.js', IO.dest.io.root + 'services/io-popup.min.js');

    if(config.fe){
      mix.styles([
        dep.popup + 'fe-popup.css',
      ], IO.dest.css + 'fe-popup.min.css');
    }

>>>>>>> fe/popup added
    callback(IO);
  }
}


<<<<<<< HEAD
module.exports = IOGallery;
=======
module.exports = IOPopup;
>>>>>>> fe/popup added
