<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('building_bargains', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->decimal('price');
            $table->unsignedBigInteger('seller_id')->nullable();
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('building_id')->constrained('buildings');
            $table->foreign('seller_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('building_bargains');
    }
};
