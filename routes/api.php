<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Customer\CheckoutController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::post('/validate-delivery', [CheckoutController::class, 'validateDelivery']);

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add/{product}', [CartController::class, 'add']);
    Route::patch('/cart/update/{cartId}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{cartId}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders/{order}/track', [OrderController::class, 'track']);
});
