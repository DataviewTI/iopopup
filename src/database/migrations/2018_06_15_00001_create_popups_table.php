<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePopupsTable extends Migration
{
    public function up()
    {
			Schema::create('popups', function(Blueprint $table)
			{
				$table->increments('id');
				$table->string('name');
				$table->string('url')->nullable();
				$table->dateTime('date_start');
        $table->dateTime('date_end')->nullable();
        $table->smallInteger('open_delay')->unsigned()->nullable();
        $table->smallInteger('close_delay')->unsigned()->nullable();
        $table->boolean('close_on_esc')->default(false);
        $table->smallInteger('width')->unsigned()->nullable();
        $table->smallInteger('height')->unsigned()->nullable();
        $table->integer('group_id')->unsigned()->nullable();
        $table->integer('video_id')->unsigned()->nullable();
        $table->timestamps();
				$table->softDeletes();
        $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade')->onUpdate('cascade');
        $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade')->onUpdate('cascade');
			});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('popups');
    }
}
