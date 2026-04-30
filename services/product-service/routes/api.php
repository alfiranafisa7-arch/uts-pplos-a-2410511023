<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;

Route::get('/health', function () {
    return response()->json(['status' => 'Product Service OK']);
});

Route::apiResource('products', ProductController::class);
Route::post('/products/{id}/reduce-stock', [ProductController::class, 'reduceStock']);
Route::apiResource('categories', CategoryController::class);