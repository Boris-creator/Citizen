<?php

use App\Http\Controllers\BuildingController;
use App\Http\Middleware\ValidateBuildingPosition;
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

Route::prefix('/buildings')->group(function () {
    Route::post('/create', function () {
        return app()->call([BuildingController::class, 'create']);
    })->middleware(ValidateBuildingPosition::class);
    Route::post('', function () {
        return app()->call([BuildingController::class, 'search']);
    });
    Route::post('/{buildingId}/interiors', [BuildingController::class, 'getInteriors']);
});
