<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrustProxies::class, // Add this line
        ]);

        // Register aliases for middleware
        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);

        // You can also add middleware to specific groups if needed
        // $middleware->web([
        //     // Add web middleware here
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
