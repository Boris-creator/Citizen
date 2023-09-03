<?php

use App\Http\Controllers\BuildingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'authenticate']);

Route::middleware('auth:sanctum')->
    prefix('/buildings')->
    group(function () {
        Route::post('/create', function () {
            return app()->call([BuildingController::class, 'create']);
        });
        Route::post('', function () {
            return app()->call([BuildingController::class, 'search']);
        });
        Route::post('/{buildingId}/interiors', [BuildingController::class, 'getInteriors']);
        Route::delete('/{buildingId}', [BuildingController::class, 'destroy']);
});
