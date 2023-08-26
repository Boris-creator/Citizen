<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private string $buildingsTable = 'buildings';
    private string $interiorsTable = 'interiors';
    private string $buildingsInteriorsTable = 'building_interior';
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create($this->buildingsInteriorsTable, function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('building_id');
            $table->unsignedBigInteger('interior_id');
            $table->foreign('building_id')->references('id')->on($this->buildingsTable)->onDelete('cascade');
            $table->foreign('interior_id')->references('id')->on($this->interiorsTable)->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists($this->buildingsInteriorsTable);
    }
};
