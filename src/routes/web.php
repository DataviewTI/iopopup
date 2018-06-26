<?php

Route::group(['prefix' => 'admin', 'middleware' => ['web','admin'], 'as' => 'admin.'],function(){
    Route::group(['prefix' => 'popup'], function () {
    Route::get('/','PopupController@index');
    Route::post('create', 'PopupController@create');
    Route::get('teste', 'PopupController@teste');
    Route::get('list', 'PopupController@list');
    Route::get('view/{id}', 'PopupController@view');
    Route::post('update/{id}', 'PopupController@update');
    Route::get('delete/{id}', 'PopupController@delete');			
  });
});
